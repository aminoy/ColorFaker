#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<USAGE
Usage:
  $(basename "$0") --brief <path> [--out <dir>] [--dry-run]

Description:
  Runs the orchestrator + specialist Codex workflow for one weekly cycle.

Options:
  --brief <path>   Path to an initiative brief markdown/text file.
  --out <dir>      Output directory (default: ./marketing-os/out/<timestamp>)
  --dry-run        Print commands without executing Codex.
  -h, --help       Show this help.
USAGE
}

BRIEF_PATH=""
OUT_DIR=""
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --brief)
      BRIEF_PATH="${2:-}"
      shift 2
      ;;
    --out)
      OUT_DIR="${2:-}"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$BRIEF_PATH" ]]; then
  echo "Error: --brief is required." >&2
  usage
  exit 1
fi

if [[ ! -f "$BRIEF_PATH" ]]; then
  echo "Error: brief file not found: $BRIEF_PATH" >&2
  exit 1
fi

if [[ -z "$OUT_DIR" ]]; then
  OUT_DIR="marketing-os/out/$(date +%Y%m%d-%H%M%S)"
fi

mkdir -p "$OUT_DIR"
BRIEF_CONTENT="$(cat "$BRIEF_PATH")"

run_codex() {
  local output_file="$1"
  local prompt="$2"

  if $DRY_RUN; then
    echo "[dry-run] codex run '<prompt>' > $output_file"
  else
    codex run "$prompt" > "$output_file"
    echo "Wrote $output_file"
  fi
}

build_prompt() {
  local role="$1"
  local task="$2"
  cat <<PROMPT
You are the ${role}.

Business brief:
${BRIEF_CONTENT}

Task:
${task}

Return markdown with headings and actionable bullets.
PROMPT
}

run_codex "$OUT_DIR/01-orchestrator-plan.md" "$(build_prompt "Marketing Orchestrator" "Create this week's marketing execution plan with priorities, assignments, risks, and go/hold/iterate decision.")"
run_codex "$OUT_DIR/02-icp-messaging.md" "$(build_prompt "ICP & Messaging Strategist" "Produce ICP summary, message map, and channel-ready message variants.")"
run_codex "$OUT_DIR/03-seo-content.md" "$(build_prompt "SEO & Content Lead" "Produce weekly content slate and briefs by funnel stage with CTA.")"
run_codex "$OUT_DIR/04-paid-media.md" "$(build_prompt "Paid Media Manager" "Produce channel budget split, creative testing matrix, and 14-day optimization plan.")"
run_codex "$OUT_DIR/05-lifecycle-crm.md" "$(build_prompt "Lifecycle & CRM Manager" "Produce lifecycle journey map, workflow copy blocks, and suppression rules.")"
run_codex "$OUT_DIR/06-analytics-experiments.md" "$(build_prompt "Analytics & Experimentation Lead" "Produce tracking checklist, experiment backlog, and weekly insights memo.")"

if $DRY_RUN; then
  echo "[dry-run] synthesis step skipped execution"
else
  SYNTHESIS_INPUT="$(cat "$OUT_DIR"/0*-*.md)"
  codex run "You are the Marketing Orchestrator. Synthesize the following specialist outputs and provide final 7-day action plan, launch readiness, and critical fixes.

${SYNTHESIS_INPUT}" > "$OUT_DIR/07-orchestrator-synthesis.md"
  echo "Wrote $OUT_DIR/07-orchestrator-synthesis.md"
fi

echo "Done. Output directory: $OUT_DIR"
