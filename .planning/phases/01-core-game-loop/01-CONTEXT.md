# Phase 1: Core Game Loop - Context

**Gathered:** 2026-10-19
**Status:** Ready for planning

<domain>
## Phase Boundary

A visitor lands on `/`, sees the game as a framed centered canvas, passes a "press any key" gate, and walks the Living Room: 32×32 placeholder player at 120 px/s (WASD/arrows), blocked by wall and furniture collision, with a floaty lerping follow camera that visibly pans a half-room viewport. Phaser game boots with no console errors. (GAME-01, GAME-02, GAME-03; SC#1–5 in ROADMAP §Phase 1.)

**Not in scope:** working doors/transitions (Phase 2), interaction/E-key/overlays (Phase 3), lighting (Phase 4), audio (Phase 5), real sprites (Phase 7), mobile blocking (Phase 8).

</domain>

<decisions>
## Implementation Decisions

### Living Room layout
- **D-01:** Furniture set = TV + couch + floor lamp + coffee table as collision-only obstacles. Rug (if any) stays walkable. This mirrors the Phase 3 living-room object list so Phase 3 converts these same rects into interactables.
- **D-02:** Door gaps reserved on the **left wall** (→ Office) and **right wall** (→ Bedroom), 1–2 tiles wide. Phase 1 only cuts the gaps and styles them — no traversal. — **Reversibility:** costly — Phase 2's multi-room world geometry must line up with these reserved gaps; moving them later re-cuts walls and re-places spawn/entry tiles.
- **D-03:** Player spawns bottom-center facing up — reads as "just walked into the room."
- **D-04:** Room is a plain rectangle: 20×15 tiles of 16 px, four solid 1-tile-thick walls, no interior partitions.

### Camera
- **D-05:** Half-room viewport: the visible area is ≈160×120 world px (integer pixel-art zoom), so the camera pans on **both** axes while walking — SC#4 (lerp follow) must be observably real in Phase 1, not a static whole-room frame.
- **D-06:** Floaty trail: lerp factor ≈0.05 per frame (tune within 0.04–0.06). Camera settles over roughly a second — dreamy pace fits the dark-house mood; "smooth lerp, not snap" from GAME-03.
- **D-07:** Player rides dead-center in the viewport — no facing-lead offset, no deadzone games.

### Placeholder art
- **D-08:** Player = 32×32 solid square with a lighter facing notch (small eye/face rect) that flips/points toward last movement direction. Static (no walk animation) — Phase 7 replaces wholesale.
- **D-09:** Walls and furniture are flat rectangles in the Darkwood palette from PROJECT.md (browns `#4A3729`/`#6B4E3D`/`#8B6F5E`, grays `#2A2A2A`/`#3D3D3D`/`#555555`, greens `#3A4A3A`/`#4A5A4A`); TV gets a cold-blue accent rect, lamp a warm-yellow `#FFA500` hint. Mood-setting from day one at zero asset cost.
- **D-10:** Floor = checkerboard of two alternating brown tones — motion is legible against the panning camera.
- **D-11:** Reserved door gaps get a distinct lighter threshold/frame rect so exits are readable before Phase 2 wires them.

### Landing page framing
- **D-12:** Canvas is a **centered fixed-size box** on a dark page background — framed-CRT look, deliberate retro window, no scroll-first portfolio content around it (LAND-01).
- **D-13:** Constant framing on resize: zoom scales to fit, visible world area stays ≈half the room (FIT/integer-zoom behavior), rather than RESIZE revealing more world. One identical composition on every screen.
- **D-14:** Boot → minimal "press any key" gate scene → immediately playable Living Room. Keeps Phaser from grabbing keys before intent; the formal TitleScene stays in Phase 8 and will replace this gate.

### The agent's Discretion
- Exact base resolution + zoom combo that yields the ~160×120-world-px viewport in a fixed centered box (640×480 logical canvas @ 4× zoom is the obvious candidate — planner/executor picks).
- Specific tile coordinates for furniture, wall thickness tuning, camera-bounds clamping method (world bounds vs. padded bounds so the camera never exposes black outside the walls), deadzone implementation, and how the placeholder rects are generated (Graphics/textures) — standard Phaser 4 practice.
- Scene file names follow PLAN.md §Phase 1 agent instructions (`main.ts`, `BootScene`, `PreloadScene`, `LivingRoomScene`, `Player.ts`, `GameCanvas.astro`).
- "You decide"-grade: key-event cleanup on the press-any-key gate; whether the gate lives in BootScene or its own micro-scene.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project canon
- `.planning/ROADMAP.md` §"Phase 1: Core Game Loop" — goal + 5 success criteria (canvas mount, 120 px/s, collision, lerp camera, no console errors)
- `.planning/PLAN.md` §"Phase 1: Core Game Loop" — prescribed file list (src/game/main.ts, scenes, Player.ts, GameCanvas.astro, index.astro update) and manual-test checklist; §"Path Aliases" — `@/game/*` `@/scenes/*` `@/objects/*` etc.
- `.planning/PROJECT.md` §Context + §Constraints — Darkwood palette hexes, 16×16 tiles / 32×32 character, Phaser 4.2.1 + Arcade Physics, 60 fps, tech-stack lock
- `.planning/REQUIREMENTS.md` — GAME-01/02/03 (this phase), LAND-01 (canvas on landing), Out of Scope table
- `AGENTS.md` — pre-commit gate (format/test/astro check/build), commit format, ponytail rules, path aliases

### Prior phase context
- `.planning/phases/00.1-agent-team-skills/00.1-CONTEXT.md` — agent roster + model map for dispatch during execution; D-02 never-use model IDs still binds

### Existing code
- `src/pages/index.astro` — Astro stub to be replaced with the GameCanvas mount
- `vitest.config.ts` / `src/test/` — happy-dom env; TDD-lite home for pure movement/camera math

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Phase 0 toolchain is live: Biome, commitlint/husky gates, Vitest (happy-dom), path aliases in tsconfig — new game code plugs straight in.
- `.opencode/skills/` Phaser 4 skills (cameras, physics-arcade, input-keyboard-mouse-touch, game-setup-and-config, sprites-and-images, scenes) are vendored — phaser-specialist/gameplay-dev should cite them.
- No `src/game/` exists yet — greenfield; nothing to reuse or conflict with.

### Established Patterns
- TDD-lite for pure logic: movement math, speed normalization, and camera lerp can be unit-tested as framework-free functions; scene wiring verified in `pnpm dev` browser.
- Astro pages host the Phaser canvas via a `.astro` component mount point (GameCanvas.astro), client-side script importing `@/game/main`.
- Ponytail: placeholder rects generated in code (Graphics or runtime textures) — no PNG asset pipeline needed this phase.

### Integration Points
- `src/pages/index.astro` (and layout) gets the centered-box canvas mount with page background styling in `src/styles/` or scoped styles.
- Phaser config (`main.ts`) must respect `base: '/darkfolio/'`-era deploy constraints (no CDN assets).
- Door gap positions (D-02) and spawn (D-03) become the contract Phase 2's multi-room geometry must honor.

</code_context>

<specifics>
## Specific Ideas

- The centered fixed canvas box is a deliberate "framed CRT screen on a dark wall" image — it previews the Phase 3 CRT-overlay aesthetic.
- "Walked in from the bottom" spawn + floaty camera together aim for the pacing of a slow RPG overworld intro, not a snappy arcade feel.
- Facing notch exists so the player *feels* directional even with zero animation frames — the cheapest possible readability win before Phase 7 sprites land.
- Furniture rects are the same four pieces Phase 3 turns into interactables (TV, couch→lamp? — at minimum TV/lamp are Phase 3 flavor objects) — place them where Phase 3 dialog/interaction will want them (TV facing the couch).

</specifics>

<deferred>
## Deferred Ideas

- Dense furniture (bookshelf, potted plants as collision props) — user chose the lean set; promote if Phase 2's rooms feel empty.
- Walk-bob/squash animation on the placeholder — explicitly skipped for Phase 1; revisit with Phase 7 real sprites.
- Formal title screen with game logo — stays in Phase 8; D-14's press-any-key gate is its placeholder.
- Full-viewport bleed framing — rejected in favor of the framed-box look; changing later is a layout-only edit.

</deferred>

---

*Phase: 1-core-game-loop*
*Context gathered: 2026-10-19*
