---
phase: 01-core-game-loop
plan: 01
subsystem: game
status: complete
tags: [phaser, arcade-physics, camera, astro, tracer]
requires: []
provides:
  - "phaser 4.2.1 dependency"
  - "createGame(parent) Phaser factory (src/game/main.ts)"
  - "LivingRoomScene walkable room with exported room/spawn constants"
  - "Player sprite with 120 px/s SPEED and placeholder texture helper"
  - "velocityFromKeys pure movement helper with vitest spec"
  - "GameCanvas.astro framed mount and rewritten index.astro landing page"
affects: [01-02, 01-03]
tech-stack:
  added: ["phaser 4.2.1 (exact pin)"]
  patterns: ["pure movement helper unit-tested before the Phaser layer", "single staticGroup `solids` for all collision bodies", "client-only Phaser boot via bundled Astro script"]
key-files:
  created:
    - src/game/main.ts
    - src/game/scenes/LivingRoomScene.ts
    - src/game/objects/Player.ts
    - src/game/systems/movement.ts
    - src/game/systems/movement.test.ts
    - src/components/GameCanvas.astro
  modified:
    - src/pages/index.astro
    - package.json
    - pnpm-lock.yaml
key-decisions:
  - "phaser pinned exactly to 4.2.1 (pnpm wrote no caret; matches the stack lock)"
  - "Player handles input via handleInput(), not update(), to avoid the GameObject lifecycle name"
  - "Wall and floor geometry is hand-placed rectangles; no tilemap until Phase 2"
  - "Zoom 4 lives on the scene camera, not the game config, per UI-SPEC canvas framing"
patterns-established:
  - "Movement math is framework-free and tested; Phaser code only maps keys to KeyState"
  - "Scene constants (TILE, ROOM_W/H, WORLD_W/H, SPAWN_X/Y) are the Phase 2 coordinate contract"
requirements-completed: [GAME-01, GAME-02, GAME-03]
duration: ~40min
completed: 2026-10-20
metrics:
  tasks: 2
  commits: 3
  files-changed: 9
actuals:
  tokens: 40000
  tasks: 2
  commits: 3
commits: 3
plan_head_before: 5851ba97287f8a8bc2a0fc622181cf688ea3750e
plan_head_after: c29bb98
---

# Phase 1 Plan 1: Tracer Walkable Room Summary

**Phaser 4.2.1 Living Room slice with WASD/arrow walking at 120 px/s, normalized diagonals, four solid walls, and a 0.05-lerp camera, mounted in a framed Astro page.**

## Performance

- **Duration:** ~40 min
- **Tasks:** 2 (Task 1 was a blocking-human legitimacy gate, approved by the user before this run)
- **Commits:** 3

## Accomplishments

- Installed `phaser@4.2.1` after the user approved the npm legitimacy checks (name, official publisher, version present, download scale).
- Movement spec written RED first (module missing), then `velocityFromKeys` made it GREEN: 5 cases, 12/12 total suite passing.
- `createGame` factory, `LivingRoomScene` (floor, four wall rectangles in one `solids` static group, single collider, world and camera bounds 320×240, zoom 4, `startFollow(player, true, 0.05, 0.05)`), `Player` (SPEED 120), `GameCanvas.astro` and `index.astro`.
- Dev smoke: `GET /darkfolio/` returns 200 with `game-root` and `<title>Darkfolio`; the client script and `main.ts` and `LivingRoomScene.ts` transform with 200 and expected symbols.
- Build, `astro check` (0 errors), format, and tests all green.

## Task Commits

1. **Dependency:** `684884b` 🔧 chore(deps): add phaser 4.2.1 to package.json
2. **Movement spec + helper:** `6657cd7` ✨ feat(game): add velocityFromKeys movement system with spec
3. **Living Room slice + host:** `c29bb98` ✨ feat(game): mount playable Living Room slice via GameCanvas.astro

## Task 1 Checkpoint Outcome

Human approved the legitimacy gate for `phaser@4.2.1` (name exactly `phaser`, official photonstorm publisher, Phaser HTML5 framework description, 4.2.1 in version history, flagship download scale). Install ran as `pnpm add phaser@4.2.1`.

## Exported constants (Phase 2 contract, `src/game/scenes/LivingRoomScene.ts`)

`TILE = 16`, `ROOM_W = 20`, `ROOM_H = 15`, `WORLD_W = 320`, `WORLD_H = 240`, `SPAWN_X = 160`, `SPAWN_Y = 208`.

## Texture helper

`ensurePlayerTexture(scene)` guards with `scene.textures.exists(PLAYER_TEX)` where `PLAYER_TEX = '__PLAYER__'`. It draws a 32×32 `#4A5A4A` rectangle with `make.graphics` (not added to the scene), then calls `generateTexture`, then destroys the graphics.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Phaser namespace not found by astro check**
- **Found during:** Task 2, typecheck
- **Issue:** `Phaser` is not a global namespace; the three game modules failed with TS2503/TS2304.
- **Fix:** `import Phaser from 'phaser';` at the top of `main.ts`, `Player.ts`, `LivingRoomScene.ts`.
- **Commit:** c29bb98

**2. [Rule 3 - Blocking] Arcade sprite body typed as a `Body | StaticBody` union**
- **Found during:** Task 2, typecheck
- **Issue:** `this.body.setVelocity` and `this.body.setCollideWorldBounds` did not type-check on the union.
- **Fix:** Use the sprite's own `setVelocity` and `setCollideWorldBounds`.
- **Commit:** c29bb98

**3. [Rule 3 - Blocking] Biome forbids non-null assertion**
- **Found during:** commit hook on the slice
- **Issue:** `this.input.keyboard!` failed `noNonNullAssertion`; the hook reverted the commit.
- **Fix:** Typed cast to `Phaser.Input.Keyboard.KeyboardPlugin`.
- **Commit:** c29bb98 (the first attempt was reverted by the hook and not committed)

**Total deviations:** 3 auto-fixed (all blocking, all within task scope). No architectural changes.

## Deferred / Remaining Work (planned for other plans, not gaps here)

- The floor is a single flat `#4A3729` rectangle; the checkerboard, furniture, door gaps, and player outline and facing notch belong to 01-03 (planned).
- Boot chain (Boot, Preload, Gate scenes) belongs to 01-02; the scene list seam is in `main.ts`.
- Browser verification of walk feel, wall stops, camera trail, and the zero-console-error check (SC#5) is queued for end-of-phase UAT. I could not run a browser here; verification was dev-server HTTP plus compile checks.

## Verification Evidence

- `.verify/page.html`, `.verify/p1-dev-server.log`, `.verify/script.js` (gitignored, local evidence).
- `pnpm test`: 3 files, 12 tests passing. `pnpm exec astro check`: 0 errors. `pnpm build`: `dist/index.html` produced.

## Self-Check: PASSED

- All created files present; commits `684884b`, `6657cd7`, `c29bb98` present in `git log`.
