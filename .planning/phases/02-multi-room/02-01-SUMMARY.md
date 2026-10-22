---
phase: 02-multi-room
plan: 01
subsystem: game
tags: [phaser, vitest, rooms, geometry, door-glide]

requires:
  - phase: 01-core-game-loop
    provides: Living Room coordinate contract (TILE/ROOM_*/WORLD_*/SPAWN_*), solids StaticGroup + Graphics-floor pattern, Player movement/facing
provides:
  - Continuous 640x480 L-world geometry contract (src/game/data/rooms.ts)
  - Pure room-zone system + first-class currentRoom store (D-11)
  - Pure door-glide system (reachRect / glideEnd / triggeredSide)
  - Dense Office layout with Phase-3 computer + bookshelf hosts
  - Living Room sealed east door + locked front door decor
affects: [03-interaction, 04-lighting, 05-audio, 06-content-integration]

actuals:
  tokens: 6019
  tasks: 3
  commits: 6
  plan_head_before: 6414cec325463d4149be2c21dcb21a50518013d4
  plan_head_after: de5bdd0

tech-stack:
  added: []
  patterns:
    - "Data-only room layouts: center-anchored wall/solid/decor tuples in src/game/data/rooms.ts, room-local + origin offset"
    - "Pure framework-free systems + co-located vitest specs (movement.ts precedent)"
    - "Room-builder modules (buildOffice) composed by the one live scene"
    - "Deterministic door glide: axis + 48px along the travel direction"

key-files:
  created:
    - src/game/data/rooms.ts
    - src/game/data/rooms.test.ts
    - src/game/systems/currentRoom.ts
    - src/game/systems/currentRoom.test.ts
    - src/game/systems/doorGlide.ts
    - src/game/systems/doorGlide.test.ts
    - src/game/state/currentRoom.ts
    - src/game/scenes/OfficeScene.ts
  modified:
    - src/game/scenes/LivingRoomScene.ts
    - src/game/objects/Player.ts

key-decisions:
  - "Promote WORLD_W/WORLD_H to the 640x480 L bounding box; per-room size becomes ROOM_W*TILE x ROOM_H*TILE with per-room origins"
  - "Tasks 2-3 ship data-only: the Task 1 builder loops render whatever the layout holds, so no builder changes were needed"
  - "Office rug lives in decor (walkable, D-17); computer + bookshelf live in solids as the Phase-3 hosts (D-16)"
  - "Sealed/locked door decor is decoration only — east and south walls stay single FULL solid tuples"

patterns-established:
  - "Layout invariants as runnable vitest assertions over the data module (gap alignment, lane/rest-spot clearance, no-door-on-sealed-walls)"

requirements-completed: [GAME-04, ROOM-01, ROOM-02]

coverage:
  - id: D1
    description: "Dense green Office identity with the computer + bookshelf Phase-3 hosts and a clear south walking lane"
    requirement: GAME-04
    verification:
      - kind: unit
        ref: "src/game/data/rooms.test.ts#office dense layout"
        status: pass
    human_judgment: false
  - id: D2
    description: "Living Room sealed east door + locked front door planks behind the spawn, with no door gap on the sealed wall bands"
    requirement: ROOM-01
    verification:
      - kind: unit
        ref: "src/game/data/rooms.test.ts#sealed wall bands and door decor"
        status: pass
    human_judgment: false
  - id: D3
    description: "Continuous L-world with deterministic north-door glide and the currentRoom store"
    requirement: ROOM-02
    verification:
      - kind: unit
        ref: "src/game/systems/doorGlide.test.ts"
        status: pass
      - kind: unit
        ref: "src/game/systems/currentRoom.test.ts"
        status: pass
    human_judgment: false
  - id: D4
    description: "Human visual confirmation of glide feel, dense Office sightline and boarded-door readability"
    requirement: ROOM-01
    verification: []
    human_judgment: true
    rationale: "Glide mood (D-13), sightline density (D-15) and boarded-door readability are visual judgments no assertion covers; the plan's <human-check> blocks defer them to end-of-phase UAT."

duration: 10min
completed: 2026-10-21
status: complete
---

# Phase 02 Plan 01: Continuous L-World Summary

**One continuous 640x480 L-house: a deterministic 48px door glide between the Living Room and Office, a dense green Office carrying the Phase-3 computer/bookshelf hosts, sealed + locked door decor, and the first-class currentRoom store Phases 3-5 read.**

## Performance

- **Duration:** 10 min
- **Started:** 2026-10-21T10:07:39Z
- **Completed:** 2026-10-21T10:17:55Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments

- **Continuous L-world (tracer):** one live scene, one player, one camera; the north door auto-glides the player through the aligned 48px gap (~700ms Sine.easeInOut) with deterministic rest spots at house (408,192) / (408,288) (D-09, D-13, D-14).
- **Pure systems + store:** `roomAt()` / `setCurrentRoomFrom()` (D-11) and `reachRect()` / `glideEnd()` / `triggeredSide()` (D-07) ship framework-free with co-located vitest specs.
- **Dense Office identity:** 9 solid tuples including the computer (Phase-3 Projects host) and bookshelf (Skills host), plus filing cabinet, floor lamp, two plants, chair, desk and typewriter table; the walkable rug lives in decor (D-15..D-19).
- **Living Room door decor:** sealed boarded east door (D-04) and locked front door behind the spawn (D-08), with the no-door-on-sealed-wall invariants enforced by test.

## Task Commits

Each task was committed atomically (Task 2-3 RED commit then GREEN commit, TDD-lite per AGENTS.md):

