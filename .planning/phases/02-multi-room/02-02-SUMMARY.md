---
phase: 02-multi-room
plan: 02
subsystem: game
tags: [phaser, vitest, rooms, geometry, door-glide, bedroom, yard]
requires:
  - phase: 02-multi-room
    plan: 01
    provides: Continuous 640x480 L-world, generic door-glide system, buildOffice builder, DOORS array
provides:
  - West door pair (Living <-> Bedroom) wired by data only
  - BEDROOM_LAYOUT dense room with D-16 phone host
  - YARD_LAYOUT exterior notch dressing
  - buildBedroom room-builder module
affects: [03-interaction, 04-lighting, 05-audio, 06-content-integration]
actuals:
  tokens: 3182
  tasks: 2
  commits: 3
  plan_head_before: ec1b482f7e70b3bb33a2d16979e3737a1ef55acd
  plan_head_after: 66ea82e
tech-stack:
  added: []
  patterns:
    - "Data-only expansion: west door + bedroom + yard added without touching the trigger loop"
    - "Exterior dressing as decoration-only Graphics/rects with zero physics bodies"
key-files:
  created:
    - src/game/scenes/BedroomScene.ts
  modified:
    - src/game/data/rooms.ts
    - src/game/data/rooms.test.ts
    - src/game/systems/doorGlide.test.ts
    - src/game/scenes/LivingRoomScene.ts
key-decisions:
  - "West door axis on the shared wall at house (320,344), 48px gap, rest spots at (272,344)/(368,344)"
  - "Bedroom sealed as dead-end: full north wall blocks the yard; full east split around the 48px gap"
  - "Yard non-walkable guaranteed by Office west wall + Bedroom north wall; no redundant colliders"
patterns-established:
  - "Every doorway tested clear on both sides via lane/rest-spot invariant assertions"
requirements-completed: [GAME-04, ROOM-01, ROOM-02]
coverage:
  - id: D1
    description: "Bedroom room exists as a 20x15 slice of the 640x480 L-world with dense D-17 furniture and the D-16 phone host"
    requirement: GAME-04
    verification:
      - kind: unit
        ref: "src/game/data/rooms.test.ts#bedroom dense layout"
        status: pass
    human_judgment: false
  - id: D2
    description: "West door slides into the Bedroom and the Bedroom east door slides back into the Living Room"
    requirement: ROOM-01
    verification:
      - kind: unit
        ref: "src/game/data/rooms.test.ts#west door gap alignment"
        status: pass
      - kind: unit
        ref: "src/game/systems/doorGlide.test.ts#west door"
        status: pass
    human_judgment: false
  - id: D3
    description: "All four door entries land on deterministic rest spots (408,192)/(408,288)/(272,344)/(368,344)"
    requirement: ROOM-02
    verification:
      - kind: unit
        ref: "src/game/systems/doorGlide.test.ts#west door"
        status: pass
    human_judgment: false
  - id: D4
    description: "Exterior yard notch renders as dark dirt/grass with silhouette props, never a walkable gap"
    requirement: GAME-04
    verification:
      - kind: unit
        ref: "src/game/data/rooms.test.ts#yard dressing"
        status: pass
    human_judgment: true
    rationale: "Visual read of the yard as exterior rather than a rendering bug is a human judgment"
duration: 25min
completed: 2026-10-21
status: complete
---

# Phase 02 Plan 02: Bedroom + Yard Summary

**Complete the L-house: the west door slides into a dense near-black Bedroom, the exterior notch reads as a dark yard, and all four door entries are deterministic — three rooms, both door pairs, full gate green.**

## Performance

