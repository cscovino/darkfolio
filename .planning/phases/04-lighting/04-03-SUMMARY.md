---
phase: 04-lighting
plan: 03
subsystem: game
tags: [phaser4, lighting, occlusion, shadow-polygons, vitest, radii-retune]

requires:
  - phase: 03-interaction
    provides: host scene and UI-camera contract lighting must not touch
  - phase: 04-lighting (plans 01-02)
    provides: wallShadows/pointInPolygon geometry helpers, Light.ts SHADOW_QUAD scratch buffer, lights.ts registry constants this plan amends

provides:
  - angle-safe wallShadows — 5-point shadow polygons (bisector apex) so every registry pool stops at wall geometry (G-04-1)
  - retuned radii — TORCH 40 / LAMP 48 / SCREEN 24 with proportional lobe offset 20, sized to the zoom-4 160x120 view (G-04-3)
  - bedroom-lamp regression + registry coverage probe in lighting.test.ts (0 uncovered behind-wall points, all five pools)
  - amended D-10/D-20 + ROADMAP SC#2 + LITE-01 wording recorded across the current planning docs

affects: [04-lighting (plan 04 seam collapse), 05-audio, 08-polish]

actuals:
  tokens: 3900
  tasks: 3
  commits: 3
  plan_head_before: d7b748d4c8dafff1a6298e914f03fbf694b4d1d4
  plan_head_after: 268f655506e9558b5e165593d44919815d1e7cc7

tech-stack:
  added: []
  patterns:
    - "shadow polygon = angular-sector silhouette with a bisector apex at dmax + far: the sector (near/farCorner rays) is untouched by the fix, so doorway-gap pass-through cases survive by construction"
    - "registry coverage probe: 2px grid over each pool's bounding square, zone/wall-interior points excluded, every remaining point must lie in some wallShadows polygon — proves occlusion across the whole registry, not just the reported bug"

key-files:
  created: []
  modified:
    - src/game/systems/lighting.ts
    - src/game/systems/lighting.test.ts
    - src/game/objects/Light.ts
    - src/game/data/lights.ts
    - .planning/phases/04-lighting/04-CONTEXT.md
    - .planning/ROADMAP.md
    - .planning/REQUIREMENTS.md
    - .planning/PROJECT.md

key-decisions:
  - "wallShadows grows its polygons to 5 points (bisector apex M at distance dmax + far along ref + (min+max)/2) instead of widening `far`: each half-chord spans < 90 deg and sits >= cos(45 deg) * far > radius, so no in-range pool point behind a wall escapes"
  - "TORCH_RADIUS 40 (2.5 tiles) chosen from the approved 2-2.5-tile band; lobe re-derived proportionally (offset 20 = 0.5r, scale 0.7 / alpha 0.5 already radius-relative) keeping facing reach at 1.2r"
  - "POOL_RINGS and TORCH_DT_SIZE deliberately unchanged — narrowing the rim would enlarge the bright core, the opposite of the G-04-3 complaint; 48px reach fits the existing 192 buffer"
  - "historical 4-tile claims stay verbatim in exempted records (ROADMAP 04-01 plan-list entry, PLAN.md, phase-history artifacts); only current docs carry the amendment"

patterns-established:
  - "geometry fixes ship with a registry-wide coverage probe, not just the single failing case"

requirements-completed: [LITE-01, LITE-02]

