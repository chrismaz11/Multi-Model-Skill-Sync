# Risk Catalog

## Metadata
- canonical_spec: .ai/skills/project-spec.md
- approval_scope: repo ai control layer

## Common failure patterns
- out-of-scope edits
- silent deletions
- hidden dependency churn
- broad rewrites instead of targeted diffs
- tests treated as proof of correctness

## Overlooked failure patterns
- context drift
- cross-model divergence
- decision laundering
- prompt residue
- rollback weakness
- path alias mistakes
- observability blindness
- sync illusion

## Required controls
- log rationale for risky edits
- keep file touches narrowly scoped
- stop when canonical evidence conflicts with repo evidence
- surface uncertainty instead of improvising policy
