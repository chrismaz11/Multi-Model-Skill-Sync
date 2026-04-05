# Context Drift Controls

Context drift happens when a model works from stale repo assumptions, stale instructions, or outdated task residue.

## Drift types

### Time drift
The repo changed, but the canonical spec or adapters were not updated.

### Cross-model drift
Different models read the same repo differently and develop incompatible operating assumptions.

### Prompt drift
The current task inherits facts, constraints, or intentions from earlier tasks that no longer apply.

### Authority drift
An execution agent gradually takes on decision rights that belong to the primary AI or human reviewer.

## Symptoms
- model proposes files that no longer exist or are no longer source-of-truth
- model references deprecated architecture or old frameworks
- different adapters recommend conflicting commands or paths
- model treats speculative discussions as approved policy
- generated files cite no canonical version or stale version numbers

## Controls

### Version discipline
Require one canonical version field in `.ai/skills/project-spec.md` and make every adapter cite it.

### Refresh triggers
Recommend adapter refresh when any of these change:
- app or service boundaries
- framework or build system
- package manager or dependency rules
- CI commands or deployment workflow
- ownership and approval policy
- allowed or forbidden path rules

### Mismatch handling
When repo evidence conflicts with the current canonical spec:
1. do not guess
2. produce a mismatch report
3. mark the current spec as needing review
4. propose the smallest safe update set

### Prompt hygiene
Tell execution agents to restate current task scope, touched paths, and canonical spec version before work begins.

### Cross-model reconciliation
Tell the primary AI to compare outputs from different models against the canonical spec rather than against each other.
