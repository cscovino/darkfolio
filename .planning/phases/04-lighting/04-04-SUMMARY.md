---
phase: 04-lighting
plan: 04
subsystem: game
tags: [phaser4, lighting, veil, seam-walls, room-zones, vitest]

requires:
  - phase: 04-lighting (plans 01-03)
    provides: regionAlpha/VeilFade fade machinery, 5-point wallShadows on the collapsed layout, retuned radii (40/48/24)
  - phase: 02-multi-room
    provides: per-room RoomLayout tuples, ROOM_ZONES/currentRoom tracking, door zone/axis/glide contract

provides:
  - one shared 16px wall band + one door leaf per seam (office south / bedroom east tuples deleted; living bands own both seams)
  - DOOR_NORTH/WEST gaps resized 32px -> 16px thick, 48px opening unchanged; doorGlide suite passes untouched
  - VEIL_ZONES + SEAM_STRIPS (rect + its two bordering rooms) tiling the 640x480 box with the yard, no overlap
  - seamStripAlpha — pure Option A midpoint-switch rule (idle literal; min of bordering regionAlphas while a fade touches the strip)
  - refillVeil over VEIL_ZONES + SEAM_STRIPS, yard fill still literal
  - D-04 amendment recorded in 04-CONTEXT.md

affects: [04-lighting verification, 05-audio, 08-polish]

actuals:
  tokens: 4300
  tasks: 2
  commits: 3
  plan_head_before: acd2dc12aede003914872df1c84ff8ea2caa09f7
  plan_head_after: d50e37c06915132c12ec46c0a6646b929b655446

tech-stack:
  added: []
  patterns:
    - "attribution-in-data: each SEAM_STRIP records the two rooms it separates (RoomZone's id precedent), so the shading rule stays a pure function of (fade, elapsed, current, rooms)"
    - "no-jump midpoint: strip level = Math.min of the two bordering regionAlphas — equal at the fade midpoint, so a crossed strip profiles 0.7 -> 0.825 -> 0.7 continuously"
    - "tiling invariant test: pairwise rectsOverlap + area sum == WORLD_W*WORLD_H over VEIL_ZONES + SEAM_STRIPS + YARD_RECT guards against double-darkening"

key-files:
  created: []
  modified:
    - src/game/data/rooms.ts
    - src/game/data/rooms.test.ts
    - src/game/systems/lighting.ts
    - src/game/systems/lighting.test.ts
    - src/game/objects/Light.ts
    - .planning/phases/04-lighting/04-CONTEXT.md

key-decisions:
  - "Collapse is a pure deletion from Office/Bedroom — the Living layout's existing 16px bands already own both seams, so no axis move, no grid break, no glide retune (the rejected alternative straddled the seam off the 16px tile grid)"
  - "ROOM_ZONES stays the source of truth for roomAt/currentRoom; only the veil re-cuts to VEIL_ZONES + SEAM_STRIPS"
  - "seamStripAlpha rule 3 (strip adjacent to neither gliding room -> VEIL_ALPHA) is vacuous for today's two strips but pinned by a synthetic test so the stated Option A cannot silently drift"
  - "D-16 source-grep guard re-expressed for the strip fill: zones slice must contain regionAlpha + seamStripAlpha; the yard slice must contain neither — rooms fade-derived, yard literal, torch steady"

patterns-established:
  - "geometry deletions ship with a tiling + attribution test over the new region data, not just the deleted-duplicate check"

requirements-completed: [LITE-01]

