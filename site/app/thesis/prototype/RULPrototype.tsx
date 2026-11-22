"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";

type TreeNode = {
  nodeid: number;
  split?: string;
  split_condition?: number;
  yes?: number;
  no?: number;
  missing?: number;
  leaf?: number;
  children?: TreeNode[];
};

type ModelArtifact = {
  name: string;
  version: string;
  generated: string;
  model_type: string;
  purpose: string;
  source: { dataset: string; rows: number; sha256: string };
  features: string[];
  target: string;
  aliases: Record<string, string[]>;
  feature_stats: Record<string, { min: number; max: number; median: number; mean: number }>;
  feature_importance: Record<string, number>;
  training: {
    configuration: Record<string, number>;
    internal_random_holdout: { rmse: number; mae: number; r2: number };
    warning: string;
  };
  thesis_benchmark: {
    lstm: { rmse: number; mae: number; r2: number };
    xgboost: { rmse: number; mae: number; r2: number };
    note: string;
  };
  base_score: number;
  trees: TreeNode[];
};

type ParsedRow = Record<string, string>;
type NumericRow = Record<string, number>;

type PredictionRow = {
  source: ParsedRow;
  cycle: number;
  predicted: number;
  actual: number | null;
  health: number;
  risk: "Healthy" | "Monitor" | "Plan service" | "Critical";
};

type ColumnProfile = {
  name: string;
  kind: "numeric" | "timestamp" | "text";
  complete: number;
  unique: number;
  min: number | null;
  max: number | null;
  mean: number | null;
};

type Analysis = {
  mode: "rul" | "telemetry" | "generic";
  fileName: string;
  rows: number;
  columns: number;
  rawRows: ParsedRow[];
  profiles: ColumnProfile[];
  plotColumn: string | null;
  plotValues: number[];
  matched: Record<string, string>;
  predictions: PredictionRow[];
  latest: PredictionRow | null;
  inputFitness: number;
  completeness: number;
  rangeFitness: number;
  duplicates: number;
  monotonicViolations: number;
  warnings: string[];
  validation: { rmse: number; mae: number; r2: number } | null;
};

const MAX_ROWS = 100_000;

function normalized(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[._()\-\/]+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(value.trim());
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }
  row.push(value.trim());
  if (row.some((cell) => cell !== "")) rows.push(row);
  return rows;
}

function profileColumns(headers: string[], rows: ParsedRow[]): ColumnProfile[] {
  return headers.map((name) => {
    const present = rows.map((row) => row[name]).filter((value) => value !== undefined && value !== "");
    const numeric = present.map(Number).filter(Number.isFinite);
    const timestampCount = present.reduce((count, value) => count + (Number.isFinite(Date.parse(value)) ? 1 : 0), 0);
    const numericShare = numeric.length / Math.max(1, present.length);
    const timestampShare = timestampCount / Math.max(1, present.length);
    const kind: ColumnProfile["kind"] = numericShare >= 0.6 ? "numeric" : timestampShare >= 0.6 ? "timestamp" : "text";
    return {
      name,
      kind,
      complete: present.length / Math.max(1, rows.length),
      unique: new Set(present).size,
      min: kind === "numeric" && numeric.length ? numeric.reduce((value, item) => Math.min(value, item), Number.POSITIVE_INFINITY) : null,
      max: kind === "numeric" && numeric.length ? numeric.reduce((value, item) => Math.max(value, item), Number.NEGATIVE_INFINITY) : null,
      mean: kind === "numeric" && numeric.length ? numeric.reduce((sum, value) => sum + value, 0) / numeric.length : null,
    };
  });
}

function preferredPlotColumn(profiles: ColumnProfile[]) {
  const numeric = profiles.filter((profile) => profile.kind === "numeric");
  const priorities = ["power", "voltage", "current", "temperature", "temp", "capacity", "rul", "cycle"];
  return priorities.map((term) => numeric.find((profile) => normalized(profile.name).includes(term))).find(Boolean) ?? numeric[0] ?? null;
}

