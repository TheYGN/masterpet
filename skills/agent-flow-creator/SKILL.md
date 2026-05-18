---
name: agent-flow-creator
description: Creates a complete agent flow ("agent DNA") for any software project. Use this skill whenever the user wants to set up structured AI development agents for a new project, create specialized agents by domain/discipline, build an orchestrator that coordinates other agents, or set up a multi-agent team that mirrors a real engineering team. Trigger on phrases like "create agent flow", "set up agents for the project", "build a team of agents", "I want agents that know my project", "DNA של סוכנים", "flow של סוכנים", "צוות סוכנים לפרויקט", "סוכנים לפי תחומים". Also use when a user has just defined a project spec (PRD, tree diagram, architecture doc) and now wants to operationalize it with agents. Produces a complete /agents/ directory with orchestrator, disciplines, domain experts, product agents, and workflows — all tailored to the specific project.
---

# Agent Flow Creator

## What this skill does

This skill creates a **complete, project-specific agent flow** — a structured team of AI agents that mirrors a real software engineering team. The output is a `/agents/` directory in the user's project that becomes the "DNA" of how that project is built going forward.

Each agent is a markdown file with:
- **Frontmatter** describing role, specialty, activation triggers
- **Mission** statement
- **Stack & conventions** specific to the project
- **Decision rules** for the agent's domain
- **Handoff protocol** to other agents

A central **Orchestrator** reads incoming tasks and decides which agents to activate, in what order.

---

## When to use this skill

### Strong triggers
- "Create an agent flow for my project"
- "I want a team of agents that knows my project"
- "Build agents specialized by domain"
- "Set up the DNA of the project with agents"
- "צור flow של סוכנים", "צוות סוכנים", "סוכנים לפי תחומים"
- User just shared a PRD / spec / architecture diagram and wants to "make this real"

### Soft triggers (use judgment)
- User mentions wanting "structure" or "process" for a new project
- User asks about multi-agent coordination
- User feels overwhelmed by project scope and wants to break it down

### Don't trigger for
- Single-agent task ("write me an X")
- Existing agent flow that just needs a small tweak (just edit the file)
- Generic agent advice ("how do agents work?")

---

## The architecture this skill produces

```
/agents/
├── README.md                    ← Documents the DNA
├── 00-orchestrator.md           ← The brain — task triage + agent selection
├── disciplines/                 ← Technology experts
│   ├── frontend-engineer.md
│   ├── backend-engineer.md
│   ├── integrations-engineer.md
│   ├── ai-ml-engineer.md
│   ├── devops-engineer.md
│   └── qa-engineer.md
├── domain-experts/              ← Project-specific subject matter experts
│   ├── [domain-1]-expert.md
│   ├── [domain-2]-expert.md
│   └── ...
├── product/                     ← Planning & design
│   ├── product-manager.md
│   └── ux-designer.md
└── workflows/                   ← Reusable orchestration playbooks
    ├── feature-development.md
    ├── bug-fix.md
    └── sprint-planning.md
```

### Why this structure (the why, not just the what)

**Disciplines** are technology experts that work on every module. A `backend-engineer` writes Postgres schemas whether the module is billing, orders, or users. They're stable across projects with similar stacks.

**Domain experts** know the specific subject matter of *this* project. For a pet-food SaaS that's `pet-nutrition-expert`. For a fintech project it'd be `compliance-expert`. They're consulted by disciplines — not the other way around.

**Both are needed**: An engineer without a domain expert builds generic schemas; a domain expert without an engineer writes specs nobody can implement.

**The Orchestrator** uses a 3-axis decision tree: **Phase** (where in roadmap) × **Task** (what kind of work) × **Risk** (how sensitive). This matches how real tech leads + scrum masters think.

---

## How to use this skill

### Step 1: Understand the project (10-15 min interview)

Ask the user these questions if you don't already have the answers from prior conversation:

1. **What is the project?** One-paragraph description.
2. **What's the spec source?** PRD, tree diagram (like Excalidraw), code already exists? Read it before continuing.
3. **What's the tech stack?** Frontend, backend, integrations, AI? Even if undecided, get current best guesses.
4. **What are the phases/milestones?** MVP, P2, P3? Or different structure?
5. **What domain knowledge is special to this project?** (E.g., pet nutrition, legal compliance, fintech regulation, healthcare HIPAA).
6. **Where do you want the /agents/ directory?** Default: project root.

**Read the spec source carefully.** The agents you create must reference it (with relative paths) so they always have context.

### Step 2: Plan the agent roster

Based on the project, decide:

