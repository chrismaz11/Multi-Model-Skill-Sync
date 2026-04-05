# Recommended Repo Layout

Default structure for this workflow:

```text
.ai/
  skills/
    project-spec.md
    change-log.md
    governance/
    openai/
    claude/
    gemini/
.agents/
  primary-agent.md
  executor-agent.md
.github/
  workflows/
    ai-skill-sync.yml
```

## Responsibilities

### `.ai/skills/project-spec.md`
Single source of truth for project-aware AI behavior.

### `.ai/skills/change-log.md`
Append-only record of meaningful policy, architecture, or workflow changes that should trigger re-sync.

### `.ai/skills/<model>/`
Model-specific adapters derived from the canonical spec. Keep these thin.

### `.ai/skills/governance/`
Derived governance artifacts that make approval, risk, drift, and review rules explicit.

### `.agents/primary-agent.md`
Authority model for interpretation, review, reconciliation, and signoff preparation.

### `.agents/executor-agent.md`
Bounded execution instructions for task agents.

### `.github/workflows/ai-skill-sync.yml`
Manual trigger to validate, refresh, or report drift across the skill set.

## Design rule

Put durable policy in the canonical spec. Put runtime authority boundaries in `.agents/`. Put model-specific phrasing in `.ai/skills/<model>/`.
