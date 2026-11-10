---
phase: 04-lighting
plan: 02
subsystem: game
tags: [phaser4, lighting, dynamic-texture, flicker, occlusion, veil-fade, vitest]

requires:
  - phase: 04-lighting
    provides: plan 01's veil RenderTexture, occluded torch DynamicTexture, light registry and pure veil math
  - phase: 02-multi-room
    provides: room zones, door axes, currentRoom state and glide path

provides:
  - src/game/systems/lightFlicker.ts — framework-free seeded brightness pattern (hashSeed, brightnessAt)
  - src/game/systems/lighting.ts — crossedAxis, fadeMix, lerpAlpha and FADE_MS
  - src/game/objects/Light.ts — baked wall-occluded static pools, ADD tint images, per-source flicker alpha and wall-line fade state
  - src/game/scenes/LivingRoomScene.ts — beginFade hook at glide start

affects: [04-lighting (verification), 05-audio, 06-content]

actuals:
  tokens: 0
  tasks: 3
  commits: 4
  plan_head_before: 48f2835155542eb1e65ad5e4c2aa0ce580e384fa
  plan_head_after: 2d4775c327a9c14dc81a0ad471415a4374d91293

tech-stack:
  added: []
  patterns:
    - "static pool = one baked DynamicTexture per source (base ring stamp + single accumulated-wall-shadow erase), then one ERASE veil stamp per frame"
    - "colored light = one ADD-blend Image per source reusing the baked pool texture, so occlusion and falloff come free"
    - "flicker = stateless O(1) hash partition of the scene elapsed clock; no random source, no wall clock, no state to reset"
    - "veil fade = per-region alpha lerp started by the per-frame wall-axis crossing, cleared only when currentRoom reaches the destination"

key-files:
  created:
    - src/game/systems/lightFlicker.ts
    - src/game/systems/lightFlicker.test.ts
  modified:
    - src/game/objects/Light.ts
    - src/game/systems/lighting.ts
    - src/game/systems/lighting.test.ts
    - src/game/scenes/LivingRoomScene.ts

key-decisions:
  - "pools are baked once in the constructor; the per-frame path stays one clear, four fills, five ERASE stamps and one torch rebuild (D-21)"
  - "the torch tint image reuses the live __TORCH__ DynamicTexture, so the warm hole inherits occlusion and the facing lobe with no second render path"
  - "the flicker block uses a half-block change offset, keeping lamp changes 500-1500ms apart and screen changes 1000-3000ms apart"
  - "the fade starts on the wall-line crossing, not on glide start, and is cleared only after currentRoom catches up, so the veil cannot snap mid-glide"

patterns-established:
  - "Temporal visual effects derive from the scene-accumulated elapsed value plus a registry-id seed — never Math.random, Date.now or persistence"
  - "New pure behavior lands in a framework-free module with a colocated vitest suite; the Phaser layer only consumes it"

requirements-completed: [LITE-01, LITE-02, LITE-03]

coverage:
  - id: D1
    description: "All five sources bake a wall-occluded pool and erase it out of the veil every frame"
    requirement: LITE-02
    verification:
      - kind: unit
        ref: "lighting.test.ts — source-core coverage + registry↔decor contract"
        status: pass
      - kind: integration
        ref: "Light.ts bakePool + refillVeil loop; dev smoke served game-root"
        status: pass
    human_judgment: true
    rationale: "Pool colours and wall stops need the browser backstop at phase verification"
  - id: D2
    description: "Every pool tints what stands inside it, and the torch hole reads warm"
    requirement: LITE-02
    verification:
      - kind: integration
        ref: "LIGHTS loop creates one ADD image per source at depth 19; torch tint image follows the player"
        status: pass
    human_judgment: true
    rationale: "Warm/cold reading is a visual judgment"
  - id: D3
    description: "The source rect stays full-bright inside the inner clear ring"
    requirement: LITE-02
    verification:
      - kind: unit
        ref: "lighting.test.ts — 0.5 * radius >= hypot(7, 4) for every source"
        status: pass
    human_judgment: false
  - id: D4
    description: "Lamps flicker subtly, screens wobble fainter and slower, the torch stays steady"
    requirement: LITE-03
    verification:
      - kind: unit
        ref: "lightFlicker.test.ts — determinism, bands, cadence, distinct seeds, lamp divergence"
        status: pass
    human_judgment: true
    rationale: "'Subtle, not distracting' needs the browser backstop"
  - id: D5
    description: "The veil fades across the wall line during a glide and never snaps on arrival"
    requirement: LITE-01
    verification:
      - kind: unit
        ref: "lighting.test.ts — crossedAxis all four directions, fadeMix clamping, lerpAlpha endpoints"
        status: pass
      - kind: integration
        ref: "LivingRoomScene.startGlide calls beginFade; glide-end setCurrentRoom untouched"
        status: pass
    human_judgment: true
    rationale: "The transition read is a visual judgment"