- **Duration:** 25 min
- **Started:** 2026-10-21T12:27:00Z
- **Completed:** 2026-10-21T12:52:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- **West door pair live by data:** DOOR_WEST appended to DOORS; the existing generic trigger/glide loop picks it up with zero trigger-code change. Rest spots at house (272,344) facing left and (368,344) facing right, identical on every crossing.
- **Dense Bedroom:** BEDROOM_LAYOUT with the D-17 set (bed on the top wall, nightstand, phone host, wardrobe, dresser, mirror, floor lamp, walkable rug, book pile) in the deeper-brown/near-black D-18 palette with the warm lamp pop. buildBedroom composed into the one live scene.
- **Exterior notch dressed:** YARD_LAYOUT (dark dirt ground, grass patches, dead shrub, fence posts) rendered decoration-only by drawYard() before the room builders; zero physics bodies for the yard.
- **Invariants proven by test:** west gap disjoint from all living/bedroom walls; bedroom east lane (224,80,96,48), living west lane (16,80,48,48), both rest-spot body rects, and the phone tuple all asserted; sealed-wall no-door invariant still holds with DOORS length 2; every yard tuple stays inside YARD_RECT and clear of all room zones.

## Task Commits

1. **Task 1 RED: west door + bedroom layout specs** — `9f989f3` (test)
2. **Task 1 GREEN: bedroom room and west door pair** — `5263a79` (feat)
3. **Task 2: yard dressing in living room scene** — `66ea82e` (feat)

**Plan metadata:** (this commit)

## Files Created/Modified

- `src/game/scenes/BedroomScene.ts` — buildBedroom(scene, solids) room-builder module
- `src/game/data/rooms.ts` — west wall split, west threshold decor, DOOR_WEST, BEDROOM_LAYOUT, YARD_LAYOUT
- `src/game/data/rooms.test.ts` — west gap/alignment/lane/rest-spot/phone/yard invariants
- `src/game/systems/doorGlide.test.ts` — west-door determinism + no-retrigger cases
- `src/game/scenes/LivingRoomScene.ts` — buildBedroom composition + drawYard()

## Decisions Made

- **West door by data only:** appended DOOR_WEST to DOORS; no change to update()/startGlide() trigger logic, honoring the generic loop from Plan 01.
- **Yard non-walkable is structural:** Office's full west wall and Bedroom's full north wall already seal the notch, so drawYard() adds zero solids or bodies (ponytail).
- **YARD_LAYOUT shape mirrors RoomLayout:** center-anchored tuples with a `{ground, patches, props}` split, consistent with the rooms.ts anchor convention.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. Full gate green; no dependencies added; `src/game/main.ts` and `src/game/scenes/GateScene.ts` untouched.

## Verification

- **Full gate:** `pnpm format && pnpm test && pnpm exec astro check && pnpm build && test -f dist/index.html` → green (50 tests / 6 files).
- **Dep-invariance (T-02-SC):** `package.json` + `pnpm-lock.yaml` untouched.
- **Dev smoke:** `http://localhost:4321/darkfolio/` serves `game-root`.

## Human Checks (deferred to end-of-phase UAT)

- Walk west through the doorway — glide carries the player into the near-black Bedroom with the warm lamp pop; walk east to return; repeat — rest spots pixel-identical.
- Bed/nightstand glimpsable through the gap before crossing (D-15).
- Full SC#1-6 walk: spawn in Living -> north door glide into Office -> south door back -> west door glide into Bedroom -> east door back; collision and camera follow live in all three rooms; peeking past outer corners shows dark yard with shrub + fence silhouettes, never a black void or walkable gap; no console errors on boot.

## Known Stubs

None — every layout tuple is a real rendered rectangle; no placeholder text or unwired data.

## Next Phase Readiness

- Phase 2 complete: three dense, distinct 20x15 rooms in one continuous L-world, both door pairs sliding on deterministic glides, yard selling the dark-house premise.
- Phases 3-5 can import `getCurrentRoom()` and the `solids` host rects (computer, bookshelf, phone) from the layouts.
- GAME-04, ROOM-01, ROOM-02 fully delivered.

## Self-Check: PASSED

- All key files exist on disk (verified with `[ -f ]`).
- All three task commits are ancestors of HEAD (verified with `git merge-base --is-ancestor`).
- Full gate green; 50 tests pass.

---
*Phase: 02-multi-room*
*Completed: 2026-10-21*