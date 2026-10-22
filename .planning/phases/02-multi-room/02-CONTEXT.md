# Phase 2: Multi-Room - Context

**Gathered:** 2026-10-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Three connected rooms — Living Room, Office, Bedroom (each 20×15 tiles) — arranged as an L-shaped **continuous world**. Walking through a doorway triggers a short camera auto-glide that carries the player into the neighbor room; entry rests 2 tiles past the door on the door axis. Collision, camera follow, and per-room identity work everywhere. (GAME-04, ROOM-01, ROOM-02; SC#1–6 in ROADMAP §Phase 2.)

**Not in scope:** E-key interaction/dialog/overlays (Phase 3), lighting FX (Phase 4), audio (Phase 5), real sprites and tilemaps (Phase 7), title screen / loading progress / mobile blocking (Phase 8).

</domain>

<decisions>
## Implementation Decisions

### Door topology & geometry
- **D-01:** Roadmap map wins over Phase 1's reserved gaps: Living Room **north door → Office**, **west door → Bedroom**; reverse doors are Office south and Bedroom east. Phase 1's east-wall gap is NOT a working door. — **Reversibility:** costly — shared-wall door alignment plus SC#2–4 wording both key on this topology; swapping later re-cuts walls, re-aligns neighbor rooms, and re-derives entry tiles.
- **D-02:** All working door gaps are **3 tiles wide (48 px)** — 8 px slack per side of the 32 px player. This resolves the Phase 1 UAT blocker (32 px gap vs 32 px body zero clearance).
- **D-03:** The Living Room north gap sits **off-center, left of the existing TV cluster** — the built TV/coffee-table rects stay untouched; planner picks exact coordinates. A clear lane must run from the gap into the room.
- **D-04:** Living Room east wall: **boarded/sealed decorative door** — gap-shaped dark planks rect, no zone, no traversal. Atmosphere + hints the house is bigger.
- **D-05:** Office and Bedroom get exactly **one working door each** (Office south, Bedroom east). Dead-end rooms.
- **D-06:** Doorway visual: open walkable gap + 2 px frame accent + brighter threshold tile, extending the Phase 1 D-09/D-11 Darkwood palette pattern.
- **D-07:** Door activation is a **Darkwood hybrid**: running into the threshold zone auto-fires the crossing (bump-open), AND pressing the movement direction key toward an adjacent door also fires it (try-the-handle gesture). Both route to the same slide transition. No key items, no dwell timer, no separate E-key on doors.
- **D-08:** The Living Room's bottom wall gets a **locked front-door decoration directly behind the spawn** — explains the D-03 (Phase 1) "just walked in" spawn and the can't-leave premise. Decoration only, same boarded style family as D-04.

### World architecture
- **D-09:** **One continuous L-shaped world**: Office directly above Living Room (sharing their horizontal wall), Bedroom directly left (sharing their vertical wall). Shared-wall door gaps align across both rooms. Doors do not teleport the camera — the player physically crosses the wall line. — **Reversibility:** costly — every room's geometry, camera bounds, and later per-room systems (lighting, audio) hang off this layout; separate-scene architecture would re-derive all of it.
- **D-10:** PLAN.md §Phase 2's "create tilemaps for all 3 rooms (JSON)" instruction is **overridden**: rooms stay code-placed rects + Graphics floors per the Phase 1 pattern, with per-room layout in data modules. Tilemaps arrive in Phase 7 when real tile art exists. (Phase 1 already deferred tilemaps to Phase 2; this re-defers them once with the user's blessing.)
- **D-11:** Phase 2 ships a first-class **"currentRoom" state concept**: each room registers a rectangular zone; a small system updates currentRoom as the player's center crosses zones (doorway overlap resolves by entry side). Phases 3–5 read this one value instead of re-inventing coordinate math.
- **D-12:** The bounding-box notch northeast of the L (no room there) gets **exterior dressing**: dark dirt/grass ground tone + a few silhouette props (dead shrub, fence posts). Non-walkable — walls stay solid; the player never enters it. The glimpse past room corners reads "house in a dark yard," never "rendering bug."