coverage:
  - id: D1
    description: "Each shared seam is one 16px wall band with one door leaf — office/bedroom duplicates gone, gaps resized to the single band, 48px opening preserved"
    requirement: LITE-01
    verification:
      - kind: unit
        ref: src/game/data/rooms.test.ts#shared seams (5 cases: band absence x2, single leaf, gap rects, 48px opening)
        status: pass
      - kind: unit
        ref: src/game/systems/lighting.test.ts#wallRects covers every wall of every room (living 6, office 3, bedroom 3)
        status: pass
      - kind: unit
        ref: src/game/systems/lighting.test.ts#wallShadows wide-angle coverage (registry probe re-passes on the collapsed layout)
        status: pass
      - kind: unit
        ref: src/game/systems/doorGlide.test.ts (entire suite unchanged, 21 green)
        status: pass
    human_judgment: false
  - id: D2
    description: "Veil re-cut: VEIL_ZONES + SEAM_STRIPS + YARD_RECT tile the world; the shared band rides the current-room level idle and switches rooms at the fade midpoint (Option A, no-jump profile 0.7 -> 0.825 -> 0.7)"
    requirement: LITE-01
    verification:
      - kind: unit
        ref: src/game/data/rooms.test.ts#veil regions (5 cases: zone mirror, tiling + area, seam walls inside strips, gaps inside strips, strip attribution)
        status: pass
      - kind: unit
        ref: src/game/systems/lighting.test.ts#seamStripAlpha (Option A midpoint switch) (5 cases incl. midpoint strict-equality pins)
        status: pass
      - kind: unit
        ref: src/game/systems/lighting.test.ts#torch stays steady (D-16) (re-expressed zone/yard literal slices)
        status: pass
    human_judgment: false
  - id: D3
    description: "D-04 amendment records the seam-strip midpoint-switch decision in the phase context"
    verification:
      - kind: other
        ref: "grep -q 'Amended 2026-11-08 (UAT G-04-4, Option A)' .planning/phases/04-lighting/04-CONTEXT.md"
        status: pass
    human_judgment: false
  - id: D4
    description: "In browser (pnpm dev): each seam reads as one wall at the current room's darkness; crossing either door the shared wall dips with the cross-fade and brightens back, never a lighter line; no doubled band"
    verification: []
    human_judgment: true
    rationale: "Declared verification: backstop truth in the plan — visual adequacy at zoom 4 is a human judgment; the UAT test-4 re-run closes it (dev-server smoke only proves the page serves)"

duration: 9min
started: 2026-11-09T14:52:20Z
completed: 2026-11-09T15:01:29Z
status: complete
---

# Phase 4 Plan 04: Shared Seam Walls + Veil Midpoint Switch Summary