duration: 20min
completed: 2026-11-08
status: complete
---

# Phase 4 Plan 2: Colored Pools + Flicker + Door-Line Fade Summary

**The dark house gains its light sources: five wall-occluded colored pools that tint what they touch, breathe on independent seeded rhythms, and a veil that fades across the wall line instead of snapping**

## Performance

- **Duration:** 20 min
- **Completed:** 2026-11-08
- **Tasks:** 3
- **Files created:** 2
- **Files modified:** 4

## Accomplishments
- Three warm lamps and two cold screens each erase a baked, wall-occluded pool out of the veil — one loop over the registry, no per-source state
- Each pool adds an ADD-blend tint image at depth 19, so everything standing in the light reads warm or cold, breathing with the pool it belongs to
- The torch hole is warm via a tint over the live `__TORCH__` texture, inheriting its occlusion and facing lobe
- Lamps flicker inside [0.82, 1.0] every 500-1500ms and screens inside [0.94, 1.0] every 1000-3000ms, out of phase by construction; the torch never flickers
- The veil lerps 0.7↔0.95 over 400ms once the player crosses the door axis, with the yard held at `VEIL_ALPHA`
- **Two plan promises did not survive review:** "a neighbour room's pool is glimpsable through the doorway openings" is unmeetable at the locked radii (measured: Living Room lamp 111.2 px to the north gap against radius 88; TV 40.8 px against 40 — no pool circle ever reaches an opening), and the strict D-12 "source object stays full-bright" now trades against D-14 (one flicker value drives both the hole and the wash, so the fixture sits under ~0.13 black at a lamp's dimmest step). Both are recorded with evidence in `04-VERIFICATION.md` advisories and put to the human in `04-UAT.md`, not hidden.

## Task Commits

1. **Task 1: Baked wall-occluded pools + ADD tint images** - originally `3305bf7`, folded into the squashed `8a4e7a1`
2. **Task 2: Seeded, independent, brightness-only flicker** - originally `2b6f630`, folded into `8a4e7a1`
3. **Task 3: Wall-line veil fade during glides** - originally `880d206`, folded into `8a4e7a1`
4. **Post-review fixes (all six review findings)** - the commit that follows `8a4e7a1` in `src/game/objects/Light.ts`, `src/game/systems/lighting.ts` and their tests

The three task commits were unreachable after the pre-verification squash (AGENTS.md §"Squash discipline"), so this record names the squashed commit instead and points at the code, not the history.

## Files Created/Modified
- `src/game/systems/lightFlicker.ts` — `FLICKER_BLOCK_MS`, `LAMP_MIN`, `SCREEN_MIN`, `hashSeed`, `brightnessAt`
- `src/game/systems/lightFlicker.test.ts` — 5 cases pinning determinism, bands, cadence, seed separation and lamp divergence
- `src/game/objects/Light.ts` — `poolTextureKey`, `bakePool`, `this.pools` (light/key/seed/tint), torch tint image, `beginFade`, per-region alpha routine
- `src/game/systems/lighting.ts` — `FADE_MS`, `crossedAxis`, `fadeMix`, `lerpAlpha`
- `src/game/systems/lighting.test.ts` — fade helper cases plus the D-12 source-core property
- `src/game/scenes/LivingRoomScene.ts` — `beginFade(side.dest, door.axis, side.dir)` before the glide tween

## Decisions Made
- **Bake once, stamp per frame:** each `pool-<lightId>` DynamicTexture is built in the constructor from the base ring texture with all wall-shadow quads erased in one accumulated Graphics pass. Per-frame work stays flat as the registry grows.
- **Tint is a second consumer of the same texture:** the ADD image reuses the baked pool (and the live torch texture), so no separate tint geometry can leak past a wall.
- **Flicker is stateless:** `brightnessAt` is an O(1) hash partition of `(seed, block, sub)`; there is no timer or state to reset on scene restart, and no `Math.random`/`Date.now` anywhere.
- **Fade keyed to the wall line:** the clock starts only on `crossedAxis`, and the fade is cleared only after `currentRoom` reaches the destination, so the glide-end state flip cannot snap the veil.

## Deviations from Plan

- **Executor dispatch unavailable:** as in plan 01, the configured executor model is absent and the paid equivalent fails on account funds, so the plan executed inline. Task and commit structure were kept.
- **TDD commit shape:** tests and implementation landed in the same commit per task because the project gate requires a green suite before a commit arrives; the RED step was run locally first (the flicker suite failed on the missing module before it existed).
- **Post-review fixes (`2d4775c`), applied after the code review of this plan:**
  - the pool tint now uses the same `brightnessAt` value as the veil-erase stamp, so the coloured wash breathes with the hole instead of sitting at a constant `TINT_ALPHA`
  - the veil level decision moved out of `Light.ts` into pure `regionAlpha(fade, elapsed, current, region)` in `lighting.ts`, with four cases in `lighting.test.ts` — including the pre-crossing hold and the destination hold, which nothing covered before
  - two source-text cases pin D-16 (the torch stamp contains no flicker call) and D-04 (only the room regions go through the fade), following the `src/test/commit-gate.test.ts` precedent
  - `localQuads` (a `new Phaser.Math.Vector2` per corner, every frame) is replaced by `fillShadowQuads`, which writes into one reusable four-point quad — `Graphics.fillPoints` reads `x`/`y` immediately and keeps no reference
  - `LightLayer.update`'s unused `_delta` parameter dropped; `POOL_KEY` and the duplicated erase-ordering comment merged into `basePoolKey(radius)` + one shared helper
  - Suite 109 → 115, gate re-run green

## Issues Encountered

None.

## User Setup Required

None.

## Next Phase Readiness

- LITE-01/02/03 are implemented and unit-pinned; what remains is the browser backstop at phase verification (pool colours, wall stops, flicker subtlety, fade read).
- The lit path is data-driven: adding a source means one `LIGHTS` entry, and the pool, tint, occlusion and flicker follow automatically.

---

*Phase: 04-lighting*
*Completed: 2026-11-08*

## Self-Check: PASSED

- All six plan files exist and are committed
- The three task commits were folded into the pre-verification squash (`8a4e7a1`), and the six post-review fixes sit on top as `2d4775c`; the original per-task SHAs are no longer ancestors of HEAD by design
- Full gate green on final state: `pnpm format`, `pnpm test` (115 tests), `pnpm exec astro check` (0 errors), `pnpm build` (dist/index.html), dev server served `/darkfolio/` with `game-root`
- Negative guards pass: no `Math.random`/`Date.now`/`localStorage` in `src/game`, no DOM globals in `Light.ts`, torch stamp carries no flicker call (now pinned by a source-text case in `lighting.test.ts`), both `setCurrentRoom` call sites intact
- Two plan promises are recorded as not delivered rather than quietly claimed: pool light through a doorway opening (unmeetable at the locked radii) and a strictly constant-brightness fixture under flicker (traded against D-14). Both are in `04-VERIFICATION.md` advisories and `04-UAT.md`
