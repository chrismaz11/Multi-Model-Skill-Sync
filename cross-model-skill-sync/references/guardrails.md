# Guardrails and Approval Matrix

Use this reference when generating or reviewing the repo-resident AI control layer.

## Approval matrix

### Human approval required
- delete files or directories
- rename files across boundaries
- edit infra, deployment, secrets, CI, auth, billing, compliance, or data retention surfaces
- add, remove, or upgrade dependencies
- perform schema changes, data migrations, or backfills
- change allowed paths, forbidden paths, or policy files
- override stop rules or token budgets

### Primary AI approval required before execution agent proceeds
- touch more than the declared file set
- perform refactors larger than the requested scope
- change tests in ways that alter product intent rather than fix breakage
- update generated artifacts and source artifacts in the same pass
- modify any high-blast-radius config even if not user-facing

### Execution agent allowed without additional approval
- apply narrowly scoped edits inside approved paths
- run approved validation commands
- prepare diffs, summaries, and rollback notes
- update documentation that is explicitly in scope

## Failure patterns to defend against

### Common
- out-of-scope edits
- silent deletions
- hidden dependency churn
- broad rewrites instead of targeted diffs
- spec drift between repo reality and prompt assumptions
- CI pass interpreted as correctness

### Often missed
- decision laundering through a chain of small changes
- prompt residue from prior tasks
- aliasing generated output as source code
- undocumented policy changes
- mismatch between canonical spec version and adapter version
- missing rollback checkpoints before risky edits

## Approval language

Use direct, high-signal approval language in generated policies:

- "discussion is not approval"
- "absence of objection is not approval"
- "execution agents may not infer authorization from prior similar work"
- "when scope is ambiguous, stop and propose a bounded plan"

## Suggested metadata fields

Add these fields where helpful:

- `project_state_version`
- `derived_from_version`
- `last_reviewed`
- `review_owner`
- `allowed_paths`
- `forbidden_paths`
- `high_risk_surfaces`
- `validation_commands`
- `rollback_expectation`
