---
phase: 04-lighting
plan: 01
subsystem: game
tags: [phaser4, lighting, render-texture, veil, occlusion, vitest]

requires:
  - phase: 03-interaction
    provides: zoom-1 UI camera whose construction-time ignore list keeps the UI full-bright, scene lifecycle and SHUTDOWN sweep
  - phase: 02-multi-room
    provides: rooms.ts center-anchored layouts, ROOM_ZONES, YARD_RECT, currentRoom state module

provides:
  - src/game/data/lights.ts — five-source registry plus every torch/pool constant Plan 02 consumes
  - src/game/systems/lighting.ts — pure veil/torch math (wallRects, veilAlphaFor, wallShadows, pointInPolygon, facingVector)
  - src/game/objects/Light.ts — LightLayer (640x480 veil RenderTexture at depth 20 + per-frame occluded torch DynamicTexture)
  - per-frame lighting that runs above every scene mode gate, so the torch tracks mid-glide and behind open UI

affects: [04-lighting (plan 02), 05-audio, 06-content]

actuals:
  tokens: 0
  tasks: 2
  commits: 3
  plan_head_before: d2c2df1c75beaf750d97d29d0f1906648a6553bf
  plan_head_after: 4246eef178949003676db6e43f7e8694dc65d6d7

tech-stack:
  added: []
  patterns:
    - "RenderTexture veil (black region fills per room) + ERASE stamp of a per-frame occluded torch DynamicTexture — native Phaser lighting rejected (no geometric occlusion, no per-room ambient)"
    - "silhouette quads erased out of the light's own texture, never per-quad erase under one flush (the DT buffer stores the Graphics reference)"
    - "quantized falloff by concentric source-over rings: removal levels 0.25 / 0.5 / 1.0"
    - "pure math takes arguments, the Phaser layer owns the rooms.ts composition (proximity.ts precedent)"

key-files:
  created:
    - src/game/data/lights.ts
    - src/game/systems/lighting.ts
    - src/game/systems/lighting.test.ts
    - src/game/objects/Light.ts
  modified:
    - src/game/scenes/LivingRoomScene.ts

key-decisions:
  - "wallShadows measures corner angles relative to the nearest-point direction: a wall due west of the light otherwise straddles atan2's wrap and emits a far-face silhouette that leaks light"
  - "LightLayer is constructed immediately before InteractionUI so the zoom-1 UI camera's ignore list covers the veil (D-17)"
  - "the scene field is named lighting, never lights — Phaser.Scene already carries a LightsPlugin member"
  - "torch stays a neutral veil erase in this plan; TORCH_COLOR/TORCH_TINT_ALPHA are data now, the warm ADD-blend image is 04-02"

patterns-established:
  - "World-layer pixel effects are display objects constructed before InteractionUI and destroyed in the scene SHUTDOWN sweep"
  - "Registry entries copy decor hint tuples + room origin; lighting.test.ts asserts the copy so the center-anchored contract cannot silently flip"

requirements-completed: [LITE-01]

coverage:
  - id: D1
    description: "Current room renders at the 0.7 veil, other rooms at 0.95, yard shares the current room's level"
    requirement: LITE-01
    verification:
      - kind: unit
        ref: "src/game/systems/lighting.test.ts — veilAlphaFor/VEIL_ALPHA/NEAR_BLACK_ALPHA cases"
        status: pass
    human_judgment: true
    rationale: "The alphas are pinned; 'house reads dark and atmospheric' needs the browser backstop at phase verification"
  - id: D2
    description: "A 4-tile torch hole follows the player every frame, including mid-glide and behind open UI"
    requirement: LITE-01
    verification:
      - kind: unit
        ref: "lighting.test.ts — TORCH_RADIUS === 4 * TILE === 64"
        status: pass
      - kind: integration
        ref: "LivingRoomScene.update calls lighting.update as its first statements, above the gliding return"
        status: pass
    human_judgment: true
    rationale: "The tracking loop is machine-checked; smoothness needs a live frame walk"
  - id: D3
    description: "Torch light stops at walls and passes through the 48px doorway gaps"
    requirement: LITE-01
    verification:
      - kind: unit
        ref: "lighting.test.ts — (408,200) in no quad through the north gap, (500,200) shadowed, west wall silhouette on its near face"
        status: pass
    human_judgment: false
  - id: D4
    description: "Pool rims fall off in quantized steps, never a smooth gradient"
    requirement: LITE-01
    verification:
      - kind: unit
        ref: "lighting.test.ts — POOL_RINGS frac/alpha triplets"
        status: pass
    human_judgment: false
  - id: D5
    description: "All five registers keep their decor-hint position and colour"
    requirement: LITE-01
    verification:
      - kind: unit
        ref: "lighting.test.ts — registry↔decor table over all five entries"
        status: pass
    human_judgment: false
  - id: D6
    description: "Phase 3 UI stays full-bright and the boot gate stays lighting-free"
    requirement: LITE-01
    verification:
      - kind: integration
        ref: "new LightLayer line 101 < new InteractionUI line 102; GateScene.ts contains no Light token"
        status: pass
    human_judgment: false
  - id: D7
    description: "Torch reaches further toward the player's facing and rotates with direction changes"
    requirement: LITE-01
    verification:
      - kind: unit
        ref: "lighting.test.ts — facingVector for all four dirs, TORCH_LOBE_OFFSET/SCALE/ALPHA pinned"
        status: pass
    human_judgment: true
    rationale: "The bias math is pinned; the visible 'lantern-in-hand' reach needs the browser backstop"

