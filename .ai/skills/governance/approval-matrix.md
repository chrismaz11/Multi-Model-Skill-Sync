---
purpose: Approval Matrix derived from the canonical project spec
derived_from_version: 0.2.0
last_updated: 2026-04-05
review_owner: christopher
---

# Approval Matrix

## Metadata
- canonical_spec: .ai/skills/project-spec.md
- approval_scope: repo ai control layer

## Human approval required
- file or directory deletion
- dependency changes
- schema, migration, or data-shape changes
- ci, deploy, secret, auth, billing, or compliance edits
- policy, allowed-path, or forbidden-path changes

## Primary AI approval required
- touching files outside the declared plan
- any refactor larger than the requested task
- generated and source artifact edits in the same pass
- high-blast-radius config edits inside approved paths

## Execution allowed without extra approval
- narrowly scoped edits inside approved paths
- approved validation commands
- deterministic refresh of derived ai control artifacts
- documentation updates explicitly covered by scope

## Approval language
- discussion is not approval
- absence of objection is not approval
- prior similar work is not approval for current work
- ambiguity requires a bounded plan, not execution

## Sync metadata

- derived_from_version: 0.2.0
- review_owner: christopher
- drift_review_required_when: approval boundaries, allowed paths, or destructive action policy changes
