"""Relict bioinformatics pipeline stages.

Phase 1: a single no-op ``run_job`` that advances a Job row through
``queued → running → succeeded`` and publishes events so the full
request lifecycle can be exercised end-to-end.

Phase 2 replaces ``run_job`` with a real orchestrator that calls the
individual stages: ``qc``, ``dereplicate``, ``denoise``, ``taxonomy``,
``diversity``, ``ordination``, ``conservation``, ``provenance``. Each
stage is a real wrapper around a real tool — no mock data, ever.
"""