### Transition feel
- **D-13:** Crossing = **short auto-glide**: trigger fires → input locks → camera eases the player through the doorway (~0.6–0.8 s, ease-in-out, matching the D-06 Phase 1 floaty-mood lerp) → unlocks on the far side. No fade-through-black; no plain instant walk.
- **D-14:** The glide **carries the entry vector** — continues along the walking direction and ends ~2 tiles inside the destination room, centered on the door axis, facing the travel direction. Deterministic: every crossing of the same door lands the same rest spot (ROOM-02's "correct tile").
- **D-15:** Doorways are **windows**: the neighbor room's floor/furniture is glimpsible through the gap before crossing. Each room must read as distinct from its door sightline — informs D-16/D-17 layouts.

### Room contents & identity
- **D-16:** Phase 3 interactable hosts: **Office = computer (on desk) + bookshelf; Bedroom = phone on nightstand; Living Room keeps TV/couch/lamp as ambient props.** Phase 2 places these as collision-only rects exactly where Phase 3 will attach behavior.
- **D-17:** Both new rooms are **dense** (D-01 Phase 1 "lean set" deferred idea promoted): Office = desk+chair+computer, bookshelf, filing cabinet, floor lamp, potted plants, typewriter, walkable rug. Bedroom = bed (top wall), nightstand with phone, wardrobe, dresser, mirror, floor lamp, rug, book pile.
- **D-18:** **Per-room color temperature** within the Darkwood palette: Living = warm browns (as built), Office = muted greens/greys (the unused D-09 greens finally earn a room), Bedroom = deeper browns/near-black with the warm lamp pop. Checkerboard floor logic continues per room in the room's dominant tones.
- **D-19:** Every doorway keeps a **~2-tile-wide clear walking lane** a few tiles into the room before clutter starts — protects the bump-open gesture, the glide path, and peek sightlines.

### The agent's Discretion
- Exact world coordinate layout (where the L sits in positive space, e.g. Bedroom 0–320 × Living column, Office above) — planner's geometry math, as long as SC#1 tile sizes and D-09 adjacency hold.
- Whether rooms are one Scene with subzones or three logical scene modules sharing one world — D-11's currentRoom concept must be first-class either way; Phases 3–5 will expect per-room scene seams, so favor the split that keeps LivingRoomScene/OfficeScene/BedroomScene files distinct per PLAN.md's agent instructions.
- Threshold zone depth/shape, glide implementation mechanism (tween on player + camera vs camera-only), door frame pixel details, exterior prop placement, camera clamping at world edges of the L.
- StaticGroup organization per room (reuse the single `solids` pattern or per-room groups).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project canon
- `.planning/ROADMAP.md` §"Phase 2: Multi-Room" — goal + 6 success criteria (3 rooms, north/west door slides, reverse doors, entry tiles, collision/camera everywhere)
- `.planning/PLAN.md` §"Phase 2: Multi-Room" — prescribed files (OfficeScene.ts, BedroomScene.ts, door detection, slide transition, Player spawn support); NOTE: its tilemap instruction is overridden by D-10
- `.planning/PROJECT.md` §Context + §Constraints — Darkwood palette hexes, 16×16 tiles / 32×32 character, Phaser 4.2.1 + Arcade Physics, tech-stack lock
- `.planning/REQUIREMENTS.md` — GAME-04, ROOM-01, ROOM-02 (this phase); INTR-03 (Phase 3 object hosts inform D-16); Out of Scope table
- `AGENTS.md` — pre-commit gate, commit format, ponytail rules, path aliases

### Prior phase context (contracts this phase must honor)
- `.planning/phases/01-core-game-loop/01-CONTEXT.md` — D-02 reserved gaps (now rewired per D-01 here), D-03 spawn, D-05–D-07 camera contract, D-09 palette usage
- `.planning/phases/01-core-game-loop/01-UAT.md` — deferred follow-up (loading progress) already promoted to Phase 8; Test 2 door-clearance note → resolved by D-02
- `.planning/STATE.md` §Constraints/blockers — the zero-clearance door-gap blocker this phase closes

### Existing code (the coordinate contract)
- `src/game/scenes/LivingRoomScene.ts` — exported TILE/ROOM_W/ROOM_H/WORLD_W/WORLD_H/SPAWN_X/SPAWN_Y constants, `solids` StaticGroup pattern, wall-rect arrays, threshold styling — the geometry Phase 2 extends
- `src/game/objects/Player.ts` — SPEED, facing texture-swap system; spawn-position support extends this
- `src/game/main.ts` — scene registration chain (Boot→Preload→Gate→LivingRoom) where Office/Bedroom scenes plug in
- `src/game/systems/movement.ts` — pure movement helper pattern; glide/door-zone math should follow the TDD-lite pure-module style

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Phase 1 scene-constant export pattern (TILE/ROOM_*/WORLD_*/SPAWN_*) is the multi-room coordinate contract — extend, don't replace.
- `solids` single StaticGroup + one collider + Graphics-drawn floor/walls/furniture pattern scales directly to two more rooms.
- `ensurePlayerTexture` runtime-texture helper + placeholder-rect style = zero-asset dense rooms (D-17) without a pipeline.
- Camera `setBounds`/`startFollow(…, 0.05, 0.05)` config becomes per-room or per-L — reuse the lerp values, not new easing.

### Established Patterns
- TDD-lite: door-zone membership, currentRoom transitions, glide endpoints are pure math → framework-free modules with vitest specs (movement.ts precedent).
- Scene files named per room per PLAN.md agent instructions; Phaser scene transitions can stay `scene.start` + shared world data if the planner splits rooms as logical scenes.
- Path aliases `@/scenes/*`, `@/objects/*`, `@/systems/*` per PLAN.md §Path Aliases.

### Integration Points
- `src/game/main.ts` scene list gains OfficeScene/BedroomScene (or the continuous-world equivalent per D-09/discretion).
- Player needs an entry-position mechanism (PLAN.md: "Update Player to support spawn position from previous room").
- currentRoom state (D-11) lives where Phases 3–5 can read it — a game-level state module, not scene-local fields.

</code_context>

<specifics>
## Specific Ideas

- "Darkwood could open with a key, but running into it should also open the door like a hit" — the user's own words for D-07; the try-the-handle + slam-through hybrid.
- The locked front door behind spawn sells "you came in and can't leave" — dark-house premise decoration.
- "The house exhales you into the next room" — floaty-glide mood rationale (D-13).
- Rooms should look interesting from their doorway (D-15) — furniture silhouettes visible through gaps are the visual hook into each room.

</specifics>

<deferred>
## Deferred Ideas

- Tilemap pipeline (Tiled .tmj + collision layers) — moves to Phase 7 with real tile art (D-10 re-defers PLAN.md's instruction).
- Front door becomes functional / yard becomes walkable exterior — only if a later milestone wants "leave the house" moments; today D-08/D-12 are decoration.
- Door open/close animation on the sealed doors — Phase 7 art territory; Phase 2 doors are gaps, not objects.
- Walk-bob during glide — still parked with Phase 7 sprite work (Phase 1 deferred idea unchanged).

</deferred>

---

*Phase: 2-multi-room*
*Context gathered: 2026-10-20*
