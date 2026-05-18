# Agent file — Universal Template

Every agent file in `/agents/` follows this structure. Adapt for the specific role.

---

```markdown
---
name: <kebab-case-name>
role: <human-readable role>
specialty: <core expertise, comma-separated keywords>
activates_when: <conditions for when the orchestrator picks this agent>
phase: [MVP | P2 | P3 | ALL]
risk_sensitivity: [Low | Medium | High]
---

# <Agent Display Name>

## Mission
<One paragraph. What does this agent do? What's its purpose? Why does it exist?>

## Context to read
<List of files the agent must read before starting any task. Always include
the main spec/PRD/tree diagram of the project. Use relative paths.>

1. [project-spec.md](../../project-spec.md) — the source of truth
2. [related-agent.md](./related-agent.md) — when to consult
3. ...

## Stack & Conventions

### Required tools/libraries
- <Tool 1> — why
- <Tool 2> — why

### Forbidden
- <Anti-pattern 1> — why it's wrong
- <Anti-pattern 2>

### Code/output template
\`\`\`<lang>
<reference example>
\`\`\`

## Decision rules

### <Decision 1: How to choose between X and Y>
- If <condition A> → use <X>
- If <condition B> → use <Y>
- Default → <Z>

### <Decision 2: When to do/not do something>
...

## Handoff

### When to call another agent
- **<agent-name>** — when <condition>
- **<agent-name>** — when <condition>

### Output format
What this agent always produces:
1. <Artifact 1>
2. <Artifact 2>
3. <Artifact 3>

## Red rules (חוקים אדומים)
- **Never** <non-negotiable 1>
- **Never** <non-negotiable 2>
- **Always** <non-negotiable 3>
```

---

## Tips for writing each section

### Frontmatter

**name**: Lowercase kebab-case. Matches filename.

**role**: Human-friendly. Used in conversation ("the backend-engineer says...").

**specialty**: Keywords for matching. Be specific — `"PostgreSQL, RLS, indexing"` not `"databases"`.

**activates_when**: Triggers for the Orchestrator. Be precise — `"schema changes, new tables, RLS policies"` not `"backend stuff"`.

**phase**: When in the project lifecycle is this agent relevant?
- `ALL` — always
- `MVP` — early-stage only (rarely used; most agents are ALL)
- `P2, P3` — later phases (e.g., `ai-ml-engineer` if AI is a Phase 2 feature)

**risk_sensitivity**: How much harm can mistakes by this agent cause?
- `Low` — UX text, cosmetic
- `Medium` — UI flows, business logic
- `High` — billing, auth, RLS, security, data migrations

### Mission

A *paragraph* — not a sentence. Explain:
- What the agent does
- Why it exists
- What success looks like from this agent's perspective

### Context to read

Critical. Without this, agents drift. Always include:
- Main project spec (PRD, tree, architecture doc)
- Related agents that might be consulted
- Existing code/config they need to be aware of

### Stack & Conventions

Be opinionated. Don't say "use a database" — say "use Supabase Postgres with RLS". The whole point of agents is to encode decisions so they're not re-litigated every time.

Include a **code template** if applicable. Engineers should be able to copy-paste the pattern.

### Decision rules

This is where the agent's *expertise* lives. Tables work great:

| If you have... | Do this | Because... |
|----------------|---------|------------|
| ... | ... | ... |

### Handoff

Be explicit about who's next. Names matter — say "frontend-engineer" not "the UI person".

### Red rules

Non-negotiables. Use "Never" / "Always". These prevent disasters. Keep to 4-6 rules — more than that and they lose weight.

---

## Length guidance

- Discipline agent: 100-300 lines
- Domain expert: 150-400 lines (more knowledge content)
- Product agent: 200-400 lines (lots of frameworks)
- Workflow: 150-300 lines
- Orchestrator: 150-250 lines

If an agent is exceeding 500 lines, split it into multiple specialized agents.
