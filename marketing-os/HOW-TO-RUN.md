# How to Run the Marketing OS

## Prerequisites
- Codex CLI installed and available as `codex`
- You are in the repo root directory

## 1) Create/Edit your initiative brief
Start from the example brief:

```bash
cp marketing-os/examples/initiative-brief.md /tmp/my-brief.md
```

Edit `/tmp/my-brief.md` with your real goal, KPI, budget, and deadline.

## 2) Run a full weekly cycle

```bash
./marketing-os/scripts/run-weekly-cycle.sh --brief /tmp/my-brief.md
```

The script will create timestamped output files under:

```text
marketing-os/out/YYYYMMDD-HHMMSS/
```

Including:
- `01-orchestrator-plan.md`
- `02-icp-messaging.md`
- `03-seo-content.md`
- `04-paid-media.md`
- `05-lifecycle-crm.md`
- `06-analytics-experiments.md`
- `07-orchestrator-synthesis.md`

## 3) Dry run (preview commands only)

```bash
./marketing-os/scripts/run-weekly-cycle.sh --brief /tmp/my-brief.md --dry-run
```

## 4) Custom output directory

```bash
./marketing-os/scripts/run-weekly-cycle.sh --brief /tmp/my-brief.md --out /tmp/marketing-weekly
```

## 5) Optional: run single-agent manually

```bash
codex run "You are the Marketing Orchestrator. Build this week's plan from this brief: $(cat /tmp/my-brief.md)"
```