duration: 25min
completed: 2026-11-08
status: complete
---

# Phase 4 Plan 1: Dark House + Lantern-in-Hand Summary

**The house goes dark under a room-keyed veil and the player carries a wall-occluded, facing-weighted torch — the render spine Plan 02 hangs colored pools and flicker on**

## Performance

- **Duration:** 25 min
- **Completed:** 2026-11-08T03:13:46Z
- **Tasks:** 2
- **Files created:** 4
- **Files modified:** 1

## Accomplishments
- Living room sits under a 70% black veil with shapes faintly readable; the office, bedroom and yard follow D-01/D-04
- The player's 4-tile torch rebuilds every frame from real wall geometry: light stops at walls and streams through both 48px doorway gaps
- Rim falloff lands on three quantized removal steps (≈1.0 / 0.5 / 0.25) instead of a smooth gradient
- The torch is facing-weighted — it reaches ~13px further in the walked direction and rotates with the player
- Lighting runs above every mode gate, so the torch tracks mid-glide and behind open dialog/overlay UI while the Phase 3 UI stays full-bright

## Task Commits

1. **Task 1a: Lighting registry + veil/torch math with tests** - `fb24942` (feat)
2. **Task 1b: Veil RenderTexture + occluded torch composite, wired into the scene** - `6ba42e0` (feat)
3. **Task 2: Facing-weighted torch lobe (RED test first, then implementation)** - `4246eef` (feat)

## Files Created/Modified
- `src/game/data/lights.ts` — `LIGHTS` (5 entries copied from decor hints), `LAMP_RADIUS` 88, `SCREEN_RADIUS` 40, `TORCH_RADIUS` 64, `TORCH_COLOR`, tint alphas, lobe constants
- `src/game/systems/lighting.ts` — `VEIL_ALPHA`/`NEAR_BLACK_ALPHA`, `POOL_RINGS`, `wallRects`, `veilAlphaFor`, `wallShadows`, `pointInPolygon`, `facingVector`
- `src/game/systems/lighting.test.ts` — 13 cases pinning the math, the registry↔decor contract and the facing lobe
- `src/game/objects/Light.ts` — `ensurePoolTexture`, `LightLayer` (veil RT depth 20, `__TORCH__` DynamicTexture rebuilt per frame in one accumulate-then-erase pass)
- `src/game/scenes/LivingRoomScene.ts` — `lighting`/`litElapsed` fields, construction before `InteractionUI`, first statements of `update()`, SHUTDOWN destroy

## Decisions Made
- **Angular reference for silhouettes:** corner angles are measured from the nearest-point direction. Raw `atan2` min/max picks the far-face corners for a wall due west of the light, which would leave the near face un-occluded and leak light through the wall; a unit test pins the west case.
- **One erase, one flush:** all shadow quads accumulate into a single Graphics, then one `erase` + one `render`. Per-quad erases under a trailing flush would replay only the last quad.
- **`lighting`, not `lights`:** `Phaser.Scene` already ships a `LightsPlugin` member; shadowing it is a silent collision.

## Deviations from Plan

- **Executor dispatch unavailable:** the configured executor model (`anthropic/claude-sonnet-5`) is absent from this environment and its paid equivalent fails on account funds, so the plan executed inline instead of in a `gsd-executor` subagent. Task/commit structure and the gate were kept.
- **TDD commit shape:** the pure-module tests and implementation landed in one commit rather than a separate RED commit, because the project gate requires `pnpm test` to pass before a commit lands. The RED step was run locally before implementing (facing tests failed with `facingVector is not a function`, then passed).

## Issues Encountered

None.

## User Setup Required

None.

## Next Phase Readiness

- Plan 02 expands from a proven spine: static colored pools are texture baking + registry data, flicker is a pure seeded function, and the door-line fade is one hook in `startGlide` — no architectural change
- The veil is a single 640x480 RenderTexture, so per-room fade endpoints (0.7 ↔ 0.95) are already expressible as fill alphas

---
*Phase: 04-lighting*
*Completed: 2026-11-08*

## Self-Check: PASSED

- All four new files exist and are committed
- Commits `fb24942`, `6ba42e0`, `4246eef` are ancestors of HEAD
- Full gate green on final state: `pnpm format`, `pnpm test` (100 tests), `pnpm exec astro check` (0 errors), `pnpm build` (dist/index.html)
- Dev server served `/darkfolio/` with `game-root`
- Negative guards pass: no `Math.random`/`Date.now`/`localStorage` in `src/game`, no DOM globals in the lighting modules, no `Light` token in `GateScene.ts`, both `setCurrentRoom` call sites intact
