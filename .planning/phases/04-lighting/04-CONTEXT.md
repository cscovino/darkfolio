# Phase 4: Lighting - Context

**Gathered:** 2026-11-04
**Status:** Ready for planning

<domain>
## Phase Boundary

The house goes dark: all three rooms render at a 70% darkness baseline, the player carries a facing-weighted 4-tile warm-yellow (`#FFA500`) torch, lamps glow warm (~5–6 tiles), computer and TV glow cold-blue (~2–3 tiles), and lamps flicker subtly. Light pools are wall-occluded and visible through doorway gaps. UI (dialog, overlay, E-badge) is untouched by lighting. (LITE-01, LITE-02, LITE-03; SC#1–5 in ROADMAP §Phase 4.)

**Not in scope:** lamp on/off toggling (deferred to Phase 5 — its SFX trigger phase), audio (Phase 5), real sprites/light textures (Phase 7), title screen treatment (Phase 8), any settings/brightness control (Out of Scope).

</domain>

<decisions>
## Implementation Decisions

### Darkness & sightlines
- **D-01:** **Even flat veil at ~30% brightness** (spec-literal LITE-01's "70% dark"), applied **only to the room the player is currently in** — rooms you're not in drop to near-black so their light pools are what you see through the door gaps. Reconciles SC#1 (your room's shapes faintly visible) with SC#5 (elsewhere near-black). — **Reversibility:** costly — the veil being keyed to `currentRoom` is the load-bearing rule for the sightline design; a world-wide veil re-derives occlusion, doorway-glow, and the glide fade.
- **D-02:** **Glow through doorways** — neighbor rooms are near-black but their lamp/TV/computer pools stay lit and glimpsable through the 48px gaps; keeps Phase 2 D-15's sightline promise.
- **D-03:** **Occlusion = walls only.** Light pools and the player's torch stop at wall geometry, but pass through doorway openings — one rule, no per-source exceptions. Your torch can reveal the far threshold through a gap; a neighbor's pool peeks around the corner.
- **D-04:** **Yard/exterior notch shares the current room's veil** — Phase 2 D-12's silhouette props (dead shrub, fence posts) keep faintly reading; the yard never goes separately near-black.
- **D-05:** **Veil switches rooms with a short fade (~0.4 s) at the wall line during a door glide** — the old room fades to near-black behind you as the glide carries you through; no instant swap mid-glide, no delayed flip on arrival.
- **D-06:** **Soft 2-step falloff** at every pool's rim — a couple of pixel steps, glow reads as light without smearing the pixel grid at 4× zoom.
- **D-07:** **Furniture silhouette outlines lift only inside the player's torch footprint** — one radius governs glow and readability; no room-wide outline pass, no second ring radius to tune.
- **D-08:** **Torch is facing-weighted** — slightly brighter / reaching further the way the player faces (lantern-in-hand feel); plain uniform circle rejected. — **Reversibility:** reversible — localized to the torch pool builder.

### Light source behavior
- **D-09:** **All sources always on in Phase 4** — three lamps, Office computer, Living Room TV glow constantly; no proximity gating, no mixed on/off states. (House feels alive in every room; zero light state to manage.)
- **D-10:** **Pool hierarchy:** lamps ~5–6 tiles warm (room anchors), TV/computer ~2–3 tiles cold, torch 4 tiles. — **Reversibility:** costly — PLAN.md's suggested radii (lamps 3, screens 2) are overridden by this (see D-19); radii feed UAT scripts and the flicker tuning.
- **D-11:** **Pools tint what's inside them** — objects under a cold-blue pool read cold, under a warm pool read warm (SC#3's "render with their respective colors" taken literally); not a flat color wash, not brighten-only.
- **D-12:** **The source object itself stays full-bright** — bulb/screen renders its true palette color even under the veil, so a lit lamp or running TV is spot-able across a near-black room; the pool falls off around it.
- **D-13:** **Lamp on/off toggling is deferred to Phase 5** — user explicitly chose deferral: not in LITE-01…03, and Phase 5's AUD-02 "lamp toggle" SFX is the trigger's natural home. Phase 3's lamp "Toggle" verb stays placeholder wording.

### Flicker character
- **D-14:** **All three lamps flicker, independently** — each runs its own seeded irregular brightness-step pattern (deterministic, testable — no live randomness), steps every ~0.5–1.5 s at varying intervals (slow old-bulb, not electric buzz), never synced across lamps. **Brightness only — the pool radius never breathes.**
- **D-15:** **TV and computer get a faint subordinate wobble** — smaller amplitude, gentler cadence than lamp flicker; reads as "screen is on", not "screen is faulty". (Slight extension within LITE-02's how-to-render; agreed during discussion.)
- **D-16:** **The player's torch does not flicker** — a steady torch means any shimmer unambiguously reads as "the lamps" (SC#4 attribution).

### UI under lighting
- **D-17:** **Dialog box, CRT overlay, and the floating E-badge always render full-bright** — screen UI is its own language (Phase 3 D-08) and the badge is the only teaching (D-26); lighting only ever touches the world layer.
- **D-18:** **Lighting runs untouched while UI is open** — no extra dim, no overlay wash, no UI-state coupling; flicker stays alive behind the open panel exactly as Phase 3 D-28 intended.
- **D-19:** **The boot "press any key" gate is unaffected** — darkness/lights exist only inside the house; lighting is a house system, not a global skin.

### Scope & performance
- **D-20:** **PLAN.md §Phase 4 is overridden by this CONTEXT** — its suggested radii (lamps 3 / screens 2), its "Lamp toggle (Press E)" manual test, and "random flicker on all lights" are superseded by D-10, D-13, and D-14/D-16 respectively. Same precedent as Phase 2's D-10 (PLAN instruction overridden with the user's blessing). — **Reversibility:** costly — downstream agents must not silently re-introduce PLAN's numbers; this file is the authority for Phase 4 decisions.
- **D-21:** **60 fps is the hard floor — glow quality yields first.** If lighting threatens frames: cheaper falloff / precomputed veil / fewer per-frame updates; every light source and every flicker animation stays. Never trade away sources or animation for frames, and never accept a frame dip.

### the agent's Discretion
- Exact pool radii within D-10's hierarchy guidance (5–6 / 2–3 tiles), fade duration (~0.4 s is the intent), falloff step widths, facing-weight bias magnitude, flicker step sizes and seeded pattern tables, screen-wobble amplitude.
- How occlusion, tint, and the veil are computed and rendered (technique is the researcher/planner's call — must honor D-01…D-08's observable behavior), and where the lighting code lives (PLAN.md suggests `src/game/systems/Lighting.ts` + `src/game/objects/Light.ts` — file layout remains planner's choice).
- TDD-lite split: flicker pattern generation (seeded steps), occlusion membership, pool tint math are pure logic → framework-free vitest modules (`movement.ts` / `doorGlide.ts` precedent); visual behavior browser-verified in `pnpm dev`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project canon
- `.planning/ROADMAP.md` §"Phase 4: Lighting" — goal + 5 success criteria (70% dark, 4-tile `#FFA500` torch, colored sources, subtle flicker, near-black outside radii)
- `.planning/PLAN.md` §"Phase 4: Lighting" (line ~466) — prescribed file suggestions (`src/game/systems/Lighting.ts`, `src/game/objects/Light.ts`) and manual-test checklist; **NOTE: its radii / lamp-toggle test / all-lights-flicker lines are overridden by D-20**
- `.planning/PLAN.md` §"Path Aliases" — `@/game/*`, `@/scenes/*`, `@/objects/*`, `@/systems/*`, `@/data/*`, `@/state/*`
- `.planning/PROJECT.md` §Context + §Constraints — Darkwood palette hexes, 60 fps / <5 s load / no-leaks performance lock, tech-stack lock, ponytail style discipline
- `.planning/REQUIREMENTS.md` — LITE-01, LITE-02, LITE-03 (this phase); AUD-02's lamp-toggle SFX (Phase 5 owns toggling per D-13); Out of Scope table (no brightness control, no settings UI)
- `AGENTS.md` — pre-commit gate (format/test/astro check/build), TDD-lite rule, commit format, ponytail rules

### Prior phase context (contracts this phase must honor)
- `.planning/phases/03-interaction/03-CONTEXT.md` — **D-28** (scene keeps rendering behind overlay → D-18), D-08 (two UI languages → D-17), D-25 (amber badge → D-17), lamp "Toggle" verb placeholder (→ D-13 deferred toggle)
- `.planning/phases/02-multi-room/02-CONTEXT.md` — **D-15** doorway sightlines (→ D-02), **D-12** exterior dressing (→ D-04), D-11 `currentRoom` state (→ D-01 keys the veil), D-18 per-room color identity
- `.planning/phases/01-core-game-loop/01-CONTEXT.md` — D-09 placeholder art (lamp warm / TV cold-blue hints → D-11 colors), D-10 checkerboard legibility (→ D-07 outlines)
- `.planning/STATE.md` — Phase 4 listed as next; WR-01/WR-02 notes (Phase 3 interaction attaches to the same surfaces)

### Existing code (the attachment surface)
- `src/game/scenes/buildRoom.ts` — one shared builder draws every room; lighting hangs off room geometry, not per-room code
- `src/game/data/rooms.ts` — layout tuples with `0xffa500` lamp hints and `0x6b8fbf` screen/TV rects already in the data (the light-source registry's natural home, `DOORS`/`interactables.ts` data-registry precedent)
- `src/game/scenes/LivingRoomScene.ts` — scene camera (zoom 4, lerp follow) + second zoom-1 UI camera; lighting must apply to the world camera only (D-17)
- `src/game/systems/currentRoom.ts` + `src/game/state/currentRoom.ts` — `currentRoom` value D-01 keys the veil on
- `src/game/systems/doorGlide.ts` — glide loop where D-05's veil fade hooks in
- `src/game/objects/Player.ts` — `handleInput(keys)` / `getFacing()` — D-08's facing-weighted torch reads facing here
- `src/game/systems/movement.ts`, `proximity.ts`, `variants.ts` (+ `.test.ts`) — TDD-lite precedent for the pure modules this phase adds

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Data-registry pattern** (`DOORS: DoorDef[]`, `interactables.ts`) — a light-source registry (rect, color, radius, flicker profile) is data, not code; adding a source later is a tuple.
- **`currentRoom` state (Phase 2 D-11)** — answers "which room is the player in" for the room-keyed veil; zero new math.
- **Scene-constant coordinate contract** (`TILE`, room origins in `rooms.ts`) — exact positions for every lamp/screen pool.
- **Second zoom-1 UI camera (Phase 3)** — D-17's full-bright UI falls out of applying lighting to the world camera only; no per-object UI exclusion needed.

### Established Patterns
- TDD-lite: seeded flicker pattern, wall-occlusion membership, pool tint math → framework-free vitest modules (`movement.ts`, `doorGlide.ts`, `variants.ts` precedent); scene rendering browser-verified.
- Placeholder-rect / Graphics-drawn world (no textures) — lighting is code-drawn too; zero assets this phase.
- Pure data modules co-located with `*.test.ts` (`rooms.test.ts` guards layout clearance — light rects should pass the same overlap guards).

### Integration Points
- `buildRoom.ts` / room scenes gain the lighting pass; `Player` exposes facing for D-08; `doorGlide` hosts D-05's veil fade; `currentRoom` changes drive D-01.
- Phase 3's overlay/dialog DOM sits above the canvas — D-17/D-18 mean no lighting work touches `GameOverlay.astro` or `InteractionUI.ts`.
- Performance floor (D-21) applies at the render layer — measurement happens in the browser at 60 fps target.

</code_context>

<specifics>
## Specific Ideas

- User consistently chose the option that protects atmosphere *and* readability: glow through doorways over tunnel vision, silhouette outlines inside the torch footprint over pure darkness, source-stays-bright over moodier dimming.
- "Lantern-in-hand" — the facing-weighted torch is the user's pick for feel; it's the phase's signature motion.
- Slow old-bulb flicker with independent per-lamp patterns — deliberately not a loop you can spot, deliberately not synced (no accidental "haunted grid" effect).
- The doorway is the phase's hero moment: near-black rooms, one warm pool visible through a 48px gap, veil fading behind you as you cross.
- Screens shimmer gently subordinate to lamps — "screen is on", not "screen is faulty".

</specifics>

<deferred>
## Deferred Ideas

- **Lamp on/off toggling (E near lamp flips it)** — user decision 2026-11-04: belongs to Phase 5, where AUD-02's lamp-toggle SFX trigger lives; Phase 3's "Toggle" verb is the placeholder. (Was already a Phase 3 deferred idea.)
- **Badge as a light source** (amber glow pool on the object it marks) — considered during UI discussion, not selected; revisit only if prompts get lost in dark rooms during UAT.
- **Gate screen starts dark** — atmospheric foreshadowing before entry; not selected (D-19), revisit with Phase 8's title screen.
- **House-wide synced flicker as a supernatural beat** — noted as a deliberate effect option, rejected for gameplay distraction; a future "spooky event" moment could use it.

None — discussion otherwise stayed within phase scope (0 todos matched this phase).

</deferred>

---

*Phase: 4-lighting*
*Context gathered: 2026-11-04*
