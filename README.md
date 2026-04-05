# Cross Model Skill Sync Action

This repository packages the `cross-model-skill-sync` skill as a runnable GitHub Action.

The action treats `.ai/skills/project-spec.md` as the canonical source of truth and manages thin adapter files for `openai`, `claude`, and `gemini`, plus agent policy documents under `.agents/`.

## What it does

- validates canonical AI control metadata
- detects version drift between the canonical spec and derived adapters
- refreshes derived adapter and agent files in a deterministic way
- refreshes governance artifacts used for approval and review
- emits a JSON report that can be uploaded as a workflow artifact

## Repository layout

- `.ai/skills/project-spec.md`: canonical source of truth
- `.ai/skills/governance/`: approval, risk, drift, and review policy pack
- `.ai/skills/<model>/adapter.md`: derived model adapters
- `.agents/primary-agent.md`: main decision policy
- `.agents/executor-agent.md`: bounded execution policy
- `cross-model-skill-sync/action.yml`: composite GitHub Action
- `cross-model-skill-sync/scripts/sync.js`: sync and drift-check implementation
- `.github/workflows/ai-skill-sync.yml`: manual trigger example workflow

## Local usage

```bash
npm run skill-sync:validate
npm run skill-sync:refresh
```

## GitHub Action usage

```yaml
- uses: ./cross-model-skill-sync
  with:
    mode: validate
    target-models: openai,claude,gemini
```

Use the example workflow in `.github/workflows/ai-skill-sync.yml` for a manual `workflow_dispatch` entrypoint.
