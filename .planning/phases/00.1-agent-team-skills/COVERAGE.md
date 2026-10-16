# API Coverage — Phase 00.1 (Agent Team & Skills)

*Produced for the `api-coverage.verify-pre` gate. Scope: external API surfaces this phase touches or could touch.*

| capability | decision | reason |
|---|---|---|
| Agent dispatch via OpenCode CLI (`opencode run --agent --model`) | INTEGRATE | Core deliverable; covered by `.verify/smoke-*.log` (one dispatch per roster agent, D-13 sign-off pending in UAT test 1). CLI must pass `--model` explicitly (2.0.29 frontmatter bug). |
| Model provider APIs (anthropic/*, opencode-go/*) via direct HTTP | OPT-OUT | Never called directly. All model traffic routes through the OpenCode CLI, which owns auth, retries, and provider wiring. Re-add if a later phase calls providers without the CLI. |
| MCP servers (codegraph, gsd) | OPT-OUT | Consumed as platform features, not built here. No phase-00.1 code speaks MCP directly. |
| GitHub / web REST or GraphQL APIs | OPT-OUT | Out of scope per REQUIREMENTS.md; no network surface added by this phase. |

**Summary:** one integrated surface (CLI dispatch), verified mechanically by the smoke harness; no direct external API calls exist in this phase's code, so there is no untested API path.
