# Codex CLI Runbook

Use these prompt templates to operate the agent team from terminal sessions.

## 1) Run orchestrator

```bash
codex run "You are the Marketing Orchestrator. Build this week's plan from the following brief: <PASTE BRIEF>. Return priorities, assignments, risks, and go/hold/iterate decision."
```

## 2) Run specialist agents

### ICP & Messaging
```bash
codex run "You are the ICP & Messaging Strategist. Using this brief and constraints: <PASTE>. Return ICP summary, message map, and channel variants."
```

### SEO & Content
```bash
codex run "You are the SEO & Content Lead. Using this message map: <PASTE>. Return weekly content slate and content briefs with funnel stage and CTA."
```

### Paid Media
```bash
codex run "You are the Paid Media Manager. Using budget <BUDGET> and messaging variants: <PASTE>. Return budget split, testing matrix, and 14-day optimization plan."
```

### Lifecycle & CRM
```bash
codex run "You are the Lifecycle & CRM Manager. Build triggered workflows for these segments: <PASTE>. Return journey map, copy blocks, and suppression rules."
```

### Analytics & Experiments
```bash
codex run "You are the Analytics & Experimentation Lead. Validate this plan: <PASTE>. Return tracking checklist, experiment backlog, and weekly insights memo format."
```

## 3) Synthesize and decide

```bash
codex run "You are the Marketing Orchestrator. Synthesize the following specialist outputs: <PASTE ALL>. Return launch readiness, critical fixes, and final action plan for next 7 days."
```

## Notes
- Keep each prompt under one clear objective.
- Include KPI, owner, and deadline in every run.
- Ask for markdown tables when you need artifacts that can be copied into project trackers.
