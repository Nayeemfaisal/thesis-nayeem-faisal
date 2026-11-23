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
const MAX_FILE_BYTES = 512 * 1024 ** 3;

async function readCSVSample(file: File, maxRows: number) {
  const reader = file.stream().getReader();
  const decoder = new TextDecoder();
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  let pendingQuote = false;
  let skipLineFeed = false;
  let bytesRead = 0;
  let sampled = false;

  const finishRow = () => {
    row.push(value.trim());
    if (row.some((cell) => cell !== "")) rows.push(row);
    row = [];
    value = "";
  };

  outer: while (rows.length < maxRows + 1) {
    const chunk = await reader.read();
    if (chunk.done) break;
    bytesRead += chunk.value.byteLength;
    const text = decoder.decode(chunk.value, { stream: true });
    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      if (skipLineFeed) {
        skipLineFeed = false;
        if (char === "\n") continue;
      }
      if (pendingQuote) {
        pendingQuote = false;
        if (char === '"') {
          value += '"';
          continue;
        }
        quoted = false;
      }
      if (char === '"') {
        if (quoted) pendingQuote = true;
        else quoted = true;
      } else if (char === "," && !quoted) {
        row.push(value.trim());
        value = "";
      } else if ((char === "\n" || char === "\r") && !quoted) {
        if (char === "\r") skipLineFeed = true;
        finishRow();
        if (rows.length >= maxRows + 1) {
          sampled = bytesRead < file.size || index < text.length - 1;
          break outer;
        }
      } else {
        value += char;
      }
    }
  }

  if (!sampled) {
    value += decoder.decode();
    if (value || row.length) finishRow();
  } else {
    await reader.cancel();
  }
  return { matrix: rows.slice(0, maxRows + 1), sampled, bytesRead };
}

