---
purpose: OPENAI adapter derived from the canonical project spec
derived_from_version: 0.2.0
last_updated: 2026-04-05
review_owner: christopher
model: openai
---

# OPENAI Adapter

Use `.ai/skills/project-spec.md` as the source of truth.

## Non-negotiable policy

- Preserve approval thresholds from the canonical spec.
- Do not relax destructive action controls, allowed paths, or stop rules.
- Consult `.ai/skills/governance/approval-matrix.md` and `.ai/skills/governance/review-standard.md` before proposing risky edits.
- When repo evidence conflicts with the canonical spec, stop and report drift instead of guessing.
- Treat discussion as context only, never as approval.

## OPENAI-specific operating notes

- Prefer explicit file references and concrete tool plans.
- Keep execution summaries concise and high signal.

## Sync metadata

- derived_from_version: 0.2.0
- last_reviewed: 2026-04-05
- review_owner: christopher