coverage:
  - id: D1
    description: "Every registry pool stops at wall geometry — bedroom lamp no longer lights the yard behind its north wall (G-04-1)"
    requirement: LITE-02
    verification:
      - kind: unit
        ref: src/game/systems/lighting.test.ts#wallShadows wide-angle coverage > shadows the yard behind the 320px bedroom north wall (G-04-1)
        status: pass
      - kind: unit
        ref: src/game/systems/lighting.test.ts#wallShadows wide-angle coverage > covers every outside-zone pool point of every registry light
        status: pass
      - kind: unit
        ref: src/game/systems/lighting.test.ts#wallShadows (doorway-gap + west near-face cases stay green)
        status: pass
    human_judgment: false
  - id: D2
    description: "Radii 40/48/24 + proportional lobe pinned by tests; SHADOW_QUAD holds the 5th vertex (G-04-3)"
    requirement: LITE-01
    verification:
      - kind: unit
        ref: src/game/systems/lighting.test.ts#pool radii > pins the view-sized lamp and screen pools
        status: pass
      - kind: unit
        ref: src/game/systems/lighting.test.ts#torch constants > pins the 2.5-tile warm torch
        status: pass
      - kind: other
        ref: "grep -q 'length: 5' src/game/objects/Light.ts"
        status: pass
    human_judgment: false
  - id: D3
    description: "D-10/D-20 amendment + ROADMAP SC#2 + LITE-01 carry the new radii; no stale 4-tile claim in current docs"
    verification:
      - kind: other
        ref: "task-3 grep gate (2.5-tile radius warm-yellow in ROADMAP/REQUIREMENTS/PROJECT; Amended 2026-11-08 in 04-CONTEXT; zero non-exempt 4-tile hits)"
        status: pass
    human_judgment: false
  - id: D4
    description: "In-browser feel: lamp pool stops at the bedroom north wall; torch reads as a tight warm circle with short lobe; darkness dominates the visible room"
    verification: []
    human_judgment: true
    rationale: "Declared verification: backstop truth — visual adequacy at zoom 4 is a human judgment; the UAT re-run (tests 1 and 3) closes it"

duration: 9min
started: 2026-11-09T14:32:13Z
completed: 2026-11-09T14:41:40Z
status: complete
---

# Phase 4 Plan 03: Lighting Gap Closure Summary

**Angle-safe wall shadows (5-point bisector-apex polygons) plus radii retuned to the zoom-4 view — G-04-1 light-behind-walls and G-04-3 oversized pools closed with a registry-wide coverage probe.**

## Performance

- **Duration:** 9 min
- **Started:** 2026-11-09T14:32:13Z
- **Completed:** 2026-11-09T14:41:40Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments
- `wallShadows` now emits a 5-point polygon per in-range wall — near corner, far corner, both projected `far = 2r + 64`, plus a bisector apex at `dmax + far` past the wall's back face. The bedroom lamp's 1296 leaked yard points are 0; so are all other pools' (probe: every 2px grid point inside a radius, outside its own zone and any wall, is inside some shadow polygon — for all five registry lights at both old and new radii).
- `Light.ts` scratch buffer `SHADOW_QUAD` sized 4 → 5 so the 5th vertex reaches `fillPoints` (threat T-4-06 mitigation).
- Radii: `TORCH_RADIUS` 2.5 tiles (40), `LAMP_RADIUS` 3 tiles (48), `SCREEN_RADIUS` 1.5 tiles (24), `TORCH_LOBE_OFFSET` 20 (= 0.5r, facing reach stays 1.2r). Source-core coverage invariant holds: 0.5 × 24 = 12 ≥ 8.06.
- Doorway sightlines preserved by construction: the fix extends the far edge only inside each wall's existing angular sector, so the torch still passes through both door gaps (the two prior gap tests and the west near-face test stayed green untouched).
- Amendment recorded: 04-CONTEXT D-10/D-20 + domain paragraph + discretion + canonical-refs, ROADMAP Phase 4 SC#2, REQUIREMENTS LITE-01, PROJECT LITE-01 mirror — all user-approved 2026-11-08; historical 4-tile records left verbatim.

## Task Commits

Each task was committed atomically:

1. **Task 1: Angle-safe wall shadows end-to-end (tracer, TDD)** — `9b03b36` (fix) — RED (3 cases failed at HEAD: 2 regressions + probe) and GREEN in one commit, per the plan's gate clause; RED/GREEN committed together because the pre-commit gate runs the suite.
2. **Task 2: Retune torch/lamp/screen radii (TDD)** — `c86e39a` (fix) — pinned-constant tests RED first, constants GREEN, coverage probe re-passed at the new radii.
3. **Task 3: Record the D-10/D-20 amendment in the current docs** — `268f655` (docs) — 8 scoped line edits across the four approved planning docs; task-3 grep gate passed.

