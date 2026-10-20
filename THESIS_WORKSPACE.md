# Bachelor's Thesis Workspace

**Author:** Nayeem Faisal

This repository currently provides the literature-linked dataset catalogue that will support the thesis. The following structure is recommended as the research develops:

```text
data/
  README.md          # acquisition instructions; do not commit restricted or large raw data
docs/
  literature/        # structured reading notes
  decisions/         # dataset and modelling decisions
notebooks/           # numbered exploratory and analysis notebooks
src/                 # reusable preprocessing and modelling code
tests/               # automated checks for reusable code
results/              # tables and figures produced by documented runs
```

## Reproducible workflow

1. Define the research question and measurable outcomes.
2. Screen candidate datasets using `RESEARCH_PROTOCOL.md`.
3. Record dataset versions, licences, checksums, and access dates.
4. Keep raw data immutable and implement processing in scripts.
5. Fix random seeds and record the computing environment.
6. Evaluate with a leakage-safe split appropriate to cells, batches, and time.
7. Generate thesis tables and figures from version-controlled code.
8. Document limitations, unsuccessful experiments, and deviations from the protocol.

## Thesis metadata still to complete

Add the university, degree programme, supervisor, final thesis title, submission date, and ORCID when these details are confirmed.
