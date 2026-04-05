# Cross Model Skill Sync

`cross-model-skill-sync` is a composite GitHub Action that validates and refreshes a repo-resident AI control layer from a canonical project spec.

It treats `.ai/skills/project-spec.md` as the source of truth and manages:

- model adapters under `.ai/skills/<model>/`
- governance artifacts under `.ai/skills/governance/`
- agent policies under `.agents/`

## What it does

- validates canonical metadata and required governance sections
- detects drift between the canonical spec and derived artifacts
- refreshes missing or stale adapters, governance docs, and agent policies
- writes a JSON report for downstream workflows or PR bodies

## Inputs

- `repo-root`: repository root to manage. Default: `.`
- `target-models`: comma-separated adapters to manage. Default: `openai,claude,gemini`
- `mode`: `validate` or `refresh`. Default: `validate`
- `fail-on-drift`: whether validate mode should fail on drift. Default: `true`
- `report-path`: JSON report output path relative to the managed repo. Default: `.ai/skills/reports/ai-skill-sync-report.json`

## Outputs

- `drift-detected`: `true` when missing or stale derived files were detected
- `report-path`: absolute path to the generated JSON report

## Example

```yaml
name: ai-skill-sync

on:
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 24

      - uses: chrismaz11/Multi-Model-Skill-Sync@v1
        with:
          repo-root: .
          mode: validate
          target-models: openai,claude,gemini
```

## Managed file contract

The target repository is expected to contain:

- `.ai/skills/project-spec.md`
- `.ai/skills/change-log.md`
- `.agents/primary-agent.md`
- `.agents/executor-agent.md`

In `refresh` mode, this action will create or replace derived files under:

- `.ai/skills/openai/`
- `.ai/skills/claude/`
- `.ai/skills/gemini/`
- `.ai/skills/governance/`
- `.agents/`