1. **Task 1: Tracer — continuous L-world** — `16ebb43` (test) + `603b5b8` (feat) — landed by the prior executor before its session ended; not re-run or re-committed here.
2. **Task 2: Office expansion** — `21a96c0` (test: office lane / host / rug specs) + `59c8a18` (feat: dense office solids and decor).
3. **Task 3: Living Room door decor** — `57963d1` (test: sealed-wall + behind-spawn specs) + `de5bdd0` (feat: sealed east and locked front door decor).

**Plan metadata:** `docs(02-01): complete continuous L-world plan` (this commit)

## Files Created/Modified

- `src/game/data/rooms.ts` — geometry contract: origins, zones, door defs, Living + Office layouts
- `src/game/data/rooms.test.ts` — layout invariants (gap alignment, lane/rest-spot clearance, host presence, sealed-wall guards)
- `src/game/systems/currentRoom.ts` — `RoomId`/`Rect`/`RoomZone` types + `roomAt()`
- `src/game/systems/currentRoom.test.ts`
- `src/game/systems/doorGlide.ts` — `Dir`/`DoorDef`/`DoorSide` types, `REACH`/`GLIDE_STEP`/`GLIDE_MS`/`GLIDE_EASE`, `reachRect`/`glideEnd`/`triggeredSide`
- `src/game/systems/doorGlide.test.ts`
- `src/game/state/currentRoom.ts` — `getCurrentRoom`/`setCurrentRoom`/`setCurrentRoomFrom` store (D-11)
- `src/game/scenes/OfficeScene.ts` — `buildOffice(scene, solids)` room-builder module (not a live scene)
- `src/game/scenes/LivingRoomScene.ts` — contract re-exports, `buildLiving`, house bounds, `startGlide`, data-driven trigger + store update
- `src/game/objects/Player.ts` — `setFacing(f)` / `getFacing()`

## Decisions Made

- **Coordinate contract:** `WORLD_W`/`WORLD_H` promoted to the 640x480 L bounding box; per-room size derived as `ROOM_W*TILE x ROOM_H*TILE` with `LIVING_ORIGIN`/`OFFICE_ORIGIN`/`BEDROOM_ORIGIN` — one contract, extended not replaced.
- **Data-only expansion:** Tasks 2-3 touched only `rooms.ts` + `rooms.test.ts`; the Task 1 generic builder loops rendered the new data with zero builder changes.
- **Host placement:** computer and bookshelf are `solids` (collision) at their future Phase-3 attach points; the rug is `decor` (walkable) per D-17.
- **Decor-only doors:** east and south walls remain single FULL solid tuples; the planks are atmosphere with no zone and no traversal.

## Deviations from Plan

None - plan executed exactly as written.

Task 2 and Task 3 were executed as TDD-lite: the new assertions were added first and observed failing (Task 2 target `office dense layout > places the dense office set with its phase-3 hosts` — "expected 0 to be greater than or equal to 8"; Task 3 target `sealed wall bands and door decor > places the front-door plank directly behind the spawn` — "expected undefined to be defined"), then the layout data was filled until green. RED evidence is recorded at `.verify/02-01-task2-red.json` and `.verify/02-01-task3-red.json`; the `gsd_run` CLI is not on PATH in this environment, so the machine classifier (`check tdd-red-evidence`) was unavailable — the RED runs above are the audit trail.

## Issues Encountered

None. `src/game/main.ts` and `src/game/scenes/GateScene.ts` remain untouched; no dependencies added.

## Verification

- **Full gate:** `pnpm format && pnpm test && pnpm exec astro check && pnpm build && test -f dist/index.html` → green.
- **`pnpm test`:** 36 tests / 6 files pass (`rooms.test.ts` 9, `doorGlide.test.ts` 8, `commit-gate.test.ts` 6, `currentRoom.test.ts` 7, `movement.test.ts` 5, `sanity.test.ts` 1).
- **Dep-invariance (T-02-SC):** `package.json` + `pnpm-lock.yaml` untouched.
- **Dev smoke:** `http://localhost:4321/darkfolio/` serves `game-root`.
- **Ponytail audit (post-fix hook):** diff reviewed — pure declarative layout tuples and test assertions; no over-engineering, nothing to simplify.

## Human Checks (deferred to end-of-phase UAT)

- Walk north into the doorway — ~0.7s floaty glide into the green Office, no fade/cut; input dead mid-glide, live after; south to return; rest spots pixel-identical on repeat.
- Standing in the Living Room, Office floor/furniture glimpsable through the north gap; after crossing, desk+computer, bookshelf, cabinet, lamp, plants, typewriter and rug all visible and blocking; rug walkable.
- East wall shows a dark boarded door the player cannot pass; behind the spawn the south wall shows the locked front-door planks with a lock glint.

## Known Stubs

None — every layout tuple is a real rendered rectangle; no placeholder text or unwired data.

## Requirements Traceability Note

`GAME-04`, `ROOM-01`, `ROOM-02` are declared by both plan 01 and plan 02 of this phase (per the plan's Source Audit). The shared-ID gate (`requirements.ready-ids`) blocks them from reading `Complete` until plan 02 also produces a SUMMARY, so this plan's `requirements-completed` lists them verbatim but the flip is deferred to the last declaring plan.

## Next Phase Readiness

- Ready for plan 02 (Bedroom + yard) — it appends `DOOR_WEST`/`BEDROOM_LAYOUT`/`YARD_LAYOUT` to the same `rooms.ts` contract and a `buildBedroom` module to the same scene.
- Phases 3-5 can import `getCurrentRoom()` from `src/game/state/currentRoom.ts` and the `solids` host rects from the layouts.

## Self-Check: PASSED

- All key files exist on disk (verified with `[ -f ]`).
- All six plan commits are ancestors of HEAD (verified with `git merge-base --is-ancestor`).
- All task acceptance criteria re-run green; full gate green.

---
*Phase: 02-multi-room*
*Completed: 2026-10-21*
