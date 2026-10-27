# Implemented Research Workflow

**Researcher:** Nayeem Faisal
**Study:** Development of Enhanced Energy Forecasting Framework for the Lithium Battery systems

This document records the workflow described in the final thesis. The PDF remains the authoritative source for all methodological detail.

## Research sequence

1. The benchmark battery dataset was examined to understand its columns, types, distributions, cycle behaviour, and remaining useful life values.
2. A Gaussian Copula Synthesizer was configured from the available metadata, fitted to the real battery data, and used to generate 100,000 rows.
3. The generated data was sorted by device ID and RUL. Positive decrement values were filtered, and RUL was checked to decrease within each device ID group across cycles.
4. Real and synthetic correlation matrices were compared. The thesis reports a Frobenius norm of 1.321, no missing values in the matrices, and a Cycle Index-RUL correlation of -0.999 in both datasets.
5. Feature distributions and relationships were explored, and predictor and target data were prepared for modelling.
6. LSTM and XGBoost regression models were applied. XGBoost hyperparameters were tuned using grid search with cross-validation. The thesis concludes that LSTM exhibited superior performance across the reported evaluation metrics for this dataset.
