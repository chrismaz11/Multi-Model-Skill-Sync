# Review Standard

## Metadata
- canonical_spec: .ai/skills/project-spec.md
- approval_scope: repo ai control layer

## Review checks
- canonical spec remains the source of truth
- approval boundaries are unchanged unless explicitly requested
- derived adapters cite the current canonical version
- governance docs and agent policies agree
- workflow behavior reports drift instead of mutating silently

## Immediate review failures
- destructive changes without human approval
- dependency or workflow privilege changes without approval
- derived files that do not cite canonical version metadata
- policy contradictions between canonical and derived docs

## Reviewer output
- findings first
- residual risk second
- summary of touched files last