function normalized(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[._()\-\/]+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

function riskLabel(risk: PredictionRow["risk"]) {
  return {
    Healthy: "Gut",
    Monitor: "Beobachten",
    "Plan service": "Wartung planen",
    Critical: "Kritisch",
  }[risk];
}

function columnKindLabel(kind: ColumnProfile["kind"]) {
  return { numeric: "Numerisch", timestamp: "Zeitstempel", text: "Text" }[kind];
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
        if (!response.ok) throw new Error("Das bereitgestellte Modell konnte nicht geladen werden.");
        return response.json();
      })
      .then(setModel)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Das Laden des Modells ist fehlgeschlagen."));
  }, []);

  async function inspectFile(file?: File) {
    if (!file || !model) return;
    setError("");
    setWorking(true);
    await new Promise((resolve) => window.setTimeout(resolve, 20));
    try {
      if (!file.name.toLowerCase().endsWith(".csv")) throw new Error("Bitte wählen Sie eine CSV-Datei aus.");
      if (file.size > MAX_FILE_BYTES) throw new Error("Die CSV-Datei überschreitet die Dateigrenze von 512 GB.");
      const { matrix, sampled } = await readCSVSample(file, MAX_ROWS);
      if (matrix.length < 2) throw new Error("Die CSV-Datei benötigt eine Kopfzeile und mindestens eine Datenzeile.");
      const headers = matrix[0].map((header, index) => header || `Spalte ${index + 1}`);
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
        if (sampled) warnings.push(`Diese große Datei wurde blockweise gelesen. Die ersten ${MAX_ROWS.toLocaleString("de-DE")} Zeilen wurden analysiert, ohne die gesamte Datei in den Arbeitsspeicher zu laden.`);
        if (!plotProfile) warnings.push("Es wurde keine überwiegend numerische Spalte gefunden; deshalb kann kein Signaldiagramm dargestellt werden.");
        warnings.push("Es wurde keine RUL-Prognose ausgeführt, weil die Datei nicht genügend Merkmale des Thesis-Modells enthält.");
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
      if (sampled) warnings.push(`Diese große Datei wurde blockweise gelesen. Die ersten ${MAX_ROWS.toLocaleString("de-DE")} Zeilen wurden analysiert, ohne die gesamte Datei in den Arbeitsspeicher zu laden.`);
      if (schemaFitness < 1) warnings.push("Fehlende Modellmerkmale wurden mit Medianwerten der Trainingsdaten ergänzt; die Schätzung ist daher vorsichtig zu interpretieren.");
      if (rangeFitness < 0.9) warnings.push("Einige Messwerte liegen außerhalb des Wertebereichs der Trainingsdaten.");
      if (duplicates) warnings.push(`${duplicates} doppelte Zyklusindizes wurden erkannt.`);
      if (monotonicViolations) warnings.push(`${monotonicViolations} Anstiege der aufgezeichneten RUL wurden nach der Zyklussortierung erkannt.`);
      if (!matched.RUL) warnings.push("Es wurde kein RUL-Zielwert bereitgestellt; deshalb können keine Genauigkeitskennzahlen für die hochgeladene Datei berechnet werden.");

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
      setError(reason instanceof Error ? reason.message : "Die CSV-Datei konnte nicht analysiert werden.");
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
      riskLabel(row.risk),
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
    <main className="rul-lab" lang="de">
      <header className="rul-nav">
        <a className="rul-brand" href="/thesis/prototype"><img src="/battery-rul-lab-logo.png" alt=""/><span><b>BATTERIE-RUL-LABOR</b><small>Forschungsprototyp von Nayeem Faisal</small></span></a>
        <nav aria-label="Navigation des Prototyps"><a href="#analyser">Analysator</a><a href="#guide">Benutzerhandbuch</a><a href="#method">Methode</a><a href="#limits">Grenzen</a></nav>
        <a className="rul-back" href="/thesis">Thesis-Startseite</a>
      </header>

      <section className="rul-hero">
        <div className="rul-hero-copy">
          <div className="rul-hero-lockup"><img src="/battery-rul-lab-logo.png" alt="Emblem des Batterie-RUL-Labors"/><span>Bis zu 512 GB Dateigröße · Analyse von 100.000 Zeilen</span></div>
          <p className="rul-kicker">INTERAKTIVER FORSCHUNGSPROTOTYP · NAYEEM FAISAL</p>
          <h1>Batteriezyklusdaten als <em>RUL-Zustandsbericht.</em></h1>
          <p>Laden Sie eine beliebige CSV-Datei zur Struktur- und Signalanalyse hoch. Dateien, die dem Batterieschema der Thesis entsprechen, erhalten zusätzlich eine RUL-Schätzung, eine Visualisierung der Degradation, eine Wartungsrisikoklasse und exportierbare Ergebnisse.</p>
          <div className="rul-hero-actions"><a href="#analyser">Analysator öffnen</a><a href="/data/battery-rul-sample.csv" download>Beispiel-CSV herunterladen</a></div>
        </div>
        <aside className="rul-model-card">
          <span className={model ? "is-ready" : ""}>{model ? "MODELL BEREIT" : "MODELL WIRD GELADEN"}</span>
          <strong>{model?.model_type ?? "XGBoost-Regression"}</strong>
          <dl><div><dt>Trainingszeilen</dt><dd>{model?.source.rows.toLocaleString("de-DE") ?? "—"}</dd></div><div><dt>Bäume</dt><dd>{model?.trees.length ?? "—"}</dd></div><div><dt>Verarbeitung</dt><dd>Im Browser</dd></div></dl>
          <p>Die hochgeladene CSV-Datei wird weder übertragen noch von der Website gespeichert.</p>
        </aside>
      </section>

      <section className="rul-analyser" id="analyser">
        <header><p className="rul-kicker">UNIVERSELLER CSV-ANALYSATOR</p><h2>Hochladen. Prüfen. Auswerten.</h2><p>Jede CSV-Datei erhält ein Datenqualitätsprofil. Das RUL-Modell der Thesis wird nur ausgeführt, wenn genügend kompatible Batteriemerkmale vorhanden sind.</p></header>
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
          <div><strong>{working ? "Datensatz wird gelesen und analysiert…" : "CSV-Datensatz hier ablegen"}</strong><p>oder Datei auswählen · maximal 512 GB · blockweise Analyse von bis zu 100.000 Zeilen</p></div>
          <button type="button" disabled={!model || working}>{working ? "Wird verarbeitet" : "CSV auswählen"}</button>
        </div>
        {error && <p className="rul-error" role="alert">{error}</p>}
        <div className="rul-schema"><span>Optionales Schema für die RUL-Prognose</span>{model?.features.map((feature) => <code key={feature}>{feature}</code>)}</div>
      </section>

      <section className="rul-user-guide" id="guide">
        <header>
          <div><p className="rul-kicker">HANDBUCH FÜR EXTERNE TESTPERSONEN</p><h2>Von der CSV-Datei zum nachvollziehbaren Ergebnis.</h2></div>
          <p>Dieser Anwendungsfall richtet sich an Professorinnen und Professoren, Forschende, Studierende sowie externe Prüfende, die den Prototyp zum ersten Mal verwenden. Es sind weder ein Konto noch eine Installation oder ein Datenupload auf einen Server erforderlich.</p>
        </header>
        <div className="rul-use-case">
          <aside>
            <span>ANWENDUNGSFALL</span>
            <h3>Unabhängige Prüfung von Batteriedaten</h3>
            <dl><div><dt>Akteur</dt><dd>Externe Testperson</dd></div><div><dt>Eingabe</dt><dd>Ein CSV-Datensatz</dd></div><div><dt>Ziel</dt><dd>Qualität prüfen und ein belastbares Ergebnis erhalten</dd></div><div><dt>Datenschutz</dt><dd>Lokale Verarbeitung im Browser</dd></div></dl>
            <a href="/data/battery-rul-sample.csv" download>Test-CSV herunterladen</a>
          </aside>
          <ol>
            <li><b>Datei vorbereiten</b><p>Verwenden Sie eine kommagetrennte <code>.csv</code>-Datei mit einer Kopfzeile. Der Analysator akzeptiert Dateien bis 512 GB und liest höchstens die ersten 100.000 Datenzeilen blockweise ein.</p></li>
            <li><b>Datensatz auswählen</b><p>Wählen Sie oben <strong>CSV auswählen</strong> oder ziehen Sie die Datei in den Upload-Bereich. Warten Sie, bis Dateiname und Ergebnisse erscheinen. Die Datei verbleibt im Browser.</p></li>
            <li><b>Analysemodus bestätigen</b><p><strong>Schätzung des letzten Zyklus</strong> bedeutet, dass das Thesis-Modell genügend Batteriemerkmale erkannt hat. <strong>Telemetriedatensatz</strong> oder <strong>Universelles CSV-Profil</strong> bedeutet, dass das Werkzeug eine Qualitätsanalyse durchgeführt hat, ohne RUL-Werte zu erfinden.</p></li>
            <li><b>Hauptergebnis lesen</b><p>Prüfen Sie bei einer kompatiblen Batteriedatei die geschätzten verbleibenden Zyklen, den geschätzten Zustand, die Eingabeeignung, den letzten Zyklus und die Wartungsrisikoklasse.</p></li>
            <li><b>Nachweise prüfen</b><p>Prüfen Sie Degradationsverlauf, erkannte Spalten, Vollständigkeit, Übereinstimmung mit dem Trainingsbereich, Duplikate und Warnungen sowie – falls eine echte RUL-Spalte vorhanden ist – RMSE, MAE und R².</p></li>
            <li><b>Exportieren und dokumentieren</b><p>Laden Sie für eine modellkompatible Datei die analysierte CSV-Datei und den JSON-Bericht herunter. Bei allgemeinen Datensätzen können Sie den Datenqualitätsbericht exportieren. Dokumentieren Sie jede Warnung zusammen mit dem Ergebnis.</p></li>
          </ol>
        </div>
        <div className="rul-result-key">
          <div><span>AUSGABE A</span><h3>RUL-Zustandsbericht</h3><p>Erscheint, wenn <code>Cycle_Index</code> und mindestens drei erkannte Thesis-Merkmale vorhanden sind. Enthalten sind Prognose, Zustand, Risiko, Diagnostik, Diagramme und Exporte.</p></div>
          <div><span>AUSGABE B</span><h3>Telemetrieprofil</h3><p>Erscheint bei Zeit-, Spannungs-, Strom-, Temperatur-, Leistungs-, Kapazitäts- oder ähnlichen Signalen. Angezeigt werden Struktur, Wertebereiche, Vollständigkeit und eine Signalvorschau.</p></div>
          <div><span>AUSGABE C</span><h3>Universelles Profil</h3><p>Erscheint bei jeder anderen gültigen CSV-Datei. Der Bericht zeigt erkannte Datentypen, eindeutige Werte, fehlende Daten, numerische Statistiken, Warnungen und einen exportierbaren Bericht.</p></div>
        </div>
        <div className="rul-guide-actions"><a href="#analyser">CSV-Test starten</a><a href="/data/battery-rul-sample.csv" download>Geprüftes Beispiel verwenden</a></div>
      </section>

      {analysis && analysis.mode === "rul" && analysis.latest && model && chart && <>
        <section className="rul-results" aria-live="polite">
          <header><div><p className="rul-kicker">SCHÄTZUNG DES LETZTEN ZYKLUS</p><h2>{analysis.fileName}</h2></div><span className={`rul-risk rul-risk-${analysis.latest.risk.toLowerCase().replace(" ", "-")}`}>{riskLabel(analysis.latest.risk)}</span></header>
          <div className="rul-result-grid">
            <article className="rul-primary-stat"><span>Geschätzte Restlebensdauer</span><strong>{Math.round(analysis.latest.predicted)}</strong><small>Zyklen · Forschungsschätzung</small></article>
            <article><span>Geschätzter Zustand</span><strong>{analysis.latest.health.toFixed(1)}%</strong><small>RUL ÷ geschätzte gesamte Zyklenlebensdauer</small></article>
            <article><span>Eingabeeignung</span><strong>{analysis.inputFitness}%</strong><small>{analysis.inputFitness >= 85 ? "Hohe Schema- und Bereichsübereinstimmung" : analysis.inputFitness >= 60 ? "Mit Vorsicht verwendbar" : "Geringe Kompatibilität"}</small></article>
            <article><span>Letzter Zyklus</span><strong>{Math.round(analysis.latest.cycle)}</strong><small>{analysis.rows.toLocaleString("de-DE")} Zeilen analysiert</small></article>
          </div>
          <div className="rul-guidance"><b>Wartungshinweis</b><p>{analysis.latest.risk === "Critical" ? "Veranlassen Sie umgehend eine Inspektion und planen Sie den Austausch. Verwenden Sie diesen Prototyp nicht als alleinige Grundlage für Sicherheitsentscheidungen." : analysis.latest.risk === "Plan service" ? "Planen Sie eine technische Inspektion und ein Austauschfenster. Überwachen Sie weiterhin jeden neuen Zyklus." : analysis.latest.risk === "Monitor" ? "Erhöhen Sie die Überwachungsfrequenz und prüfen Sie, ob die prognostizierte RUL kontinuierlich abnimmt." : "Setzen Sie die normale Überwachung fort und bewahren Sie regelmäßige Zyklusaufzeichnungen für Trendvergleiche auf."}</p></div>
        </section>

        <section className="rul-chart-section">
          <header><div><p className="rul-kicker">DEGRADATIONSVERLAUF</p><h2>RUL über die hochgeladenen Zyklen.</h2></div><div className="rul-legend"><span><i className="predicted"/>Prognostizierte RUL</span>{chart.actual && <span><i className="actual"/>Aufgezeichnete RUL</span>}</div></header>
          <div className="rul-chart-wrap">
            <div className="rul-y-labels"><span>{Math.round(chart.max)}</span><span>{Math.round((chart.max + chart.min) / 2)}</span><span>{Math.round(chart.min)}</span></div>
            <svg className="rul-chart" viewBox="0 0 900 280" role="img" aria-label="Prognostizierte und aufgezeichnete Restlebensdauer je Zyklus"><path className="rul-grid-line" d="M0 1H900M0 140H900M0 279H900"/><path className="rul-predicted-line" d={chart.predicted}/>{chart.actual && <path className="rul-actual-line" d={chart.actual}/>}</svg>
            <div className="rul-x-labels"><span>Zyklus {Math.round(chart.firstCycle)}</span><span>Zyklus {Math.round(chart.lastCycle)}</span></div>
          </div>
        </section>

        <section className="rul-diagnostics">
          <div className="rul-quality-panel">
            <p className="rul-kicker">EINGABEDIAGNOSTIK</p><h2>Ergebnisse des Analysators.</h2>
            <dl><div><dt>Erkannte Merkmale</dt><dd>{Object.keys(analysis.matched).filter((key) => model.features.includes(key)).length} / {model.features.length}</dd></div><div><dt>Numerische Vollständigkeit</dt><dd>{(analysis.completeness * 100).toFixed(1)}%</dd></div><div><dt>Übereinstimmung mit Trainingsbereich</dt><dd>{(analysis.rangeFitness * 100).toFixed(1)}%</dd></div><div><dt>Doppelte Zyklen</dt><dd>{analysis.duplicates}</dd></div><div><dt>RUL-Anstiege</dt><dd>{analysis.monotonicViolations}</dd></div></dl>
            {analysis.warnings.length ? <ul>{analysis.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : <p className="rul-all-clear">Es wurde keine strukturelle Warnung erkannt.</p>}
          </div>
          <div className="rul-validation-panel">
            <p className="rul-kicker">PRÜFUNG DES HOCHGELADENEN ZIELWERTS</p><h2>{analysis.validation ? "Prognose im Vergleich zur bereitgestellten RUL." : "RUL zur Validierung hinzufügen."}</h2>
            {analysis.validation ? <div className="rul-live-metrics"><article><span>RMSE</span><strong>{analysis.validation.rmse.toFixed(2)}</strong></article><article><span>MAE</span><strong>{analysis.validation.mae.toFixed(2)}</strong></article><article><span>R²</span><strong>{analysis.validation.r2.toFixed(4)}</strong></article></div> : <p>Wenn Ihre CSV-Datei eine erkannte RUL-Spalte enthält, berechnet dieser Bereich Kennzahlen für die hochgeladenen Zeilen. Ohne RUL kann das Werkzeug schätzen, aber keine Genauigkeit messen.</p>}
            <div className="rul-export"><button onClick={exportAnalysedCSV}>Analysierte CSV herunterladen</button><button onClick={exportReport}>JSON-Bericht herunterladen</button></div>
          </div>
        </section>

        <section className="rul-table-section">
          <header><p className="rul-kicker">AKTUELLE PROGNOSEN</p><h2>Die letzten hochgeladenen Zyklen.</h2></header>
          <div className="rul-table-wrap"><table><thead><tr><th>Zyklus</th><th>Prognostizierte RUL</th>{analysis.predictions.some((row) => row.actual !== null) && <th>Aufgezeichnete RUL</th>}<th>Zustand</th><th>Risiko</th></tr></thead><tbody>{analysis.predictions.slice(-8).reverse().map((row, index) => <tr key={`${row.cycle}-${index}`}><td>{Math.round(row.cycle)}</td><td>{row.predicted.toFixed(1)}</td>{analysis.predictions.some((item) => item.actual !== null) && <td>{row.actual === null ? "—" : row.actual.toFixed(1)}</td>}<td>{row.health.toFixed(1)}%</td><td>{riskLabel(row.risk)}</td></tr>)}</tbody></table></div>
        </section>
      </>}

      {analysis && analysis.mode !== "rul" && <section className="rul-universal" aria-live="polite">
        <header><div><p className="rul-kicker">{analysis.mode === "telemetry" ? "TELEMETRIEDATENSATZ" : "UNIVERSELLES CSV-PROFIL"}</p><h2>{analysis.fileName}</h2></div><span>PROFIL BEREIT</span></header>
        <div className="rul-universal-stats"><article><span>Analysierte Zeilen</span><strong>{analysis.rows.toLocaleString("de-DE")}</strong></article><article><span>Spalten</span><strong>{analysis.columns}</strong></article><article><span>Numerische Signale</span><strong>{analysis.profiles.filter((profile) => profile.kind === "numeric").length}</strong></article><article><span>Datenvollständigkeit</span><strong>{(analysis.completeness * 100).toFixed(1)}%</strong></article></div>
        <div className="rul-mode-note"><b>SICHERER ANALYSEMODUS</b><p>Diese CSV-Datei enthält nicht genügend Eingaben des Thesis-Modells für eine belastbare RUL-Schätzung. Der Prototyp hat dennoch Struktur, Signalbereiche, Vollständigkeit und Kardinalität geprüft, ohne fehlende Batteriemerkmale zu erfinden.</p></div>
        {genericChart && <div className="rul-generic-chart"><div><p className="rul-kicker">SIGNALVORSCHAU</p><h3>{analysis.plotColumn}</h3></div><div className="rul-chart-wrap"><div className="rul-y-labels"><span>{genericChart.max.toFixed(2)}</span><span>{((genericChart.max + genericChart.min) / 2).toFixed(2)}</span><span>{genericChart.min.toFixed(2)}</span></div><svg className="rul-chart" viewBox="0 0 900 280" role="img" aria-label={`${analysis.plotColumn}: Signal über die hochgeladenen Zeilen`}><path className="rul-grid-line" d="M0 1H900M0 140H900M0 279H900"/><path className="rul-predicted-line" d={genericChart.path}/></svg><div className="rul-x-labels"><span>Erste Zeile</span><span>Letzte Zeile</span></div></div></div>}
        <div className="rul-profile-table"><table><thead><tr><th>Spalte</th><th>Erkannter Typ</th><th>Vollständig</th><th>Eindeutig</th><th>Minimum</th><th>Maximum</th><th>Mittelwert</th></tr></thead><tbody>{analysis.profiles.map((profile) => <tr key={profile.name}><td>{profile.name}</td><td>{columnKindLabel(profile.kind)}</td><td>{(profile.complete * 100).toFixed(1)}%</td><td>{profile.unique.toLocaleString("de-DE")}</td><td>{profile.min === null ? "—" : profile.min.toFixed(3)}</td><td>{profile.max === null ? "—" : profile.max.toFixed(3)}</td><td>{profile.mean === null ? "—" : profile.mean.toFixed(3)}</td></tr>)}</tbody></table></div>
        {analysis.warnings.length > 0 && <ul className="rul-generic-warnings">{analysis.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>}
        <div className="rul-export"><button onClick={exportReport}>Datenqualitätsbericht herunterladen</button></div>
      </section>}

      <section className="rul-method" id="method">
        <header><p className="rul-kicker">FUNKTIONSWEISE DES PROTOTYPS</p><h2>Ein transparenter Weg von der CSV-Datei zur Schätzung.</h2></header>
        <ol><li><b>01</b><h3>Erkennen</h3><p>Spalten werden als numerisch, Zeitstempel oder Text klassifiziert und bekannten Aliasnamen für Batterie- und Telemetriedaten zugeordnet.</p></li><li><b>02</b><h3>Validieren</h3><p>Vollständigkeit, Eindeutigkeit, Signalbereiche, Duplikate, Monotonie und Modellkompatibilität werden geprüft.</p></li><li><b>03</b><h3>Sicher prognostizieren</h3><p>Die XGBoost-RUL-Prognose wird nur ausgeführt, wenn die CSV-Datei genügend Merkmale des Thesis-Modells enthält. Andere Dateien verbleiben im Profilmodus.</p></li><li><b>04</b><h3>Interpretieren</h3><p>Der Prototyp zeigt entweder einen Batteriezustandsbericht oder einen transparenten universellen CSV-Qualitätsbericht.</p></li></ol>
        <div className="rul-importance"><div><p className="rul-kicker">MODELLSIGNAL</p><h3>Relative Merkmalsbedeutung</h3><p>Gain-basierte Bedeutung aus dem bereitgestellten Prototypmodell. Eine hohe Bedeutung ist kein Nachweis physikalischer Kausalität.</p></div><div>{topFeatures.map(([feature, value]) => <div key={feature}><span>{feature}</span><i><b style={{ width: `${Math.max(3, value * 100)}%` }}/></i><strong>{(value * 100).toFixed(1)}%</strong></div>)}</div></div>
      </section>

      <section className="rul-benchmarks">
        <header><p className="rul-kicker">BENCHMARK-NACHWEISE DER THESIS</p><h2>Aufgezeichnetes Experiment, klar von der Live-Prognose getrennt.</h2></header>
        <div><article><span>LSTM · THESIS-ERGEBNIS</span><strong>{model?.thesis_benchmark.lstm.r2.toFixed(4)}</strong><p>R² · RMSE {model?.thesis_benchmark.lstm.rmse.toFixed(3)} · MAE {model?.thesis_benchmark.lstm.mae.toFixed(3)}</p></article><article><span>XGBOOST · THESIS-ERGEBNIS</span><strong>{model?.thesis_benchmark.xgboost.r2.toFixed(4)}</strong><p>R² · RMSE {model?.thesis_benchmark.xgboost.rmse.toFixed(3)} · MAE {model?.thesis_benchmark.xgboost.mae.toFixed(3)}</p></article><article><span>WEBMODELL · INTERNE PRÜFUNG</span><strong>{model?.training.internal_random_holdout.r2.toFixed(4)}</strong><p>R² · RMSE {model?.training.internal_random_holdout.rmse.toFixed(3)} · MAE {model?.training.internal_random_holdout.mae.toFixed(3)}</p></article></div>
        <p>Nur interner, zufälliger Holdout auf Zeilenebene. Dies ist keine unabhängige Validierung auf Geräteebene und darf nicht als Leistungsnachweis für den Produktiveinsatz interpretiert werden.</p>
      </section>

      <section className="rul-limits" id="limits"><div><p className="rul-kicker">VERANTWORTUNGSVOLLE NUTZUNG</p><h2>Forschungsprototyp – kein zertifiziertes Batteriemanagementsystem.</h2></div><div><p>Die Schätzung eignet sich für Demonstrationen, explorative Analysen und wissenschaftliche Diskussionen. Sie reicht nicht für sicherheitskritische Austauschentscheidungen, Garantieentscheidungen, medizinische Systeme, Luftfahrt, Fahrzeuge oder industrielle Steuerungen aus.</p><ul><li>Validieren Sie das Modell mit unabhängigen Batterien und Zellchemien.</li><li>Führen Sie vor einem Einsatz gerätebezogene oder chronologische Tests durch.</li><li>Kombinieren Sie Prognosen mit physischer Inspektion und BMS-Warnungen.</li><li>Überwachen Sie Unsicherheit, Sensordrift und Eingaben außerhalb der Trainingsverteilung.</li></ul></div></section>

      <footer className="rul-footer"><a href="/thesis">NF / BACHELORARBEIT 2026</a><p>Batterie-RUL-Forschungsprototyp von Nayeem Faisal</p><a href="#analyser">Weitere CSV analysieren</a></footer>
    </main>
  );
}