**G-04-4 closed: every room seam is one 16px wall band with one door leaf (Living's), the door gaps were resized to the single band, and the veil now shades the shared band through seamStripAlpha — literal current-room level idle, smaller of the two bordering rooms' fade levels during a glide, switching at the midpoint where both sides are equal.**

## Performance

- **Duration:** 9 min
- **Started:** 2026-11-09T14:52:20Z
- **Completed:** 2026-11-09T15:01:29Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Deleted the Office's two south wall bands + duplicate door-leaf decor and the Bedroom's two east bands + leaf — the Living Room's existing 16px bands (world y 240–256 x 320–640 gap 384–432; x 320–336 y 240–480 gap 320–368) now own both seams single-thickness.
- `DOOR_NORTH.gap` {384,240,48,16}, `DOOR_WEST.gap` {320,320,16,48}: thickness 32→16px, 48px opening (D-02 slack) unchanged; zone/axis/48px glide step untouched, so all rest spots and the whole doorGlide suite pass unchanged.
- New veil region data in rooms.ts: `VEIL_ZONES` (living re-cut to start at x 336 / y 256) and `SEAM_STRIPS` (each strip carries the two rooms it separates); together with `YARD_RECT` they tile the 640x480 box pairwise-non-overlapping — test-proven by area sum, guarding the blend fill against double-darkening.
- `seamStripAlpha` (lighting.ts): no fade → VEIL_ALPHA (rides the current room, idle); fade touching the strip → `Math.min` of the bordering `regionAlpha`s; fade not touching it → VEIL_ALPHA (yard precedent, pinned by a synthetic strip). The crossed strip profiles 0.7 → 0.825 → 0.7 with strict midpoint equality to both rooms — no jump in or out of the fade.
- `Light.ts.refillVeil` fills VEIL_ZONES via regionAlpha, then SEAM_STRIPS via seamStripAlpha, then the yard at the literal VEIL_ALPHA; the D-16 steady-torch source guard was re-expressed to keep rooms fade-derived / yard literal.
- 04-CONTEXT D-04 carries the user-approved 2026-11-08 Option A amendment.

## Task Commits

Each task was committed atomically:

1. **Task 1: One shared wall band + one door leaf per seam (tracer, TDD)** — `ef23938` (fix) — RED: 5 new `shared seams` cases failed at HEAD (doubled bands, duplicate leaves, 32px gaps); GREEN: tuple deletions + gap resize; lighting.test.ts wall counts (6/3/3) and office decor indices (lamp 1, computer 0); doorGlide unchanged. RED and GREEN ship in one commit because the AGENTS.md pre-commit gate runs the suite (same pre-authorized pattern as 04-03).
2. **Task 2: Veil re-cut + Option A midpoint switch (TDD)** — `f950468` (fix) — RED: 11 cases failed (veil regions, seamStripAlpha, re-anchored D-16 guard); GREEN: VEIL_ZONES/SEAM_STRIPS data, seamStripAlpha, refillVeil.
3. **Task 2 docs** — `d50e37c` (docs) — D-04 amendment appended in 04-CONTEXT.md (scoped edit, user-approved).

**Plan metadata:** this commit (docs: complete plan).

## Files Created/Modified
- `src/game/data/rooms.ts` — office/bedroom seam wall + decor tuples deleted; gaps 16px thick; VEIL_ZONES, SeamStrip type, SEAM_STRIPS added beside ROOM_ZONES (unchanged)
- `src/game/data/rooms.test.ts` — new `shared seams` and `veil regions` describes, `insideRect` helper
- `src/game/systems/lighting.ts` — `seamStripAlpha` beside `regionAlpha`; nothing else touched
- `src/game/systems/lighting.test.ts` — wall counts 6/3/3, office decor indices, new `seamStripAlpha (Option A midpoint switch)` describe, D-16 second case re-expressed
- `src/game/objects/Light.ts` — refillVeil loops VEIL_ZONES + SEAM_STRIPS; imports swapped; yard fill and torch untouched
- `.planning/phases/04-lighting/04-CONTEXT.md` — D-04 amendment (scoped single-line edit)

## Decisions Made
- Kept the collapse purely in data (deletion + gap resize) — rejected a seam-straddling band (y 232–248) as off-grid; would rewrite all three layouts.
- Strip attribution lives in the data (`rooms: [RoomId, RoomId]`) rather than a derived lookup — matches the RoomZone.id precedent and keeps seamStripAlpha pure.
- Rule 3 (strip adjacent to neither fade room keeps the literal) implemented even though today's geometry never hits it — the plan's Option A states it, and the synthetic test pins it.

## Deviations from Plan

None - plan executed exactly as written. (One mechanical adaptation: the plan's example commit message exceeded the project commitlint header limit of 72 characters, so the subject was shortened to `switch seam strip veil at fade midpoint in lighting.ts` — content identical, code-only subject per AGENTS.md.)

## Post-Fix Ponytail Audit

Run on `acd2dc1..HEAD` before close-out. Verdict: ship, no code changed. Checked: `ROOM_ZONES` callers (LivingRoomScene roomAt + currentRoom.test — deliberately unchanged, plan truth 4); WORLD_WALLS/shadow consumers rebuild from the layouts automatically, 04-03 registry probe re-passes on the collapsed geometry; office decor index shift re-pinned in the registry test. Rejected findings: merging the two refillVeil fill loops into one tagged-region list — adds a discriminated-union branch to save one `veil.fill` call, less readable; deriving VEIL_ZONES office/bedroom entries from ROOM_ZONES by spread — 3 lines of map/filter to avoid two array literals.

## Issues Encountered
- Task 2's first commit attempt was rejected by commitlint (`header-max-length: 72`; plan example was 85) — reworded and committed; no code impact.

## Authentication Gates
None.

## Threat Surface
No new security-relevant surface (per plan threat model): T-4-07 mitigation holds — only interior duplicate bands removed, the Living bands keep sealing both seams, and the gap-alignment/lane/rest-spot tests plus the unchanged doorGlide suite guard traversal. T-4-08 (two extra rect fills) accepted as written.

## Next Phase Readiness
- G-04-4 closed with machine evidence; the browser backstop (UAT test 4 re-run — one wall per seam, seam dips with the glide cross-fade, no lighter line) is the human-side close.
- LITE-01 shared-ID gate satisfied — all declaring plans in the phase now have summaries; requirement marked complete.
- Phase 4 plans 01–04 all complete: ready for phase verification.

## Self-Check: PASSED

- All key files present: `src/game/data/rooms.ts`, `src/game/data/rooms.test.ts`, `src/game/systems/lighting.ts`, `src/game/systems/lighting.test.ts`, `src/game/objects/Light.ts`, `.planning/phases/04-lighting/04-CONTEXT.md`
- All task commits ancestors of HEAD: `ef23938`, `f950468`, `d50e37c`

---
*Phase: 04-lighting*
*Completed: 2026-11-09*
