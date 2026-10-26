---
schema_version: 1
open_count: 7
waived_count: 0
fixed_count: 0
total_count: 7
last_updated: 2026-10-23T09:37:49.538Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 03 | deviation | src/game/data/interactables.ts |  | Plan's literal computer rect {520,30} is the centre of centre-anchored solids[1]; stored true top-left {510,23} to reproduce UI-SPEC badge anchor (520,15) and 15px desk gap | open |  | 2026-10-23T08:48:26.001Z |  |
| 2 | 03 | deviation | src/game/systems/dialog.test.ts |  | Plan-authored task1/task2 overlap: dialog behavior tests + E/Esc skip shipped in task 1; task 2 delivered setReveal guard + mode-form gate; stateAfterTyping(false)/paused wired by plan 02 | open |  | 2026-10-23T08:48:26.629Z |  |
| 3 | 03 | deviation | .planning/phases/03-interaction/03-01-SUMMARY.md |  | Executor model substituted (environment gate); init declares anthropic/claude-sonnet-5, sanctioned swap recorded in SUMMARY | open |  | 2026-10-23T08:48:27.254Z |  |
| 4 | 03 | stub | src/game/data/interactables.ts |  | lamp TOGGLE verb is placeholder wording — no lamp toggling built this phase (anticipates Phase 5) | open |  | 2026-10-23T09:05:58.542Z |  |
| 5 | 03 | stub | src/pages/contact.astro | 42 | placeholder contact handles hello@example.com / github.com/example / linkedin.com/in/example pending real URLs | open |  | 2026-10-23T09:37:48.259Z |  |
| 6 | 03 | stub | src/components/GameOverlay.astro | 128 | overlay contact slot ships same placeholder handles as src/pages/contact.astro | open |  | 2026-10-23T09:37:48.909Z |  |
| 7 | 03 | deviation | src/game/scenes/GameScene.ts |  | WR-01 deferred to Phase 8: GameScene window keydown listeners not disposed on scene shutdown (dormant until a second input-owning scene exists) | open |  | 2026-10-23T09:37:49.538Z |  |

````json
[
  {
    "id": 1,
    "kind": "deviation",
    "phase": "03",
    "file": "src/game/data/interactables.ts",
    "line": null,
    "description": "Plan's literal computer rect {520,30} is the centre of centre-anchored solids[1]; stored true top-left {510,23} to reproduce UI-SPEC badge anchor (520,15) and 15px desk gap",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-23T08:48:26.001Z",
    "resolved_at": null,
    "milestone": "v1.0"
  },
  {
    "id": 2,
    "kind": "deviation",
    "phase": "03",
    "file": "src/game/systems/dialog.test.ts",
    "line": null,
    "description": "Plan-authored task1/task2 overlap: dialog behavior tests + E/Esc skip shipped in task 1; task 2 delivered setReveal guard + mode-form gate; stateAfterTyping(false)/paused wired by plan 02",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-23T08:48:26.629Z",
    "resolved_at": null,
    "milestone": "v1.0"
  },
  {
    "id": 3,
    "kind": "deviation",
    "phase": "03",
    "file": ".planning/phases/03-interaction/03-01-SUMMARY.md",
    "line": null,
    "description": "Executor model substituted (environment gate); init declares anthropic/claude-sonnet-5, sanctioned swap recorded in SUMMARY",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-23T08:48:27.254Z",
    "resolved_at": null,
    "milestone": "v1.0"
  },
  {
    "id": 4,
    "kind": "stub",
    "phase": "03",
    "file": "src/game/data/interactables.ts",
    "line": null,
    "description": "lamp TOGGLE verb is placeholder wording — no lamp toggling built this phase (anticipates Phase 5)",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-23T09:05:58.542Z",
    "resolved_at": null,
    "milestone": "v1.0"
  },
  {
    "id": 5,
    "kind": "stub",
    "phase": "03",
    "file": "src/pages/contact.astro",
    "line": 42,
    "description": "placeholder contact handles hello@example.com / github.com/example / linkedin.com/in/example pending real URLs",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-23T09:37:48.259Z",
    "resolved_at": null,
    "milestone": "v1.0"
  },
  {
    "id": 6,
    "kind": "stub",
    "phase": "03",
    "file": "src/components/GameOverlay.astro",
    "line": 128,
    "description": "overlay contact slot ships same placeholder handles as src/pages/contact.astro",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-23T09:37:48.909Z",
    "resolved_at": null,
    "milestone": "v1.0"
  },
  {
    "id": 7,
    "kind": "deviation",
    "phase": "03",
    "file": "src/game/scenes/GameScene.ts",
    "line": null,
    "description": "WR-01 deferred to Phase 8: GameScene window keydown listeners not disposed on scene shutdown (dormant until a second input-owning scene exists)",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-23T09:37:49.538Z",
    "resolved_at": null,
    "milestone": "v1.0"
  }
]
````
