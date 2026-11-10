---
status: diagnosed
trigger: "torch-and-pool-radius-too-large — the player has too big circle ligth so the room is always visible, actually all the lights it feels to bigs"
created: 2026-11-08
updated: 2026-11-08
---

## Current Focus

hypothesis: CONFIRMED — code matches spec exactly; the locked radii (SC#2/LITE-01 torch 4-tile radius, D-10 lamps 5–6 / screens 2–3 tiles) were chosen in world tiles without accounting for the zoom-4 camera viewport (640x480 / 4 = 160x120 world px = 10 x 7.5 tiles). A 64px-radius torch spans 80% of view width and 107% of view height.
bug_class: Bohrbug (deterministic, data/decision)
next_action: return diagnosis (find_root_cause_only)

## Symptoms

expected: Light hole warm #FFA500 with facing lobe reaching further in walk direction; pools read as local accents (LAMP_RADIUS 88, screen 2-3 tiles); room beyond dominated by 70% veil.
actual: "the player has too big circle ligth so the room is always visible, actually all the lights it feels to bigs" — screenshot 04-UAT-evidence-test3.png: torch wash covers most of the visible room.
errors: none
reproduction: Phase 04 UAT test 3, `pnpm dev`, feat/lighting @ 1f0f84c
started: discovered UAT 2026-11-08

## Eliminated

- hypothesis: (e) wrong unit (px vs tile) in torch/pool radii
  evidence: TILE=16 (rooms.ts:8); TORCH_RADIUS = 4*TILE = 64; LAMP_RADIUS 88 = 5.5 tiles; SCREEN_RADIUS 40 = 2.5 tiles — all exactly per 04-01-PLAN line 83 and D-10.
  timestamp: 2026-11-08
- hypothesis: (a) torch hole landed larger than 64px / zoom double-scales it
  evidence: Screenshot measured at ~7.9 display px per world px (checker tile ≈126 display px = 16 world px). Full-removal core edge ≈252 display px = 32 px (POOL_RINGS frac 0.5 of 64); outer edge ≈ 470 display px ≈ 60–64 px; facing-side reach ≈605 display px ≈ 77 px = lobe 32 + 0.7*64. Rendered hole == spec; no extra scaling.
  timestamp: 2026-11-08
- hypothesis: (b)/(c) rim quantization or additive tint stack enlarges holes past radius
  evidence: ensurePoolTexture draws rings strictly inside `radius` (frac ≤ 1); generateTexture is 2r x 2r so nothing can extend past r. Tint images use the same pool/torch textures, so ADD tint is bounded by the same radius. Rings lower the veil only inside r.
  timestamp: 2026-11-08

## Evidence

- timestamp: 2026-11-08
  checked: src/game/main.ts (640x480), LivingRoomScene.ts:90 cam.setZoom(4)
  found: world camera shows 160x120 world px = 10 x 7.5 tiles.
  implication: any radius ≥ 4 tiles dominates the viewport.
- timestamp: 2026-11-08
  checked: src/game/data/lights.ts, src/game/objects/Light.ts, src/game/systems/lighting.ts
  found: TORCH_RADIUS 64, lobe offset 32 / scale 0.7 / alpha 0.5 (reach 77), LAMP_RADIUS 88, SCREEN_RADIUS 40; POOL_RINGS 0.25/0.34/1 at frac 1/0.78/0.5; veil 0.7.
  implication: implementation is spec-literal.
- timestamp: 2026-11-08
  checked: coverage arithmetic vs 160x120 view (19200 px²)
  found: torch disc π·64² ≈ 12868 px² = 67% of the view (diameter 128 vs 120 tall → clips top+bottom), plus lobe; lamp disc π·88² ≈ 24328 px² = 127% of the view (diameter 176 > 160 wide); screen π·40² ≈ 5027 = 26%.
  implication: "darkness dominates" is geometrically impossible at these radii while standing anywhere; a lamp pool alone can cover the entire screen.
- timestamp: 2026-11-08
  checked: falloff — outer ring (frac 0.78–1) removes 25% of veil → residual 0.525 vs 0.7 base
  found: the outermost 14px band is still visibly lighter than the veil, so the perceived edge is the full 64px, not the 32px full-bright core.
  implication: perceived size = full radius; D-06 "a couple of pixel steps" was implemented as a 32px-wide (half-radius) gradient — minor contributor to "wash" feel, not to extent.
- timestamp: 2026-11-08
  checked: lighting.test.ts:112-133, 237
  found: tests pin CODE==SPEC numbers (TORCH_RADIUS toBe 64 / 4*TILE, lobe 32/0.7/0.5); no test relates radius to viewport size.
  implication: no gate could catch it; tests will need updating with the new radii.
- timestamp: 2026-11-08
  checked: ROADMAP.md:220 SC#2, REQUIREMENTS.md LITE-01, PLAN.md:175 "4 tiles (64px)", 04-CONTEXT D-10
  found: "4-tile radius" is explicit in SC#2/LITE-01; D-10 sets lamp 5–6 / screen 2–3 tiles. PLAN.md's original lamps 3 / screens 2 were overridden upward by D-10/D-20.
  implication: shrinking requires changing locked decisions (SC#2/LITE-01/D-10), not a code fix.

## Resolution

root_cause: Data/decision defect, not code defect — the locked radii (torch 4-tile radius per SC#2/LITE-01, lamps 5–6 / screens 2–3 tiles per D-10) are expressed in world tiles but the world camera at zoom 4 only shows 10 x 7.5 tiles (160x120 px). Code renders them exactly (torch 64px + lobe reach 77px ≈ 67%+ of the view; lamp 88px ≈ 127% of the view), so lit area dominates and the 70% veil is barely visible. Secondary: the 2-step falloff spans half the radius (rings at 0.5/0.78/1), so the dim outer band reads as lit out to the full radius.
fix: (not applied — find_root_cause_only)
verification:
files_changed: []
