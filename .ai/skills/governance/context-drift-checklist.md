---
purpose: Context Drift Checklist derived from the canonical project spec
derived_from_version: 0.2.0
last_updated: 2026-04-05
review_owner: christopher
---

# Context Drift Checklist

## Metadata
- canonical_spec: .ai/skills/project-spec.md
- approval_scope: repo ai control layer

## Refresh triggers
1. Architecture changed.
2. Allowed or forbidden paths changed.
3. Build, test, or release commands changed.
4. Ownership or approval rules changed.
5. Framework, package manager, or deployment surface changed.
6. Canonical project_state_version changed without derived artifact refresh.

## Mismatch handling
1. Do not guess.
2. Produce a mismatch report.
3. Mark the canonical spec for review.
4. Propose the smallest safe update set.

## Prompt hygiene
- restate task scope
- restate touched paths
- cite current canonical version
- stop if instructions conflict

## Sync metadata

- derived_from_version: 0.2.0
- review_owner: christopher
- drift_review_required_when: canonical version, workflow contract, or repo boundaries change
