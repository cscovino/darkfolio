---
status: diagnosed
trigger: "the bedroom lamp and monitor pool do not stop at wall, the ligh is visible behind walls"
created: 2026-11-08T18:30:00Z
updated: 2026-11-08T18:40:00Z
---

## Current Focus

hypothesis: CONFIRMED — wallShadows' 4-point quad (near corner, far corner, each projected a fixed `far = 2r+64` along its own ray) truncates the shadow with a straight chord. For a wide wall very close to the light (bedroom lamp, 16px under a 320px-wide north wall, ~168° angular span) that chord sits only ~41-46px from the lamp, while the pool reaches 88px, so the yard band y≈184..230 above the bedroom's north wall is not erased.
test: done — sampled every LIGHTS pool against WORLD_WALLS shadow quads
expecting: n/a
next_action: return diagnosis (find_root_cause_only)
bug_class: Bohrbug (deterministic geometry)

## Symptoms

expected: Standing in the Living Room shows a warm pool around the lamp and a cold pool at the TV, both fading in quantized rim steps and cut off by the walls; the Office and Bedroom show theirs the same way.
actual: "the bedroom lamp and monitor pool do not stop at wall, the ligh is visible behind walls" (Bedroom specifically; Living Room and Office not reported)
errors: None reported
reproduction: Phase 04 UAT Test 1 on `pnpm dev`, branch feat/lighting @ 1f0f84c
started: Discovered during UAT 2026-11-08

## Eliminated

- hypothesis: (a) Bedroom walls missing from the occlusion input
  evidence: Light.ts WORLD_WALLS = wallRects of LIVING + OFFICE + BEDROOM layouts; bedroom north wall [160,8,320,16] → world rect x0..320,y240..256 present; wallShadows returns 1 quad for it.
  timestamp: 2026-11-08T18:35:00Z
- hypothesis: (b) Bedroom lamp registered outside the bedroom
  evidence: lights.ts bedroom-lamp (128,272) = BEDROOM_ORIGIN(0,240) + decor lamp (128,32); inside bedroom zone.
  timestamp: 2026-11-08T18:35:00Z
- hypothesis: (c) occlusion only runs for some scenes/lights
  evidence: bakePool runs wallShadows for every LIGHTS entry in LightLayer constructor (single LivingRoomScene hosts all rooms).
  timestamp: 2026-11-08T18:35:00Z
- hypothesis: (d) collision walls differ from shadow-caster walls
  evidence: buildRoom and wallRects both consume layout.walls with the same center-anchor convention.
  timestamp: 2026-11-08T18:35:00Z

## Evidence

- timestamp: 2026-11-08T18:36:00Z
  checked: Probe vitest — for each LIGHTS entry, 2px grid points within radius, outside own room, not inside a wall, tested against wallShadows quads (WORLD_WALLS)
  found: living-lamp 0, living-tv 0, office-lamp 0, office-computer 0, bedroom-lamp 1296 unshadowed points (all in yard, e.g. 52,228 / 54,226)
  implication: Only the bedroom pool leaks — matches the report exactly.
- timestamp: 2026-11-08T18:36:00Z
  checked: Bedroom-lamp quad
  found: [(0,256),(320,256),(559,236),(-238,226)] — far edge is a chord at y≈226-236, pool top is y=184
  implication: Shadow quad covers only a thin strip just behind the wall; everything 46-88px above the lamp in the yard keeps light.
- timestamp: 2026-11-08T18:38:00Z
  checked: Same wall/light, varying radius (which scales `far`): r=88 → (128,200) and (128,230) unshadowed; r=400/2000 → both shadowed
  implication: Fixed projection distance is the cause; the quad shape breaks down when the angular span approaches 180°.
- timestamp: 2026-11-08T18:38:00Z
  checked: Light.ts refillVeil / pool tint
  found: The same baked pool texture drives both the veil ERASE stamp and the ADD colour tint, so both the hole and the warm wash leak.
  implication: Single fix site (wallShadows) covers both. There is no bedroom screen light in LIGHTS; the user's "monitor" is the same pool / nearby grey decor.

## Resolution

root_cause: src/game/systems/lighting.ts wallShadows projects the two silhouette corners a fixed distance (far = 2*radius+64) along their own rays and closes the quad with a straight chord. When the light sits very close to a long wall (bedroom-lamp at (128,272), 16px below the 320px bedroom north wall), the silhouette spans ~168°, so the chord lands only ~41-46px from the light while the pool radius is 88 — the region behind the wall past the chord (yard, y≈184..230) is never erased from the pool texture.
fix: (not applied — diagnose only)
verification: (not applied)
files_changed: []
