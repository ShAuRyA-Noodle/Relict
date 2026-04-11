# Tests

## Layout

```
tests/
├── conftest.py         Shared fixtures + unit-test env scrubbing
├── unit/               Fast, in-process tests (no containers)
│   ├── test_config.py
│   ├── test_security.py
│   ├── test_schemas.py
│   ├── test_models.py
│   ├── test_storage_filename.py
│   └── test_health_endpoint.py
├── integration/        Real Postgres + Redis + MinIO via testcontainers
│   ├── conftest.py
│   └── test_auth_service.py
└── fixtures/           Real truncated public FASTQ subsets (Phase 2+)
```

## Running

```bash
make test              # full suite with coverage gate
make test-unit         # unit only (fast, no Docker)
make test-integration  # integration only (needs Docker; spins up containers)
```

## Rules

- **No mock biological data.** Unit tests may use trivial placeholder
  strings for schema validation, but integration tests that involve the
  pipeline must use real truncated FASTQs from public studies (see
  `docs/DATASETS.md`). This rule becomes binding once Phase 2 lands.
- Integration tests are marked with `@pytest.mark.integration`.
- Every test must leave the database clean for the next test
  (`truncate_all` fixture or an explicit rollback).
