# Dataset Curation and Review Protocol

**Researcher:** Nayeem Faisal

**Context:** Bachelor's thesis research

## Purpose

This protocol defines how entries in the battery dataset catalogue are selected, checked, and prepared for later thesis analysis. It separates dataset discovery from scientific evaluation so that inclusion in the catalogue is not mistaken for endorsement.

## Inclusion criteria

A resource may be included when it:

1. contains battery measurements, derived battery data, model parameters, or reproducible simulation data;
2. has a stable public landing page or repository;
3. provides enough metadata to identify its chemistry, test context, or intended research task; and
4. identifies an originating institution, author group, or associated publication.

## Verification checklist

Before an entry is used in thesis experiments, record:

- landing-page URL, DOI, version, and access date;
- dataset authors and the citation requested by the publisher;
- licence and any access or redistribution restrictions;
- cell chemistry, format, sample count, and test conditions;
- measured variables, units, sampling interval, and file formats;
- missing values, exclusions, preprocessing, and known biases;
- train/validation/test split strategy and leakage risks; and
- scripts, package versions, random seeds, and checksums needed to reproduce results.

## Evaluation dimensions

Candidate datasets should be compared on relevance, documentation quality, accessibility, scale, representativeness, measurement resolution, target availability, licence compatibility, and reproducibility. The final thesis must explain why selected datasets fit the research question and why alternatives were excluded.

## Evidence and citation policy

Dataset descriptions should be verified against their authoritative landing pages and associated papers. Every dataset used in analysis must be cited independently. This catalogue is a discovery aid and is not a substitute for primary sources.

## Change control

Material changes should be committed with a short explanation. New catalogue entries should follow the structure described in `CONTRIBUTING.md`. Experimental results and generated artefacts should not overwrite raw source data.