function findNode(node: TreeNode, id: number): TreeNode | undefined {
  if (node.nodeid === id) return node;
  for (const child of node.children ?? []) {
    const match = findNode(child, id);
    if (match) return match;
  }
  return undefined;
}

function evaluateTree(node: TreeNode, row: NumericRow): number {
  let current = node;
  while (current.leaf === undefined) {
    const value = current.split ? row[current.split] : Number.NaN;
    const target = !Number.isFinite(value)
      ? current.missing
      : value < (current.split_condition ?? 0)
        ? current.yes
        : current.no;
    const next = target === undefined ? undefined : findNode(current, target);
    if (!next) return 0;
    current = next;
  }
  return current.leaf;
}

function predict(model: ModelArtifact, row: NumericRow) {
  return Math.max(
    0,
    model.base_score + model.trees.reduce((sum, tree) => sum + evaluateTree(tree, row), 0),
  );
}

function riskFor(health: number, rul: number): PredictionRow["risk"] {
  if (rul <= 40 || health <= 8) return "Critical";
  if (rul <= 120 || health <= 20) return "Plan service";
  if (health <= 45) return "Monitor";
  return "Healthy";
}

function metrics(actual: number[], predicted: number[]) {
  if (actual.length < 2) return null;
  const errors = actual.map((value, index) => value - predicted[index]);
  const mae = errors.reduce((sum, value) => sum + Math.abs(value), 0) / errors.length;
  const rmse = Math.sqrt(errors.reduce((sum, value) => sum + value * value, 0) / errors.length);
  const mean = actual.reduce((sum, value) => sum + value, 0) / actual.length;
  const ssRes = errors.reduce((sum, value) => sum + value * value, 0);
  const ssTot = actual.reduce((sum, value) => sum + (value - mean) ** 2, 0);
  return { rmse, mae, r2: ssTot ? 1 - ssRes / ssTot : 0 };
}

