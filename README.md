# Development of Enhanced Energy Forecasting Framework for the Lithium Battery systems

Bachelor's thesis by **Nayeem Faisal**, submitted at Augsburg University of Applied Sciences on 27 October 2026 under the supervision of Prof. Dr. Fiorentino Valerio Conte.

## Research focus

This thesis investigates remaining useful life (RUL) prediction for lithium-ion batteries. The work combines:

- inspection and preprocessing of a real battery benchmark dataset;
- Gaussian Copula-based synthetic data generation;
- a generated dataset of 100,000 rows;
- correlation analysis and validation against the real data;
- exploratory data analysis and feature engineering; and
- LSTM and XGBoost regression, including model comparison.

The final study reports that LSTM performed better across the evaluated metrics for the dataset used in the thesis.

## Thesis website

The repository includes an interactive, chapter-based thesis companion in the site directory. It provides the complete final thesis PDF, a searchable chapter index, the documented research workflow, selected findings, and author and citation information.

## Run locally

From the site directory:

    npm install
    npm run dev

Open http://localhost:3000/thesis.

## Verify

From the site directory:

    npm test

## Authorship

The thesis research, wording, figures, tables, analysis, and conclusions are Nayeem Faisal's original academic work. The PDF is the authoritative source. The website is a navigable companion and does not replace the submitted paper.
