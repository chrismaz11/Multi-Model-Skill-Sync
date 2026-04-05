---
name: cross-model-skill-sync
description: create and maintain a canonical project ai control layer for software repos, with one source-of-truth project spec plus per-model skill and agent adapters for chatgpt, claude, gemini, and similar systems. use when chatgpt needs to reduce ai development drift, generate or update repo-resident ai instructions under .ai/skills and .agents, design a manual-trigger github action for skill sync, add approval gates for destructive or high-risk work, or account for context drift across models and over time.
---

# Cross Model Skill Sync

Use this skill to generate or update a repo-resident AI control layer that keeps multiple models aligned to the same project state.

## Core principle

Treat the repository as the source of truth. Generate one canonical project spec first, then derive model-specific adapters from it. Do not start by writing separate instructions for each model in isolation.

Default repo layout:

- `.ai/skills/` for project AI instructions and canonical sync artifacts
- `.agents/` for runtime agent definitions and execution policies

Default supported model stack unless the user says otherwise:

- chatgpt / openai
- claude
- gemini

## Required outputs

For a new setup, generate these files unless the user requests a narrower scope:

1. `.ai/skills/project-spec.md`
   - canonical source of truth for repo behavior, scope, constraints, and review rules
2. `.ai/skills/openai/`
   - openai skill or adapter files derived from the canonical spec
3. `.ai/skills/claude/`
   - claude-oriented adapter files derived from the canonical spec
4. `.ai/skills/gemini/`
   - gemini-oriented adapter files derived from the canonical spec
5. `.agents/primary-agent.md`
   - policy for the main decision-making model
6. `.agents/executor-agent.md`
   - policy for secondary execution agents
7. `.github/workflows/ai-skill-sync.yml`
   - manual-trigger workflow that regenerates or validates sync artifacts
8. `.ai/skills/change-log.md`
   - append-only log of meaningful policy or repo-state updates
9. `.ai/skills/governance/`
   - derived approval matrix, risk catalog, drift checklist, and review standard

When the user only wants planning, provide the file set and representative contents. When the user wants implementation-ready artifacts, generate full file contents.

## Decision model

Use this authority split by default:

- **Human**: final signoff on risky decisions, deletions, policy changes, and merge intent
- **Primary AI**: interpret goals, reconcile model output, approve or reject proposed execution plans
- **Execution agents**: perform bounded tasks only after plan approval

Never let execution agents define policy, expand scope, or reinterpret approval.

## Standard workflow

Follow this sequence:

1. Inspect the repo context the user provides
2. Draft or update `.ai/skills/project-spec.md`
3. Identify model-independent rules versus model-specific adapter needs
4. Generate per-model adapters from the canonical spec
5. Generate `.agents/` policies that encode approval and execution boundaries
6. Generate the manual-trigger GitHub Action
7. Add or update context drift controls
8. Summarize what changed and what requires human review

## Canonical project spec requirements

The canonical spec should usually contain these sections:

- project purpose
- architecture and important boundaries
- allowed paths and forbidden paths
- source-of-truth files and directories
- build, test, and validation commands
- decision rights and approval policy
- destructive action policy
- dependency and migration policy
- documentation update policy
- approval matrix
- context drift controls
- review standard
- token budget and stopping rules
- output and commit conventions

Be concrete. Use real repo paths, commands, and constraints when available.

## Default guardrails

Cover the obvious failure modes and the ones teams often miss.

### Baseline controls

Always encode defaults for:

- no edits outside the declared task scope
- no file deletion without explicit approval
- no dependency changes without approval
- no schema or migration changes without approval
- no infra, secrets, CI, or deployment edits without approval
- no opportunistic refactors mixed into requested work
- no broad rewrites when a targeted diff is sufficient
- no implied approval from brainstorming or discussion
- no writing to generated or vendored paths unless explicitly intended
- no passing tests treated as proof of correctness

### Less obvious controls

Also account for:

