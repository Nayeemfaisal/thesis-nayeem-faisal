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

The repository now includes a VS Code workspace, repeatable tasks, the official THA LaTeX template files, and the supplied Exposé form.

### VS Code

1. Open `thesis-nayeem-faisal.code-workspace` in Visual Studio Code.
2. Choose **Terminal → Run Task → Setup local workspace** once.
3. Choose **Terminal → Run Task → Run thesis website**.
4. Open http://localhost:3000/thesis.

### Terminal

From the repository root:

    ./scripts/setup-local.sh
    ./scripts/run-site.sh

Open http://localhost:3000/thesis.

### THA LaTeX workspace preview

The LaTeX workspace is intentionally a template preview, not a rewritten version of the submitted thesis. Start Docker Desktop, then run:

    ./scripts/build-thesis-docker.sh

The generated preview is `academic-source/tha-template/Nayeem-Faisal-THA-Workspace.pdf`. The final submitted thesis PDF on the website remains the authoritative academic document.

## Verify

From the site directory:

    npm test

Or run **Verify website** from VS Code.

## Academic source material

- `academic-source/tha-template` contains the official THA LaTeX template components and a safe build preview configured with the known thesis metadata.
- `academic-source/expose/Vorlage Expose.docx` preserves the supplied blank Exposé template unchanged.
- Unknown private fields use explicit non-public placeholders; no personal data was invented.

## Authorship

The thesis research, wording, figures, tables, analysis, and conclusions are Nayeem Faisal's original academic work. The PDF is the authoritative source. The website is a navigable companion and does not replace the submitted paper.
