#!/usr/bin/env bash
# qa row model substituted from locked deepseek-v4-pro -> qwen3.8-max: locked model requires Global privacy region not configured on this account (D-13 evidence run, AGENTS.md roster + agent file unchanged).
# Dispatch smoke harness: run each team agent once on a closed-domain toy task
# and assert exit 0 + non-empty output + per-agent keyword (D-12/D-13).
set -u

mkdir -p .verify

# name|model|toy task|keyword regex (last field keeps its pipes via read's last-var)
AGENTS=(
  "game-lead|opencode-go/qwen3.8-max|Name the phase that follows Phase 00.1 in the Darkfolio roadmap and its one-line goal.|phase 1|core game loop"
  "phaser-specialist|opencode-go/kimi-k2.7-code|Which skills directory in this project covers Phaser arcade physics?|physics-arcade"
  "gameplay-dev|opencode-go/glm-5.3|Write the one-line TypeScript type annotation for a 2D velocity vector with x and y numbers.|interface|type|velocity"
  "qa|opencode-go/qwen3.8-max|List two things you would check in a PR that changes player movement speed.|speed|movement|test|check"
  "pixel-artist|opencode-go/mimo-v2.5-pro|Suggest a Darkwood-style shadow color as a six-digit hex code.|#[0-9a-fA-F]{6}"
  "designer|opencode-go/kimi-k3|One sentence: how bright should a CRT overlay dim read against the room art?|contrast|dim|overlay"
  "scribe|opencode-go/qwen3.8-flash|In one markdown sentence, describe what the qa agent does.|qa|review"
)

want_all=1
declare -A subset
if (( $# > 0 )); then
  want_all=0
  for a in "$@"; do subset["$a"]=1; done
fi

fail() { echo "FAIL $1 $2"; exit 1; }

for row in "${AGENTS[@]}"; do
  IFS='|' read -r name model task keyword_regex <<<"$row"
  if (( want_all == 0 )) && [[ -z "${subset[$name]+set}" ]]; then continue; fi
  timeout 300 opencode run --agent "$name" --model "$model" "$task" > ".verify/smoke-$name.log" 2>&1; rc=$?
  if (( rc != 0 )); then fail "$name" "exit $rc"; fi
  if [[ ! -s ".verify/smoke-$name.log" ]]; then fail "$name" "empty-log"; fi
  if ! grep -qiE "$keyword_regex" ".verify/smoke-$name.log"; then fail "$name" "keyword-miss"; fi
  echo "PASS $name"
done

echo "SMOKE_TEAM_OK"
