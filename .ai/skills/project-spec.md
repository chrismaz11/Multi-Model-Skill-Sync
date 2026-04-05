# Project AI Canonical Spec

## Metadata
- project_state_version: 0.2.0
- last_reviewed: 2026-04-05
- review_owner: christopher

## Project purpose
Package the `cross-model-skill-sync` skill as a deterministic GitHub Action that validates and refreshes repo-resident AI control files from one canonical project spec.

## Architecture and important boundaries
- canonical source of truth: `.ai/skills/project-spec.md`
- derived governance artifacts: `.ai/skills/governance/`
- derived model adapters: `.ai/skills/<model>/adapter.md`
- derived agent policies: `.agents/primary-agent.md`, `.agents/executor-agent.md`
- execution engine: `cross-model-skill-sync/scripts/sync.js`
- GitHub entrypoint: `cross-model-skill-sync/action.yml` and `.github/workflows/ai-skill-sync.yml`

## Source-of-truth surfaces
- architecture docs: `README.md`, `cross-model-skill-sync/SKILL.md`
- app directories: `cross-model-skill-sync/`, `.ai/`, `.agents/`, `.github/workflows/`
- config files: `package.json`, `cross-model-skill-sync/action.yml`
- operational docs: `cross-model-skill-sync/references/`

## Allowed paths
- `.ai/skills/`
- `.agents/`
- `.github/workflows/`
- `cross-model-skill-sync/`
- `README.md`
- `package.json`

## Forbidden paths
- user home directories outside the repository
- secrets, credentials, or local machine state
- unrelated generated cache or build directories

## High-risk surfaces
- workflow definitions under `.github/workflows/`
- canonical policy files under `.ai/skills/`
- action execution logic under `cross-model-skill-sync/scripts/`

## Validation commands
- `npm run skill-sync:validate`
- `npm run skill-sync:refresh`

## Decision rights
- human: approve policy changes, scope expansion, dependency changes, and destructive actions
- primary ai: reconcile requested changes against this spec before execution
- executor agents: perform bounded edits within approved paths only

## Destructive action policy
No file deletions, path moves, dependency additions, or workflow privilege expansion without explicit human approval.

## Dependency and migration policy
Prefer the Node standard library. Do not add external packages unless the action cannot be implemented safely without them.

## Documentation update policy
Update `README.md`, `cross-model-skill-sync/SKILL.md`, and the derived governance docs when the canonical spec structure, workflow contract, or approval model changes.

## Approval matrix
- human approval required: deletions, dependency changes, workflow privilege changes, policy changes, and allowed-path changes
- primary ai approval required: scope expansion, large refactors, mixed source-and-generated edits, and high-blast-radius config changes
- executor allowed without additional approval: bounded edits in approved paths, deterministic derived-file refresh, and approved validation commands

## Context drift controls
- known stale if changed: `README.md`, `cross-model-skill-sync/SKILL.md`, `cross-model-skill-sync/assets/templates/`, `.github/workflows/ai-skill-sync.yml`
- adapter derivation rule: all adapters and agent policies must cite `project_state_version`
- mismatch handling: stop and emit a drift report when derived files no longer match the canonical spec

## Review standard
- what reviewers must verify: the canonical spec remains authoritative, governance docs match it, and adapters cite the current version
- what fails review immediately: destructive actions without approval, undocumented policy changes, and mismatched derived metadata

## Token and stopping rules
- max retries: 2
- stop when: canonical metadata is missing, repo evidence conflicts with this spec, or requested edits exceed approved paths

## Output conventions
- summary format: report drift, refreshed files, and unresolved errors
- diff expectations: prefer targeted changes and report file-level drift
- rollback expectations: derive files deterministically so they can be refreshed from the canonical spec
