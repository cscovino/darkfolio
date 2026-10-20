---
phase: 01-core-game-loop
plan: 03
subsystem: game
status: complete
tags: [phaser, arcade-physics, tilemap-free, room-art, player-art, facing]
requires:
  - "01-01: LivingRoomScene tracer, solids group, single collider, camera contract"
provides:
  - "UI-SPEC §Color element map in the Living Room (checkerboard floor, segmented walls, D-02 gaps, four furniture bodies)"
  - "Player placeholder with 2px outline, #FFA500 facing notch, and facing state (init 'up')"
affects: [phase-02-room-transitions, phase-03-interactables, phase-07-sprites]
key-files:
  created: []
  modified:
    - src/game/scenes/LivingRoomScene.ts
    - src/game/objects/Player.ts
key-decisions:
  - "Facing notch implemented as route (a): four baked directional textures, swapped via setTexture on facing change"
  - "Diagonal facing resolves vertical-first (up/down wins over left/right)"
  - "Floor is one Graphics object with per-tile fillRect (no 300 tile game objects)"
  - "Door thresholds and furniture accents are plain rectangles with no physics body"
requirements-completed: [GAME-02]
duration: ~20min
completed: 2026-10-20
metrics:
  tasks: 2
  commits: 2
  files-changed: 2
actuals:
  tokens: 22000
  tasks: 2
  commits: 2
commits: 2
plan_head_before: 0a4ef3218b8b8d83690c3c28b73a5fbd379476a4
plan_head_after: ac4e82b71f5aa736606314f8ac5c2d393869cc03
---

# Phase 1 Plan 3: Room World and Player Art Summary

**Living Room now renders the full UI-SPEC element map (checkerboard floor, D-02 door gaps, four furniture collision bodies) and the player shows an outlined body with a directional orange notch, with the 01-01 camera, spawn, and collider contracts untouched.**

## Performance

- **Tasks:** 2 (both auto)
- **Commits:** 2 (`6444033`, `ac4e82b`)

## Accomplishments

- Checkerboard floor alternating `#4A3729` / `#6B4E3D` across the 20×15 grid in one Graphics object.
- Walls: north/south full-width; west and east split into two segments each, leaving rows 6–7 open.
- D-02 door gaps styled with `#8B6F5E` thresholds (visual only, no body, no trigger).
- D-01 furniture: TV, coffee table, couch, and lamp as static bodies in the existing `solids` group, with the TV screen and lamp glow accents.
- Player: 32×32 `#4A5A4A` body, 2px `#2A2A2A` outline, 8×8 `#FFA500` notch; `facing` initialized `'up'` and updated from velocity in `handleInput`. Physics body remains 32×32.
- Gate green on both commits: format, `pnpm test` (12/12), `astro check` (0 errors/warnings), `pnpm build`.

## As-built Phase 2 contract: door gaps

| Gap | Wall | Open rows | y range | Threshold rect (top-left, 16×32) | Body |
|-----|------|-----------|---------|----------------------------------|------|
| West → Office | x 0–16 | 6–7 | 96–128 | (0, 96) | none |
| East → Bedroom | x 304–320 | 6–7 | 96–128 | (304, 96) | none |

Wall segments as built (top-left rects, 16 px thick): west (0,16,16,80) and (0,128,16,96); east (304,16,16,80) and (304,128,16,96). Exits are prevented only by `setCollideWorldBounds`.

## As-built Phase 3 contract: furniture

| Piece | Top-left | Size | Color | Body | Notes |
|-------|----------|------|-------|------|-------|
| TV casing | (144,16) | 16×16 | `#3D3D3D` | static in `solids` | screen accent 12×8 `#6B8FBF` at (146,20) |
| Coffee table | (144,48) | 32×16 | `#555555` | static in `solids` | — |
| Couch | (128,80) | 48×16 | `#8B6F5E` | static in `solids` | faces north toward the TV |
| Floor lamp | (192,80) | 16×16 | `#555555` | static in `solids` | glow 8×8 `#FFA500` at (196,80) (visual only) |

Spawn footprint (144–176, 192–224) is clear of all furniture.

## Notch implementation

Route (a): `ensurePlayerTexture` bakes four textures, keys `__PLAYER___UP`, `__PLAYER___DOWN`, `__PLAYER___LEFT`, `__PLAYER___RIGHT` (prefix `PLAYER_TEX = '__PLAYER__'`). Notch inset 4 px: up (12,4), down (12,20), left (4,12), right (20,12). Facing changes call `setTexture`; the body size is unchanged because all four frames are 32×32.

## Task Commits

1. **Furnish Living Room and cut door gaps:** `6444033` ✨ feat(game): furnish Living Room and cut door gaps
2. **Facing notch and outline on Player:** `ac4e82b` ✨ feat(game): add facing notch and outline to Player.ts

## Deviations from Plan

None. The only addition is the `ensurePlayerTexture` signature and `PLAYER_TEX` export kept as-is; the texture key is now per-direction, which was the planned route (a). No other code imported the old key.

## Human-verification items (deferred to end-of-phase UAT)

The plan's `<human-check>` items (visual checkerboard, furniture blocking, gap readability, notch behavior, console clean) were not run in this executor session; they are harvested into the phase UAT batch.

## Self-Check: PASSED

- Files present: `src/game/scenes/LivingRoomScene.ts`, `src/game/objects/Player.ts`, `.planning/phases/01-core-game-loop/01-03-SUMMARY.md`.
- Commits present in `git log`: `6444033`, `ac4e82b`.
