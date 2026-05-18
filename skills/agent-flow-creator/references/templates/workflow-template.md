# Workflow template

Workflows are reusable orchestration playbooks. Use this template to write new ones.

---

```markdown
# Workflow: <Name>

> One-line description of what this workflow handles.
> **Who uses this?** Usually the Orchestrator, when <trigger>.

## When to activate this workflow
- <Condition 1>
- <Condition 2>

## When NOT to activate
- <Negative condition 1> → use <other workflow>
- <Negative condition 2>

---

## Stages — mandatory order

### Stage 0: Triage (Orchestrator, X min)
**Goal**: <what this stage achieves>

- [ ] <Check 1>
- [ ] <Check 2>

**Decision points**: <when to stop / branch>

---

### Stage N: <Stage name> (<agent>, X min)
**Trigger**: <what triggers this stage>
**Who**: `<path/to/agent.md>`
**Output**: <what gets produced>

**Checklist**:
- [ ] <Step 1>
- [ ] <Step 2>

**Special cases**:
- If <X> → consult <agent>
- If <Y> → branch to <workflow>

**Handoff**: <next stage / agent>

---

## Edge cases

### "<Common situation>"
- <How to handle>

### "<Another situation>"
- <How to handle>

---

## Key principles
1. <Principle 1>
2. <Principle 2>
3. <Principle 3>
```

---

## Writing tips

### Sequencing
List stages in mandatory order. If steps can run in parallel, say so explicitly:
> "Stage 3 and Stage 4 can run in parallel — both depend on Stage 2."

### Time estimates
Be honest. "10 min" for actually-10-minute tasks. "Several hours" for genuinely variable. Don't lie to make it sound faster.

### Output artifacts
Every stage must produce *something concrete*: a PRD, a wireframe, a migration file, a test report. "Discussion completed" is not an artifact.

### Branch handling
When workflows have decision points, be explicit:
```markdown
**If <X>** → continue to Stage N+1
**If <Y>** → branch to <other workflow>
**If unclear** → return to Orchestrator
```

### Anti-patterns to call out
Workflows often fail in predictable ways. Document them:
```markdown
### Don't:
- Skip Stage 2 even if "we already know what to build"
- Run Stage 4 before Stage 3 finishes
```

---

## Common workflows to create per project

### Almost always needed
- `feature-development.md` — new feature end-to-end
- `bug-fix.md` — bug from report to deploy
- `sprint-planning.md` — sprint kickoff

### Often needed
- `production-incident.md` — P0 response
- `dependency-upgrade.md` — when libraries need bumping
- `refactor.md` — when changing structure without changing behavior

### Project-specific examples
- `tenant-onboarding.md` — for multi-tenant SaaS
- `data-migration.md` — for projects with frequent schema changes
- `model-deployment.md` — for ML-heavy projects
- `compliance-audit.md` — for regulated industries

Don't create workflows preemptively. Add them when a real, repeating need emerges.
