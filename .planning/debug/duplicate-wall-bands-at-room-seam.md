---
status: diagnosed
trigger: "duplicate-wall-bands-at-room-seam — the walls are duplicated, it should be one wall for both rooms it feels weird with the light"
created: 2026-11-08
updated: 2026-11-08
---

## Current Focus

hypothesis: CONFIRMED — each room's RoomLayout draws its own 16px wall band on its side of the seam (32px doubled wall); the per-room veil (ROOM_ZONES split exactly at the seam) shades each band with its own room's alpha, making the two bands read as two walls.
next_action: return diagnosis (find_root_cause_only)
bug_class: Bohrbug (deterministic geometry)

## Symptoms

expected: Door glide shows the room behind darkening as the room ahead brightens at the wall line — one continuous shared wall, no swap, no snap.
actual: "the walls are duplicated, it should be one wall for both rooms it feels weird with the light"
errors: none
reproduction: UAT 04 Test 4, `pnpm dev`, door glide, feat/lighting @ 1f0f84c
started: discovered 2026-11-08 (geometry dates to Phase 2 cf56402)

## Eliminated

- hypothesis: veil/pool layer draws an extra (second) wall band
  evidence: Light.refillVeil only fills ROOM_ZONES rects + YARD_RECT and erases pool/torch stamps; it draws no wall geometry. WORLD_WALLS is used only for torch shadow quads (erase masks), not drawn.
  timestamp: 2026-11-08

## Evidence

- timestamp: 2026-11-08
  checked: src/game/data/rooms.ts walls (center-anchored) + origins
  found: North seam (y=240): OFFICE wall [32,232,..16]/[216,232,..16] → world y 224–240; LIVING wall [32,8,..16]/[216,8,..16] → world y 240–256. Both gaps at world x 384–432. Door-leaf decor also duplicated: OFFICE [88,232,48,16] (y 224–240) and LIVING [88,8,48,16] (y 240–256). West seam (x=320): BEDROOM [312,48|176,16,..] → world x 304–320; LIVING [8,48|176,16,..] → world x 320–336; door-leaf decor duplicated (BEDROOM [312,104,16,48] → x 304–320, LIVING [8,104,16,48] → x 320–336, both y 320–368).
  implication: Every shared seam is two adjacent 16px bands = 32px wall, one per room. DOOR_NORTH.gap {y:224,h:32} and DOOR_WEST.gap {x:304,w:32} were sized to span both bands — the doubling is baked into the door data too.

- timestamp: 2026-11-08
  checked: .planning/phases/02-multi-room CONTEXT D-09
  found: "Office directly above Living Room (sharing their horizontal wall), Bedroom directly left (sharing their vertical wall)."
  implication: Phase 2 intent was ONE shared wall; implementation (buildRoom per-room full perimeter) diverged. Phase 2 owns the defect.

- timestamp: 2026-11-08
  checked: src/game/objects/Light.ts refillVeil + systems/lighting.ts regionAlpha; ROOM_ZONES
  found: Veil fills each ROOM_ZONE with its own alpha (0.7 current / 0.95 other); zones split exactly at y=240 and x=320 = the band boundary. During fade, alphas lerp independently per zone.
  implication: Veil does not add a band, but it exposes the existing doubling: office band and living band get different darkness (always — idle 0.7 vs 0.95 — and mid-glide as they cross-fade), so the 32px wall reads as two distinct walls. Pre-Phase-4 the north bands were the same colour (0x2a2a2a both) so it read as one thick wall; west bands already differed (0x2a2a2a vs bedroom 0x241c14).

- timestamp: 2026-11-08
  checked: doorGlide.ts glideEnd + LivingRoomScene.startGlide + camera zoom 4
  found: Glide runs from inside door.zone (48px straddling axis) to axis ± 48; axis is the seam. Camera at zoom 4 follows the player, so both 16px bands (32px total) are on screen for the whole 700ms glide and also while idle near any door.
  implication: Both bands are simultaneously visible throughout; fade start (crossedAxis) fires at the seam, i.e. between the two bands.

## Resolution

root_cause: Room layout data (Phase 2) gives each room a full 16px perimeter wall, so at each shared seam (north y=240, west x=320) two bands sit side by side (office 224–240 + living 240–256; bedroom 304–320 + living 320–336), plus duplicated door-leaf decor and 32px door gaps — contrary to D-09 "sharing their wall". Phase 4's per-zone veil (ROOM_ZONES split exactly at the seam) shades each band with its own room alpha, which makes the pre-existing doubling visible; it does not create it.
fix: (not applied — diagnose only)
verification:
files_changed: []