function chartPath(values: number[], width: number, height: number, min: number, max: number) {
  if (!values.length) return "";
  const range = max - min || 1;
  return values
    .map((value, index) => {
      const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${index ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function download(name: string, contents: string, type: string) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([contents], { type }));
  link.download = name;
  link.click();
  URL.revokeObjectURL(link.href);
}

function escapeCSV(value: unknown) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export default function RULPrototype() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [model, setModel] = useState<ModelArtifact | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [dragging, setDragging] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/models/nayeem-rul-xgboost.json")
      .then((response) => {
        if (!response.ok) throw new Error("The deployed model could not be loaded.");
        return response.json();
      })
      .then(setModel)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Model loading failed."));
  }, []);

  async function inspectFile(file?: File) {
    if (!file || !model) return;
    setError("");
    setWorking(true);
    await new Promise((resolve) => window.setTimeout(resolve, 20));
    try {
      if (!file.name.toLowerCase().endsWith(".csv")) throw new Error("Please choose a CSV file.");
      if (file.size > 20 * 1024 * 1024) throw new Error("The CSV is larger than the 20 MB browser limit.");
      const matrix = parseCSV(await file.text());
      if (matrix.length < 2) throw new Error("The CSV needs a header and at least one data row.");
      const headers = matrix[0].map((header, index) => header || `Column ${index + 1}`);
      const rawRows = matrix.slice(1, MAX_ROWS + 1).map((cells) =>
        Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])),
      );
      const profiles = profileColumns(headers, rawRows);
      const plotProfile = preferredPlotColumn(profiles);
      const plotValues = plotProfile
        ? rawRows.map((row) => Number(row[plotProfile.name])).filter(Number.isFinite)
        : [];

      const headerLookup = new Map(headers.map((header) => [normalized(header), header]));
      const matched: Record<string, string> = {};
      for (const canonical of [...model.features, model.target]) {
        const candidates = [canonical, ...(model.aliases[canonical] ?? [])];
        const found = candidates.map(normalized).map((candidate) => headerLookup.get(candidate)).find(Boolean);
        if (found) matched[canonical] = found;
      }
      const matchedFeatures = Object.keys(matched).filter((name) => model.features.includes(name)).length;
      const canRunRul = Boolean(matched.Cycle_Index && matchedFeatures >= 3);
      if (!canRunRul) {
        const telemetryTerms = ["time", "timestamp", "voltage", "current", "temperature", "temp", "power", "capacity", "step"];
        const telemetryMatches = headers.filter((header) => telemetryTerms.some((term) => normalized(header).includes(term))).length;
        const missingCells = profiles.reduce((sum, profile) => sum + (1 - profile.complete), 0);
        const warnings: string[] = [];
        if (matrix.length - 1 > MAX_ROWS) warnings.push(`Only the first ${MAX_ROWS.toLocaleString()} rows were analysed.`);
        if (!plotProfile) warnings.push("No predominantly numeric column was found, so a signal chart cannot be drawn.");
        warnings.push("RUL inference was not run because this file does not contain enough thesis-model features.");
        setAnalysis({
          mode: telemetryMatches >= 2 ? "telemetry" : "generic",
          fileName: file.name,
          rows: rawRows.length,
          columns: headers.length,
          rawRows,
          profiles,
          plotColumn: plotProfile?.name ?? null,
          plotValues,
          matched,
          predictions: [],
          latest: null,
          inputFitness: 0,
          completeness: Math.max(0, 1 - missingCells / Math.max(1, profiles.length)),
          rangeFitness: 0,
          duplicates: 0,
          monotonicViolations: 0,
          warnings,
          validation: null,
        });
        return;
      }

      let missingValues = 0;
      let consideredValues = 0;
      let inRange = 0;
      const numericRows = rawRows.map((source) => {
        const values: NumericRow = {};
        for (const feature of model.features) {
          const raw = matched[feature] ? Number(source[matched[feature]]) : Number.NaN;
          consideredValues += 1;
          if (!Number.isFinite(raw)) missingValues += 1;
          const value = Number.isFinite(raw) ? raw : model.feature_stats[feature].median;
          values[feature] = value;
          if (value >= model.feature_stats[feature].min && value <= model.feature_stats[feature].max) inRange += 1;
        }
        return values;
      });

      const predictions = numericRows.map((values, index) => {
        const predicted = predict(model, values);
        const cycle = values.Cycle_Index;
        const totalLife = Math.max(1, cycle + predicted);
        const health = Math.max(0, Math.min(100, (predicted / totalLife) * 100));
        const actualRaw = matched.RUL ? Number(rawRows[index][matched.RUL]) : Number.NaN;
        const actual = Number.isFinite(actualRaw) ? actualRaw : null;
        return {
          source: rawRows[index],
          cycle,
          predicted,
          actual,
          health,
          risk: riskFor(health, predicted),
        };
      });
      predictions.sort((a, b) => a.cycle - b.cycle);

      const cycleCounts = new Map<number, number>();
      predictions.forEach((row) => cycleCounts.set(row.cycle, (cycleCounts.get(row.cycle) ?? 0) + 1));
      const duplicates = [...cycleCounts.values()].reduce((sum, count) => sum + Math.max(0, count - 1), 0);
      const actualSeries = predictions.filter((row) => row.actual !== null);
      const monotonicViolations = actualSeries.reduce((count, row, index) => {
        if (!index) return count;
        return count + ((row.actual ?? 0) > (actualSeries[index - 1].actual ?? 0) ? 1 : 0);
      }, 0);
      const actual = actualSeries.map((row) => row.actual as number);
      const predictedForActual = actualSeries.map((row) => row.predicted);
      const completeness = 1 - missingValues / Math.max(1, consideredValues);
      const rangeFitness = inRange / Math.max(1, consideredValues);
      const schemaFitness = Object.keys(matched).filter((name) => model.features.includes(name)).length / model.features.length;
      const inputFitness = Math.round((schemaFitness * 0.45 + completeness * 0.35 + rangeFitness * 0.2) * 100);
      const warnings: string[] = [];
      if (matrix.length - 1 > MAX_ROWS) warnings.push(`Only the first ${MAX_ROWS.toLocaleString()} rows were analysed.`);
      if (schemaFitness < 1) warnings.push("Missing model features were filled with training-data medians; interpret the estimate cautiously.");
      if (rangeFitness < 0.9) warnings.push("Some measurements fall outside the training-data range.");
      if (duplicates) warnings.push(`${duplicates} duplicate cycle indices were detected.`);
      if (monotonicViolations) warnings.push(`${monotonicViolations} increases in recorded RUL were detected after cycle sorting.`);
      if (!matched.RUL) warnings.push("No RUL target was supplied, so uploaded-file accuracy metrics cannot be calculated.");

      setAnalysis({
        mode: "rul",
        fileName: file.name,
        rows: predictions.length,
        columns: headers.length,
        rawRows,
        profiles,
        plotColumn: plotProfile?.name ?? null,
        plotValues,
        matched,
        predictions,
        latest: predictions[predictions.length - 1],
        inputFitness,
        completeness,
        rangeFitness,
        duplicates,
        monotonicViolations,
        warnings,
        validation: metrics(actual, predictedForActual),
      });
    } catch (reason) {
      setAnalysis(null);
      setError(reason instanceof Error ? reason.message : "The CSV could not be analysed.");
    } finally {
      setWorking(false);
    }
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    void inspectFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void inspectFile(event.dataTransfer.files?.[0]);
  }

  const chart = useMemo(() => {
    if (!analysis || analysis.mode !== "rul") return null;
    const sampled = analysis.predictions.filter((_, index, rows) => index % Math.max(1, Math.ceil(rows.length / 350)) === 0);
    const predicted = sampled.map((row) => row.predicted);
    const actual = sampled.map((row) => row.actual).filter((value): value is number => value !== null);
    const all = [...predicted, ...actual];
    const min = Math.min(...all);
    const max = Math.max(...all);
    return {
      predicted: chartPath(predicted, 900, 280, min, max),
      actual: actual.length === sampled.length ? chartPath(actual, 900, 280, min, max) : "",
      min,
      max,
      firstCycle: sampled[0]?.cycle ?? 0,
      lastCycle: sampled[sampled.length - 1]?.cycle ?? 0,
    };
  }, [analysis]);

  const genericChart = useMemo(() => {
    if (!analysis || analysis.mode === "rul" || !analysis.plotValues.length) return null;
    const sampled = analysis.plotValues.filter((_, index, values) => index % Math.max(1, Math.ceil(values.length / 350)) === 0);
    const min = sampled.reduce((value, item) => Math.min(value, item), Number.POSITIVE_INFINITY);
    const max = sampled.reduce((value, item) => Math.max(value, item), Number.NEGATIVE_INFINITY);
    return { path: chartPath(sampled, 900, 280, min, max), min, max };
  }, [analysis]);

  function exportAnalysedCSV() {
    if (!analysis) return;
    const originalHeaders = Object.keys(analysis.predictions[0].source);
    const headers = [...originalHeaders, "Predicted_RUL", "Estimated_Health_Percent", "Risk_Category"];
    const body = analysis.predictions.map((row) => [
      ...originalHeaders.map((header) => row.source[header]),
      row.predicted.toFixed(3),
      row.health.toFixed(2),
      row.risk,
    ]);
    download(
      `${analysis.fileName.replace(/\.csv$/i, "")}-rul-analysis.csv`,
      [headers, ...body].map((row) => row.map(escapeCSV).join(",")).join("\n"),
      "text/csv;charset=utf-8",
    );
  }

  function exportReport() {
    if (!analysis || !model) return;
    download(
      `${analysis.fileName.replace(/\.csv$/i, "")}-${analysis.mode === "rul" ? "rul" : "data-quality"}-report.json`,
      JSON.stringify(
        {
          generated: new Date().toISOString(),
          prototype: model.name,
          modelVersion: model.version,
          file: analysis.fileName,
          analysisMode: analysis.mode,
          rows: analysis.rows,
          columns: analysis.columns,
          columnProfiles: analysis.profiles,
          previewSignal: analysis.plotColumn,
          matchedColumns: analysis.matched,
          inputFitness: analysis.inputFitness,
          latestEstimate: analysis.latest,
          uploadedTargetValidation: analysis.validation,
          warnings: analysis.warnings,
          limitation: model.purpose,
        },
        null,
        2,
      ),
      "application/json;charset=utf-8",
    );
  }

  const topFeatures = model
    ? Object.entries(model.feature_importance).sort((a, b) => b[1] - a[1]).slice(0, 5)
    : [];

  return (
    <main className="rul-lab">
      <header className="rul-nav">
        <a className="rul-brand" href="/thesis/prototype"><img src="/battery-rul-lab-logo.png" alt=""/><span><b>BATTERY RUL LAB</b><small>Research prototype by Nayeem Faisal</small></span></a>
        <nav aria-label="Prototype navigation"><a href="#analyser">Analyser</a><a href="#method">Method</a><a href="#limits">Limits</a></nav>
        <a className="rul-back" href="/thesis">Thesis home</a>
      </header>

      <section className="rul-hero">
        <div className="rul-hero-copy">
          <div className="rul-hero-lockup"><img src="/battery-rul-lab-logo.png" alt="Battery RUL Lab emblem"/><span>100,000-row analysis capacity</span></div>
          <p className="rul-kicker">INTERACTIVE RESEARCH PROTOTYPE · NAYEEM FAISAL</p>
          <h1>Turn battery-cycle CSV data into a <em>RUL health report.</em></h1>
          <p>Upload any CSV for structural and signal analysis. Files matching the thesis battery schema also receive RUL estimation, degradation visualisation, maintenance-risk classification, and exportable results.</p>
          <div className="rul-hero-actions"><a href="#analyser">Open analyser</a><a href="/data/battery-rul-sample.csv" download>Download sample CSV</a></div>
        </div>
        <aside className="rul-model-card">
          <span className={model ? "is-ready" : ""}>{model ? "MODEL READY" : "LOADING MODEL"}</span>
          <strong>{model?.model_type ?? "XGBoost regression"}</strong>
          <dl><div><dt>Training rows</dt><dd>{model?.source.rows.toLocaleString() ?? "—"}</dd></div><div><dt>Trees</dt><dd>{model?.trees.length ?? "—"}</dd></div><div><dt>Processing</dt><dd>In your browser</dd></div></dl>
          <p>No uploaded CSV is transmitted or stored by the website.</p>
        </aside>
      </section>

      <section className="rul-analyser" id="analyser">
        <header><p className="rul-kicker">UNIVERSAL CSV ANALYSER</p><h2>Upload. Inspect. Test.</h2><p>Every CSV receives a data-quality profile. The thesis RUL model runs only when enough compatible battery features are present.</p></header>
        <div
          className={`rul-dropzone ${dragging ? "is-dragging" : ""} ${working ? "is-working" : ""}`}
          onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") inputRef.current?.click(); }}
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept=".csv,text/csv" onChange={onFileChange} hidden />
          <div className="rul-upload-icon" aria-hidden="true"><i/><i/><i/></div>
          <div><strong>{working ? "Analysing the battery record…" : "Drop your battery CSV here"}</strong><p>or choose a file · maximum 20 MB · up to 100,000 rows</p></div>
          <button type="button" disabled={!model || working}>{working ? "Working" : "Choose CSV"}</button>
        </div>
        {error && <p className="rul-error" role="alert">{error}</p>}
        <div className="rul-schema"><span>Optional RUL prediction schema</span>{model?.features.map((feature) => <code key={feature}>{feature}</code>)}</div>
      </section>

      {analysis && analysis.mode === "rul" && analysis.latest && model && chart && <>
        <section className="rul-results" aria-live="polite">
          <header><div><p className="rul-kicker">LATEST CYCLE ESTIMATE</p><h2>{analysis.fileName}</h2></div><span className={`rul-risk rul-risk-${analysis.latest.risk.toLowerCase().replace(" ", "-")}`}>{analysis.latest.risk}</span></header>
          <div className="rul-result-grid">
            <article className="rul-primary-stat"><span>Estimated remaining life</span><strong>{Math.round(analysis.latest.predicted)}</strong><small>cycles · research estimate</small></article>
            <article><span>Estimated health</span><strong>{analysis.latest.health.toFixed(1)}%</strong><small>RUL ÷ estimated total cycle life</small></article>
            <article><span>Input fitness</span><strong>{analysis.inputFitness}%</strong><small>{analysis.inputFitness >= 85 ? "Strong schema and range match" : analysis.inputFitness >= 60 ? "Usable with caution" : "Low compatibility"}</small></article>
            <article><span>Latest cycle</span><strong>{Math.round(analysis.latest.cycle)}</strong><small>{analysis.rows.toLocaleString()} rows analysed</small></article>
          </div>
          <div className="rul-guidance"><b>Maintenance guidance</b><p>{analysis.latest.risk === "Critical" ? "Arrange inspection and replacement planning immediately. Do not use this prototype as the only safety decision." : analysis.latest.risk === "Plan service" ? "Plan a technical inspection and replacement window. Continue monitoring each new cycle." : analysis.latest.risk === "Monitor" ? "Increase monitoring frequency and track whether predicted RUL declines consistently." : "Continue normal monitoring and retain periodic cycle records for trend comparison."}</p></div>
        </section>

        <section className="rul-chart-section">
          <header><div><p className="rul-kicker">DEGRADATION TRACE</p><h2>RUL across uploaded cycles.</h2></div><div className="rul-legend"><span><i className="predicted"/>Predicted RUL</span>{chart.actual && <span><i className="actual"/>Recorded RUL</span>}</div></header>
          <div className="rul-chart-wrap">
            <div className="rul-y-labels"><span>{Math.round(chart.max)}</span><span>{Math.round((chart.max + chart.min) / 2)}</span><span>{Math.round(chart.min)}</span></div>
            <svg className="rul-chart" viewBox="0 0 900 280" role="img" aria-label="Predicted and recorded remaining useful life by cycle"><path className="rul-grid-line" d="M0 1H900M0 140H900M0 279H900"/><path className="rul-predicted-line" d={chart.predicted}/>{chart.actual && <path className="rul-actual-line" d={chart.actual}/>}</svg>
            <div className="rul-x-labels"><span>Cycle {Math.round(chart.firstCycle)}</span><span>Cycle {Math.round(chart.lastCycle)}</span></div>
          </div>
        </section>

        <section className="rul-diagnostics">
          <div className="rul-quality-panel">
            <p className="rul-kicker">INPUT DIAGNOSTICS</p><h2>What the analyser found.</h2>
            <dl><div><dt>Recognised features</dt><dd>{Object.keys(analysis.matched).filter((key) => model.features.includes(key)).length} / {model.features.length}</dd></div><div><dt>Numeric completeness</dt><dd>{(analysis.completeness * 100).toFixed(1)}%</dd></div><div><dt>Training-range fit</dt><dd>{(analysis.rangeFitness * 100).toFixed(1)}%</dd></div><div><dt>Duplicate cycles</dt><dd>{analysis.duplicates}</dd></div><div><dt>RUL increases</dt><dd>{analysis.monotonicViolations}</dd></div></dl>
            {analysis.warnings.length ? <ul>{analysis.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : <p className="rul-all-clear">No structural warning was detected.</p>}
          </div>
          <div className="rul-validation-panel">
            <p className="rul-kicker">UPLOADED TARGET CHECK</p><h2>{analysis.validation ? "Prediction versus supplied RUL." : "Add RUL for validation."}</h2>
            {analysis.validation ? <div className="rul-live-metrics"><article><span>RMSE</span><strong>{analysis.validation.rmse.toFixed(2)}</strong></article><article><span>MAE</span><strong>{analysis.validation.mae.toFixed(2)}</strong></article><article><span>R²</span><strong>{analysis.validation.r2.toFixed(4)}</strong></article></div> : <p>If your CSV includes a recognised RUL column, this panel calculates metrics on the uploaded rows. Without RUL, the tool can estimate but cannot measure accuracy.</p>}
            <div className="rul-export"><button onClick={exportAnalysedCSV}>Download analysed CSV</button><button onClick={exportReport}>Download JSON report</button></div>
          </div>
        </section>

        <section className="rul-table-section">
          <header><p className="rul-kicker">RECENT PREDICTIONS</p><h2>The final uploaded cycles.</h2></header>
          <div className="rul-table-wrap"><table><thead><tr><th>Cycle</th><th>Predicted RUL</th>{analysis.predictions.some((row) => row.actual !== null) && <th>Recorded RUL</th>}<th>Health</th><th>Risk</th></tr></thead><tbody>{analysis.predictions.slice(-8).reverse().map((row, index) => <tr key={`${row.cycle}-${index}`}><td>{Math.round(row.cycle)}</td><td>{row.predicted.toFixed(1)}</td>{analysis.predictions.some((item) => item.actual !== null) && <td>{row.actual === null ? "—" : row.actual.toFixed(1)}</td>}<td>{row.health.toFixed(1)}%</td><td>{row.risk}</td></tr>)}</tbody></table></div>
        </section>
      </>}

      {analysis && analysis.mode !== "rul" && <section className="rul-universal" aria-live="polite">
        <header><div><p className="rul-kicker">{analysis.mode === "telemetry" ? "TELEMETRY DATASET" : "UNIVERSAL CSV PROFILE"}</p><h2>{analysis.fileName}</h2></div><span>PROFILE READY</span></header>
        <div className="rul-universal-stats"><article><span>Rows analysed</span><strong>{analysis.rows.toLocaleString()}</strong></article><article><span>Columns</span><strong>{analysis.columns}</strong></article><article><span>Numeric signals</span><strong>{analysis.profiles.filter((profile) => profile.kind === "numeric").length}</strong></article><article><span>Data completeness</span><strong>{(analysis.completeness * 100).toFixed(1)}%</strong></article></div>
        <div className="rul-mode-note"><b>SAFE ANALYSIS MODE</b><p>This CSV does not match enough thesis-model inputs for a defensible RUL estimate. The prototype has still profiled its structure, signal ranges, completeness and cardinality without inventing missing battery features.</p></div>
        {genericChart && <div className="rul-generic-chart"><div><p className="rul-kicker">SIGNAL PREVIEW</p><h3>{analysis.plotColumn}</h3></div><div className="rul-chart-wrap"><div className="rul-y-labels"><span>{genericChart.max.toFixed(2)}</span><span>{((genericChart.max + genericChart.min) / 2).toFixed(2)}</span><span>{genericChart.min.toFixed(2)}</span></div><svg className="rul-chart" viewBox="0 0 900 280" role="img" aria-label={`${analysis.plotColumn} signal across uploaded rows`}><path className="rul-grid-line" d="M0 1H900M0 140H900M0 279H900"/><path className="rul-predicted-line" d={genericChart.path}/></svg><div className="rul-x-labels"><span>First row</span><span>Last row</span></div></div></div>}
        <div className="rul-profile-table"><table><thead><tr><th>Column</th><th>Detected type</th><th>Complete</th><th>Unique</th><th>Minimum</th><th>Maximum</th><th>Mean</th></tr></thead><tbody>{analysis.profiles.map((profile) => <tr key={profile.name}><td>{profile.name}</td><td>{profile.kind}</td><td>{(profile.complete * 100).toFixed(1)}%</td><td>{profile.unique.toLocaleString()}</td><td>{profile.min === null ? "—" : profile.min.toFixed(3)}</td><td>{profile.max === null ? "—" : profile.max.toFixed(3)}</td><td>{profile.mean === null ? "—" : profile.mean.toFixed(3)}</td></tr>)}</tbody></table></div>
        {analysis.warnings.length > 0 && <ul className="rul-generic-warnings">{analysis.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>}
        <div className="rul-export"><button onClick={exportReport}>Download data-quality report</button></div>
      </section>}

      <section className="rul-method" id="method">
        <header><p className="rul-kicker">HOW THE PROTOTYPE WORKS</p><h2>A transparent path from CSV to estimate.</h2></header>
        <ol><li><b>01</b><h3>Recognise</h3><p>Columns are classified as numeric, timestamp, or text and matched to known battery and telemetry aliases.</p></li><li><b>02</b><h3>Validate</h3><p>Completeness, uniqueness, signal ranges, duplicates, monotonicity, and model compatibility are checked.</p></li><li><b>03</b><h3>Infer safely</h3><p>XGBoost RUL inference runs only when the CSV contains enough thesis-model features; other files stay in profiling mode.</p></li><li><b>04</b><h3>Interpret</h3><p>The prototype presents either a battery-health report or a transparent universal CSV quality report.</p></li></ol>
        <div className="rul-importance"><div><p className="rul-kicker">MODEL SIGNAL</p><h3>Relative feature importance</h3><p>Gain importance from the deployed prototype model. High importance is not proof of physical causation.</p></div><div>{topFeatures.map(([feature, value]) => <div key={feature}><span>{feature}</span><i><b style={{ width: `${Math.max(3, value * 100)}%` }}/></i><strong>{(value * 100).toFixed(1)}%</strong></div>)}</div></div>
      </section>

      <section className="rul-benchmarks">
        <header><p className="rul-kicker">THESIS BENCHMARK EVIDENCE</p><h2>Recorded experiment, clearly separated from live inference.</h2></header>
        <div><article><span>LSTM · THESIS RESULT</span><strong>{model?.thesis_benchmark.lstm.r2.toFixed(4)}</strong><p>R² · RMSE {model?.thesis_benchmark.lstm.rmse.toFixed(3)} · MAE {model?.thesis_benchmark.lstm.mae.toFixed(3)}</p></article><article><span>XGBOOST · THESIS RESULT</span><strong>{model?.thesis_benchmark.xgboost.r2.toFixed(4)}</strong><p>R² · RMSE {model?.thesis_benchmark.xgboost.rmse.toFixed(3)} · MAE {model?.thesis_benchmark.xgboost.mae.toFixed(3)}</p></article><article><span>WEB MODEL · INTERNAL CHECK</span><strong>{model?.training.internal_random_holdout.r2.toFixed(4)}</strong><p>R² · RMSE {model?.training.internal_random_holdout.rmse.toFixed(3)} · MAE {model?.training.internal_random_holdout.mae.toFixed(3)}</p></article></div>
        <p>{model?.training.warning}</p>
      </section>

      <section className="rul-limits" id="limits"><div><p className="rul-kicker">RESPONSIBLE USE</p><h2>Research prototype—not a certified battery-management system.</h2></div><div><p>The estimate is suitable for demonstrations, exploratory analysis and research discussion. It is not sufficient for safety-critical replacement decisions, warranty decisions, medical systems, aviation, vehicles or industrial control.</p><ul><li>Validate against independent batteries and chemistries.</li><li>Use device-level or chronological testing before deployment.</li><li>Combine predictions with physical inspection and BMS alarms.</li><li>Track uncertainty, sensor drift and out-of-distribution inputs.</li></ul></div></section>

      <footer className="rul-footer"><a href="/thesis">NF / THESIS 2026</a><p>Battery RUL research prototype by Nayeem Faisal</p><a href="#analyser">Analyse another CSV</a></footer>
    </main>
  );
}
