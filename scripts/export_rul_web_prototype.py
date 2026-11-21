from __future__ import annotations

import hashlib
import json
from datetime import date
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor


ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(
    "/Users/nf/Downloads/msc-thesis-rul-lithium-batteries-main/data/real_battery_cycle_data.csv"
)
MODEL_OUTPUT = ROOT / "site/public/models/nayeem-rul-xgboost.json"
SAMPLE_OUTPUT = ROOT / "site/public/data/battery-rul-sample.csv"

FEATURES = [
    "Cycle_Index",
    "Discharge Time (s)",
    "Decrement 3.6-3.4V (s)",
    "Max. Voltage Dischar. (V)",
    "Min. Voltage Charg. (V)",
    "Time at 4.15V (s)",
    "Time constant current (s)",
    "Charging time (s)",
    "Total time (s)",
]

ALIASES = {
    "Cycle_Index": ["cycle_index", "cycle index", "cycle", "cycles"],
    "Discharge Time (s)": ["discharge time (s)", "discharge_time", "discharge time"],
    "Decrement 3.6-3.4V (s)": [
        "decrement 3.6-3.4v (s)",
        "decrement 3.6 3.4v",
        "voltage decrement time",
    ],
    "Max. Voltage Dischar. (V)": [
        "max. voltage dischar. (v)",
        "max discharge voltage",
        "maximum discharge voltage",
    ],
    "Min. Voltage Charg. (V)": [
        "min. voltage charg. (v)",
        "min charge voltage",
        "minimum charge voltage",
    ],
    "Time at 4.15V (s)": ["time at 4.15v (s)", "time_at_4.15v", "time at 4.15v"],
    "Time constant current (s)": [
        "time constant current (s)",
        "constant current time",
        "cc time",
    ],
    "Charging time (s)": ["charging time (s)", "charging_time", "charging time"],
    "Total time (s)": ["total time (s)", "total_time", "total time"],
    "RUL": ["rul", "remaining useful life", "remaining cycles"],
}


def base_score_from(model: XGBRegressor) -> float:
    config = json.loads(model.get_booster().save_config())
    raw = config["learner"]["learner_model_param"]["base_score"]
    if isinstance(raw, list):
        raw = raw[0]
    raw = str(raw).strip().strip("[]")
    return float(raw)


def eval_tree(node: dict, row: dict[str, float]) -> float:
    if "leaf" in node:
        return float(node["leaf"])
    value = row.get(node["split"], float("nan"))
    target = node["missing"] if not np.isfinite(value) else (
        node["yes"] if value < float(node["split_condition"]) else node["no"]
    )
    child = next(child for child in node["children"] if child["nodeid"] == target)
    return eval_tree(child, row)


def main() -> None:
    if not SOURCE.exists():
        raise FileNotFoundError(SOURCE)

    data = pd.read_csv(SOURCE).drop(columns=["Unnamed: 0"], errors="ignore")
    clean = data[FEATURES + ["RUL"]].replace([np.inf, -np.inf], np.nan).dropna()
    x = clean[FEATURES]
    y = clean["RUL"].astype(float)

    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=0.2, random_state=42
    )
    evaluation_model = XGBRegressor(
        n_estimators=100,
        learning_rate=0.05,
        max_depth=3,
        subsample=0.9,
        colsample_bytree=1.0,
        objective="reg:squarederror",
        random_state=42,
        n_jobs=4,
    )
    evaluation_model.fit(x_train, y_train)
    pred = evaluation_model.predict(x_test)
    metrics = {
        "rmse": round(float(np.sqrt(mean_squared_error(y_test, pred))), 4),
        "mae": round(float(mean_absolute_error(y_test, pred)), 4),
        "r2": round(float(r2_score(y_test, pred)), 6),
    }

    model = XGBRegressor(
        n_estimators=100,
        learning_rate=0.05,
        max_depth=3,
        subsample=0.9,
        colsample_bytree=1.0,
        objective="reg:squarederror",
        random_state=42,
        n_jobs=4,
    )
    model.fit(x, y)
    booster = model.get_booster()
    trees = [json.loads(tree) for tree in booster.get_dump(dump_format="json")]
    base_score = base_score_from(model)

    # Verify that the compact browser representation reproduces native XGBoost.
    validation_rows = x.iloc[[0, len(x) // 2, len(x) - 1]]
    native = model.predict(validation_rows)
    manual = []
    for _, series in validation_rows.iterrows():
        row = {key: float(value) for key, value in series.items()}
        manual.append(base_score + sum(eval_tree(tree, row) for tree in trees))
    if not np.allclose(native, manual, atol=1e-4):
        raise RuntimeError(f"Browser export mismatch: native={native}, manual={manual}")

    stats = {}
    for feature in FEATURES:
        values = x[feature].astype(float)
        stats[feature] = {
            "min": float(values.min()),
            "max": float(values.max()),
            "median": float(values.median()),
            "mean": float(values.mean()),
        }

    importance = booster.get_score(importance_type="gain")
    total_gain = sum(importance.values()) or 1.0
    normalized_importance = {
        feature: round(float(importance.get(feature, 0.0) / total_gain), 6)
        for feature in FEATURES
    }

    digest = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
    artifact = {
        "name": "Nayeem Faisal Battery RUL Web Prototype",
        "version": "1.0.0",
        "generated": date.today().isoformat(),
        "model_type": "XGBoost regression",
        "purpose": "Interactive research prototype; not a safety-certified battery management system.",
        "source": {
            "dataset": "Real battery-cycle dataset used in the thesis research archive",
            "rows": int(len(clean)),
            "sha256": digest,
        },
        "features": FEATURES,
        "target": "RUL",
        "aliases": ALIASES,
        "feature_stats": stats,
        "feature_importance": normalized_importance,
        "training": {
            "configuration": {
                "n_estimators": 100,
                "learning_rate": 0.05,
                "max_depth": 3,
                "subsample": 0.9,
                "colsample_bytree": 1.0,
                "random_state": 42,
            },
            "internal_random_holdout": metrics,
            "warning": (
                "Internal random-row holdout only. It is not independent device-level validation "
                "and must not be interpreted as production performance."
            ),
        },
        "thesis_benchmark": {
            "lstm": {"rmse": 85.405, "mae": 15.554, "r2": 0.9308},
            "xgboost": {"rmse": 87.133, "mae": 24.760, "r2": 0.9280},
            "note": "Recorded results from the thesis experiment; not live recalculation results.",
        },
        "base_score": base_score,
        "trees": trees,
    }

    MODEL_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    MODEL_OUTPUT.write_text(json.dumps(artifact, separators=(",", ":")), encoding="utf-8")

    # Consecutive mid-life rows make the sample useful for trend and prediction demonstrations.
    SAMPLE_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    sample = clean.iloc[520:600].copy()
    sample.to_csv(SAMPLE_OUTPUT, index=False)

    print(f"Wrote {MODEL_OUTPUT} ({MODEL_OUTPUT.stat().st_size:,} bytes)")
    print(f"Wrote {SAMPLE_OUTPUT} ({len(sample)} rows)")
    print(f"Internal holdout: {metrics}")
    print(f"Browser export verified on {len(validation_rows)} rows")


if __name__ == "__main__":
    main()