**Disciplines** — usually 4-6 of:
- frontend-engineer (if there's UI)
- backend-engineer (if there's data/server)
- integrations-engineer (if external APIs)
- ai-ml-engineer (if AI features)
- devops-engineer (always recommended)
- qa-engineer (always recommended)
- mobile-engineer (if iOS/Android native)
- data-engineer (if pipelines/analytics-heavy)

**Domain experts** — derived from the spec. Examples:
- E-commerce → `payments-expert`, `inventory-expert`
- Healthcare → `hipaa-compliance-expert`, `medical-coding-expert`
- Pet food → `pet-nutrition-expert`, `pet-owner-behavior-expert`
- Fintech → `kyc-aml-expert`, `regulatory-expert`
- For any Israeli project → `hebrew-rtl-expert`, `israeli-logistics-expert` (if shipping)

**Product agents** — almost always:
- product-manager
- ux-designer
- (occasionally: technical-writer, growth-marketer)

**Workflows** — start with these 3, add project-specific ones later:
- feature-development
- bug-fix
- sprint-planning

### Step 3: Show the user the proposed roster

Present a clear summary like:

```markdown
## Proposed agent roster

**Orchestrator** — task triage + agent selection

**Disciplines** (6):
- frontend-engineer — Next.js 14, shadcn, RTL
- backend-engineer — Supabase Postgres, RLS
- integrations-engineer — WhatsApp, Stripe, Wolt
- ai-ml-engineer — Claude API, pgvector (Phase 2+)
- devops-engineer — Vercel, GitHub Actions
- qa-engineer — Playwright, Vitest

**Domain experts** (4):
- pet-nutrition-expert — FEDIAF, daily consumption
- hebrew-rtl-expert — Hebrew copy, RTL CSS
- israeli-logistics-expert — Israeli shipping, holidays
- saas-billing-expert — Subscriptions, Israeli tax

**Product** (2):
- product-manager — PRDs, RICE prioritization
- ux-designer — Wireframes, Material 3 RTL

**Workflows** (3): feature-development, bug-fix, sprint-planning

Shall I proceed?
```

**Wait for approval before generating files.**

### Step 4: Generate the files

Generate the files in this order:

1. `/agents/` directory + subdirectories
2. `README.md` — the DNA overview (see `references/templates/readme-template.md`)
3. `00-orchestrator.md` — adapt `references/templates/orchestrator-template.md` to project
4. Disciplines — each from `references/templates/disciplines/*` adapted to stack
5. Domain experts — write fresh from project spec; reference patterns in `references/templates/domain-expert-template.md`
6. Product agents — from `references/templates/product/*`
7. Workflows — from `references/templates/workflows/*` adapted to disciplines available

**Critical**: Every agent file must:
- Reference the project spec by relative path in "Context to read"
- Use the user's specific stack (not generic)
- Include "חוקים אדומים" / "Red rules" — non-negotiables
- Have clear handoff to other agents (by name)

### Step 5: Verify and demonstrate

After creating all files:

1. List what was created
2. Show one example invocation of the Orchestrator
3. Tell the user how to use it day-to-day:
   - "When you start a new task, say: 'Read /agents/00-orchestrator.md and handle: [task]'"
   - "For a specific area, jump directly: 'Read /agents/disciplines/backend-engineer.md and design a schema for X'"

### Step 6: Offer to refine

Ask: "Want to adjust any agent's instructions, add a domain expert, or create a project-specific workflow?"

---

## Adaptation rules

### Tech stack variations

If the project uses different tech, adapt the disciplines:

| Default | If user has... | Replace/add |
|---------|---------------|-------------|
| Next.js | Remix / Astro / Vue | Update frontend-engineer's stack section |
| Supabase | Firebase / Convex / custom Postgres | Update backend-engineer's stack, RLS may not apply |
| Anthropic Claude | OpenAI / other LLM | Update ai-ml-engineer's model references |
| Vercel | AWS / Cloudflare / self-hosted | Update devops-engineer's pipeline |

### Domain variations

If the project is in a regulated industry:
- Add `compliance-expert` (HIPAA / SOC2 / PCI / GDPR-EU specific)
- Increase `risk_sensitivity` defaults to High
- Add stricter workflow gates

If the project is consumer-facing at scale:
- Add `growth-engineer` (analytics, experiments)
- Add `customer-success-expert`

### Hebrew/RTL projects
- Always add `hebrew-rtl-expert`
- Default UX to mobile-first RTL
- Include Heebo font in design system

---

## Common pitfalls to avoid

### 1. Too many agents
Start with 10-13 agents total. More agents ≠ better — it just adds noise and overlap. Add specialized ones only when a real need emerges.

### 2. Generic agents
An agent that says "I write code" is useless. Each agent must have:
- Specific stack
- Specific conventions
- Project-specific examples

### 3. No handoff protocol
Agents that don't know who to consult next become silos. Every agent must list "when to call X agent" in the Handoff section.

### 4. Missing red rules
Without "חוקים אדומים" / "Red rules", agents default to whatever feels right. With them, they have non-negotiables that prevent disasters (e.g., "never commit secrets", "never skip QA on high-risk").

### 5. Skipping the Orchestrator
Some users want to "just have specialists". This breaks down fast — they end up manually deciding who to call every time. The Orchestrator is what makes the system *flow*.

### 6. Not reading the spec
If the agents don't reference the project spec (PRD, tree, architecture), they'll drift over time. Every agent file must say "Context to read: [spec file]" at the top.

---

## Templates

See `references/templates/` for starting templates of each agent type. These are *patterns*, not final files — always adapt to the specific project.

---

## Done state

The skill is complete when:
1. `/agents/` directory exists with all files
2. User has verified the roster matches their project
3. User has tried at least one invocation through the Orchestrator
4. User knows how to add/modify agents going forward
