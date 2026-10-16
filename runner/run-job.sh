#!/bin/sh
# Runs one hired job in a fresh container.
# Env: AGENT (slug), JOB_ID, BRIEF_URL (presigned S3 GET), RESULT_PREFIX (s3://bucket/jobs/<id>/),
#      ANTHROPIC_API_KEY (injected for this task only).
set -eu

agent_dir="/possible/agents/$AGENT"
test -f "$agent_dir/instructions.md"

curl -fsSL "$BRIEF_URL" -o /work/BRIEF.md
mkdir -p /work/out

status=done
claude -p "Read BRIEF.md and deliver the job. Put every deliverable in ./out." \
  --append-system-prompt "$(cat "$agent_dir/instructions.md")" \
  --model "$(node -p "require('$agent_dir/agent.json').runtime.model")" \
  --permission-mode bypassPermissions \
  --output-format json > /work/out/run.json || status=failed

session=$(ls -t "$HOME"/.claude/projects/*/*.jsonl 2>/dev/null | head -1 || true)
if [ -n "$session" ]; then
  cp "$session" /work/out/session.jsonl
  possible capture claude-code "$session" --out /work/out/capture || true
fi

echo "$status" > /work/out/STATUS
aws s3 cp --recursive --only-show-errors /work/out "$RESULT_PREFIX"