- **context drift**: models act on stale repo assumptions, old prompts, or outdated policy files
- **cross-model divergence**: different models infer different conventions from the same repo
- **decision laundering**: a risky change is split into several harmless-looking steps
- **prompt residue**: prior task context leaks into the current task
- **rollback weakness**: changes are made without a recovery checkpoint or clear revert strategy
- **path alias mistakes**: mirrored, generated, build, or cache paths are edited instead of source paths
- **observability blindness**: an agent acts without leaving a rationale trail
- **token runaway**: the system keeps exploring, retrying, or reconciling without a stop rule
- **sync illusion**: the canonical spec changed but model adapters or installed skills were not refreshed

Use these as first-class design constraints, not optional notes.

## Context drift controls

Always add explicit anti-drift mechanisms. At minimum include:

- a `project_state_version` field in the canonical spec
- a `last_reviewed` date and `review_owner`
- a short list of current source-of-truth docs and directories
- a "known stale if changed" list for files that should trigger adapter refresh
- a reconciliation rule: adapters must cite the canonical spec version they were derived from
- a stop rule: if the repo appears inconsistent with the current spec, pause and ask for review or output a mismatch report instead of guessing

When useful, generate a drift checklist such as:

1. Has architecture changed?
2. Have allowed or forbidden paths changed?
3. Have build or test commands changed?
4. Have ownership or approval rules changed?
5. Have dependencies, frameworks, or deployment surfaces changed?
6. Are adapters still derived from the current canonical spec version?

## Token and scope controls

Default to bounded execution. Encode rules such as:

- produce a plan before making high-risk changes
- stop after a fixed number of retries or failed validations
- summarize intended file touches before execution
- keep each execution task narrowly scoped
- surface uncertainty instead of exploring indefinitely
- prefer diff-sized edits over file rewrites

## Output conventions

When generating repo artifacts, prefer this pattern:

- canonical spec first
- per-model adapters second
- agent policies third
- GitHub Action last

For each generated file, include a short header block or metadata section that states:

- purpose
- source canonical spec version
- last updated date
- owner or reviewer

For governance artifacts, also include:

- canonical spec path
- approval scope covered by the document
- drift conditions that require human review

## Model adapter guidance

Per-model adapters should preserve policy while adapting phrasing, not alter the underlying rules.

Adapters may vary in:

- prompt style
- tool invocation phrasing
- structure of execution instructions
- formatting expectations

Adapters must not vary in:

- approval thresholds
- allowed paths
- destructive action policy
- stop rules
- context drift handling

If a model has weaker support for a desired behavior, simplify the adapter rather than relaxing policy.

## GitHub Action expectations

When generating `.github/workflows/ai-skill-sync.yml`, default to a manual trigger. The workflow should usually:

1. accept optional inputs such as target model set or refresh mode
2. validate that canonical spec files exist
3. regenerate or verify adapter files from the canonical spec
4. report drift or open a patch/PR-ready diff rather than silently overwriting unexpected changes

Prefer safe validation and proposal behavior over autonomous mutation.

If the user wants stronger enforcement, add a stale-sync check that fails when adapters do not match the canonical spec version.

## Review standard

Before finalizing, check that the generated system:

- makes the canonical spec the source of truth
- clearly separates decision authority from execution authority
- covers both common and overlooked failure modes
- explicitly handles context drift across time and across models
- uses manual triggering for the sync workflow unless the user requested automation
- is specific to the repo rather than generic AI policy boilerplate

## Bundled resources

Use these files when helpful:

- `references/guardrails.md` for the default risk catalog and approval matrix
- `references/context-drift.md` for drift symptoms, checks, and controls
- `references/repo-layout.md` for the recommended directory structure and file responsibilities
- `assets/templates/project-spec-template.md` for a starter canonical spec
- `assets/templates/primary-agent-template.md` for primary AI policy
- `assets/templates/executor-agent-template.md` for execution agent policy
- `assets/templates/ai-skill-sync.yml` for a manual-trigger workflow skeleton
