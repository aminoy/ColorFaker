# Marketing Operating System for Codex CLI

This folder provides a practical blueprint for running a **marketing operating system** with Codex agents:

- one **primary orchestrator agent** that owns priorities, sequencing, and quality gates
- a team of **specialized execution agents** for channel, content, analytics, and experiments

The system is designed to run in short cycles (daily and weekly) directly from the Codex CLI.

## 1) Agent Topology

### Primary agent
- **Marketing Orchestrator** (`agents/orchestrator.md`)
- Responsibilities:
  - intake requests (campaign, launch, pipeline target)
  - decompose work into specialist tasks
  - assign owners, deadlines, and dependencies
  - enforce a Definition of Done before publishing

### Specialist agents
- **ICP & Messaging Strategist** (`agents/icp-messaging.md`)
- **SEO & Content Lead** (`agents/seo-content.md`)
- **Paid Media Manager** (`agents/paid-media.md`)
- **Lifecycle & CRM Manager** (`agents/lifecycle-crm.md`)
- **Analytics & Experimentation Lead** (`agents/analytics-experiments.md`)

Each specialist should operate as an independent CLI-run role with a narrow charter and explicit inputs/outputs.

## 2) Work Intake Model

Use one canonical brief per initiative:

```text
Initiative Name:
Business Goal:
Primary KPI:
Secondary KPIs:
Audience / Segment:
Offer / Narrative:
Budget / Constraints:
Deadline:
Known Dependencies:
```

The orchestrator should reject briefs missing KPI, owner, or deadline.

## 3) Execution Rhythm

- **Daily (15–30 min):** orchestrator triage, blocker removal, status normalization
- **Twice weekly:** specialist execution sync (content, paid, lifecycle)
- **Weekly:** KPI review and experiment planning
- **Monthly:** channel mix and messaging reset

This cadence keeps agents operating with fresh context while avoiding ad hoc work churn.

## 4) Standard Pipeline

1. **Plan:** orchestrator creates sprint backlog and specialist tickets
2. **Produce:** specialists deliver channel assets and recommendations
3. **QA:** orchestrator validates compliance + KPI instrumentation
4. **Launch:** paid/lifecycle/content publishing sequence
5. **Learn:** analytics agent reports deltas and proposes next tests

Reference playbook: `playbooks/campaign-launch.md`.

## 5) Codex CLI Operating Pattern

Recommended pattern:

1. Run orchestrator first to produce a task graph.
2. Run specialists in dependency order (messaging -> content/paid -> lifecycle -> analytics).
3. Re-run orchestrator for synthesis and go/no-go decision.

Use concise prompts that include:
- role
- business context
- constraints
- expected artifact format
- due date

## 6) Governance Rules

- No channel work ships without a measurable KPI.
- Every deliverable must include:
  - hypothesis
  - expected impact
  - owner
  - completion date
- Experiments require explicit stop/scale criteria.
- Weekly retro should produce at least one process improvement item.

## 7) Minimum Deliverables by Week 1

- Orchestrator backlog template
- 3 core campaign briefs
- Channel calendars (SEO, paid, lifecycle)
- Tracking plan (events, UTMs, attribution assumptions)
- Weekly insights memo format

Once these are in place, the team can run repeatable growth loops with low coordination overhead.