**Plan metadata:** this commit (docs: complete plan).

## Files Created/Modified
- `src/game/systems/lighting.ts` — wallShadows: tracks `dmax` in the corner scan, pushes the bisector apex between the two projected corners; signature/return unchanged
- `src/game/systems/lighting.test.ts` — new `wallShadows wide-angle coverage` describe (bedroom regression at r88/r48 + registry coverage probe over WORLD_WALLS rebuilt from wallRects); `pool radii` describe; torch/lobe pins retuned to 40/20 with the offset = r/2 invariant
- `src/game/objects/Light.ts` — SHADOW_QUAD buffer length 5; comment reworded quad → polygon
- `src/game/data/lights.ts` — LAMP 3×TILE, SCREEN 1.5×TILE, TORCH 2.5×TILE, LOBE_OFFSET 20
- `.planning/phases/04-lighting/04-CONTEXT.md` — D-10 hierarchy + amendment note, D-20 override-list correction, domain/discretion/canonical-refs wording
- `.planning/ROADMAP.md` — Phase 4 SC#2 "2.5-tile radius warm-yellow"
- `.planning/REQUIREMENTS.md` / `.planning/PROJECT.md` — LITE-01 mirror text

## Decisions Made
- Kept the shadow-sector geometry identical and only domed the far edge outward (apex at `dmax + far`), so wide-angle walls close without ever shadowing an angle no wall covers — the doorway-gap guarantees survive a superset change.
- Chose TORCH 40px at the top of the approved 2–2.5-tile band (half the 160px view width, readable lobe), and re-derived the lobe offset proportionally instead of keeping the absolute 32px.
- Left POOL_RINGS falloff widths as-is (discretion recorded in the plan): the rim bands scale down with the radii already.

## Deviations from Plan

None - plan executed exactly as written. (Task 1's RED/GREEN single-commit choice was pre-authorized by the task text: "otherwise keep RED/GREEN in one commit" — the AGENTS.md pre-commit gate runs the suite, so a RED-only commit could not pass it.)

## Post-Fix Ponytail Audit

Run on `d7b748d..HEAD` before close-out. Verdict: ship, no code changed. Checked: caller set of wallShadows (only Light.ts bake/torch + tests — buffer and `fillPoints` length contract re-verified), per-frame allocation delta (+1 vertex per in-range wall; T-4-05 already accepts, smaller radii put fewer walls in range), one rejected lean finding (the probe's `if (!zone) throw` guard could shrink to a non-null assertion, but `!` appears nowhere in `src/` and biome's recommended rules would likely flag it — keeping the two-line guard is the smaller safe diff).

## Issues Encountered
- None. Note for the record: at HEAD the probe found leaked points for the office lamp too (y < 0 yard strip), not only the bedroom lamp — the fix covers both; the original debug session had reported only the bedroom because its probe used the then-shipping radii.

## Authentication Gates
None.

## Threat Surface
No new security-relevant surface: shadow polygons are derived from static tracked layout data (per plan threat model T-4-05/T-4-06 dispositions applied as written — 5-slot buffer mitigates the dropped-vertex leak, guarded by the coverage probe test).

## Next Phase Readiness
- G-04-1 and G-04-3 closed with machine evidence; the browser backstop (UAT tests 1 and 3 re-run) is the human-side close.
- 04-04 (shared-wall seam collapse) inherits the 5-point shadow contract unchanged — its collapsed-seam layout was pre-verified against this polygon shape.
- LITE-01 stays `Pending` per the shared-ID gate (sibling plan 04-04 declares it without a SUMMARY yet); LITE-02 marked complete.

## Self-Check: PASSED

- All key files present: `src/game/systems/lighting.ts`, `src/game/systems/lighting.test.ts`, `src/game/objects/Light.ts`, `src/game/data/lights.ts`, `.planning/phases/04-lighting/04-CONTEXT.md`
- All task commits ancestors of HEAD: `9b03b36`, `c86e39a`, `268f655`

---
*Phase: 04-lighting*
*Completed: 2026-11-09*
