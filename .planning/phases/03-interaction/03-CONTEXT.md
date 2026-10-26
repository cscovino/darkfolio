# Phase 3: Interaction - Context

**Gathered:** 2026-10-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Five interactables (Computer, Bookshelf, Phone + TV and floor lamp) respond to the E-key: a floating "Press E" prompt on approach (SC#1), a typewriter dialog box anchored to the screen (SC#2), and for the three hosts a CRT overlay slides up rendering the matching Astro page — Computer→Projects, Bookshelf→Skills, Phone→Contact (SC#3) — closable with E or Esc (SC#4). TV and lamp are dialog-only. Revisits cycle through a 3+ variant pool per object, dialog and overlay synced (SC#5). (INTR-01…05.)

**Not in scope:** lighting/FX behind the overlay (Phase 4), audio cues and lamp-toggle SFX triggers (Phase 5), real portfolio content (Phase 6 owns content collections), sprites/tilemaps (Phase 7), title screen/onboarding screens (Phase 8).

</domain>

<decisions>
## Implementation Decisions

### Interaction sequence (dialog → overlay)
- **D-01:** **Dialog, then auto-overlay**: E starts the typewriter; when typing finishes the dialog closes and the overlay slides up automatically — one keypress, one continuous beat. — **Reversibility:** costly — every interaction path, the revisit timing, and UAT scripts key on this sequence; splitting it re-tests the whole flow.
- **D-02:** Typewriter auto-types at a steady pace; **E skips instantly to full text**, then the normal flow continues (host → overlay, dialog-only → auto-dismiss countdown). ~~Esc during dialog behaves exactly like E.~~ **Amended 2026-10-26 (ratified post-audit):** **Esc cancels the dialog** — it slides the box out to `idle` with no overlay; a cancelled interaction still consumes a visit count. The overlay footer (`[E] or [ESC] to close`) promises Esc = back, and skip-then-forced-handoff contradicted it.
- **D-03:** **Five interactables**: Computer, Bookshelf, Phone (dialog + overlay) plus **TV and floor lamp** (dialog-only, never open overlays) — extends D-16 Phase 2 (hosts) with two Living Room flavor objects.
- **D-04:** Dialog-only boxes **auto-dismiss after ~1.5 s** pause once typing completes, with a **blinking ▼/… end cue** during the pause. No keypress needed to close.
- **D-05:** **One screen of text only** — copy is written to fit the box (~2–3 lines); no pagination state anywhere.
- **D-06:** Dialog box shows a **speaker tag** header (`[TV]`, `[COMPUTER]`, …) above the text.
- **D-07:** Dialog box **slides in/out from the bottom edge** — same slide language as the overlay and the Phase 2 glide mood (D-13).

### Dialog box look & geometry
- **D-08:** Box is **Darkwood paper**: warm brown plate, plain light text, 2 px Darkwood frame, **no scanlines/CRT treatment** — the box reads as "the house speaks", deliberately distinct from the CRT overlay ("the screen speaks"). Two visual languages: world UI vs screen UI.
- **D-09:** **Narrow centered box, ~70 % of frame width** — speech-bubble feel; exact pixel geometry is the planner's discretion.
- **D-10:** Prompt visibility: the floating prompt **hides while its own object's dialog or overlay is active** — no stale badge over a conversation.

### Overlay content source
- **D-11:** **Placeholder Astro routes** `src/pages/projects.astro`, `skills.astro`, `contact.astro` exist in Phase 3 with stub content — the overlay renders the actual Astro pages so INTR-03/04 are honest end-to-end. Phase 6 swaps stub content for content collections **without touching the overlay wiring**. — **Reversibility:** costly — the overlay's page-loading mechanism is the contract Phase 6 plugs into; changing it re-wires the overlay.
- **D-12:** **One object = one page, no in-overlay navigation** — closing the overlay and walking to the next object IS the navigation (computer=Projects, bookshelf=Skills, phone=Contact stays literal).
- **D-13:** Placeholder pages are **realistic stand-ins** (~3 fake projects, ~10 skill lines, contact links) — reads like a real portfolio during UAT; Phase 6 replaces the data source, not the layout.
- **D-14:** Overlay covers the frame **partially** — a strip of the dark room stays visible (atmosphere first); exact cover height is the planner's geometry.
- **D-15:** Overlay styling: **subtle CRT** — Darkwood-framed panel, faint scanlines, slight amber/green tint, high-contrast body text. Content taller than the panel **scrolls internally** (wheel / arrow keys); E/Esc still close.

### Revisit variants (INTR-05)
- **D-16:** **3+ dialog variants per object, cycled in order** (A→B→C→A) — all five objects; deterministic pools, no randomness.
- **D-17:** The **overlay has its own 3+ variant pool** — copy rotates (intro/status line, blurbs, winking asides); **layout stays constant** so Phase 6 content work doesn't fight moving sections.
- **D-18:** **One counter per object drives both**: visit N = dialog variant N = overlay variant N, **synced**. Counters are **independent per object** (computer's visit 3 ≠ phone's visit 1).
- **D-19:** Counter **increments on E press** — atomic; interrupted/skipped interactions never roll back or double-count. No 'completed' tracking separate from the counter.
- **D-20:** State is **in-memory only** — resets on reload. Phase 5 owns localStorage (AUD-03); no storage overlap.
- **D-21:** **Same flow on every visit** — dialog (next variant) → auto-overlay; revisit jokes land before the page.
- **D-22:** **Agent drafts all copy** — dialog variants and overlay variant copy in the humorous/meta fourth-wall tone from PROJECT.md, as opaque data strings; the user reviews and swaps wording freely during UAT (copy edits change nothing else).

### Prompt & input lock
- **D-23:** Proximity = **radial, ~2 tiles (32 px) from object center, any facing**, **no line-of-sight through solids** (the desk sits between player and computer — distance would break otherwise), **plus a same-room check** against D-11 Phase 2's `currentRoom` so interaction never leaks across a wall into the neighbor room.
- **D-24:** **Nearest in-range object only** — one prompt shown, nearest wins the E press.
- **D-25:** Prompt = **floating world-anchored badge above the object**, amber key badge (`#FFA500` — same accent as lamp/facing notch), dark label plate, light text, 2 px Darkwood frame. **Per-object verb**: Boot up (computer) / Browse (bookshelf) / Answer (phone) / Watch (TV) / Toggle (lamp).
- **D-26:** **No onboarding beyond the badge** — the verb badge is the only teaching; it re-teaches every time it appears. No one-time hint line, no pulse.
- **D-27:** **Movement locked while the dialog box is open** (velocity zeroed; door triggers blocked too — also hedges Phase 2's WR-01 bump warning).
- **D-28:** **While the overlay is open: block input, keep rendering** — movement/E/dead-zone doors all blocked, but the scene keeps drawing behind the visible strip so Phases 4/5 (flicker, ambient) stay alive for free.
- **D-29:** **E is ignored during a door glide** (input stays locked until the glide unlocks on the far side) and **E/Esc are ignored from typing-finished until the overlay finishes sliding up** — otherwise a double-tap closes the overlay it just opened.
- **D-30:** INTR-04 close keys unchanged: **E or Esc closes the overlay with a slide-down** (SC#4).

### The agent's Discretion
- Exact radius tuning (2 tiles is the intent, not a hard constant), exact box/panel pixel geometry, overlay cover height, typewriter speed and auto-dismiss duration (~1.5 s is the intent), slide easing/durations, prompt z-order and badge sizing.
- Where interaction state lives and how it's shaped (the data registry pattern suggested by Phase 2's `DOORS` precedent is natural but not mandated), how variant pools are stored as data, how the overlay loads the Astro page into the partial-cover panel.
- Exact stub content wording within D-13's depth and D-22's tone.
- TDD-lite split: proximity math, room check, nearest-selection, and variant cycling are pure logic → framework-free modules with vitest specs (movement.ts / doorGlide.ts precedent); scene/DOM wiring verified in the browser.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project canon
- `.planning/ROADMAP.md` §"Phase 3: Interaction" — goal + 5 success criteria (prompt, dialog box, three overlays, E/Esc close, revisit variants)
- `.planning/PLAN.md` §"Phase 3: Interaction" — prescribed files and manual-test checklist; §"Path Aliases" — `@/game/*`, `@/scenes/*`, `@/objects/*`, `@/systems/*`, `@/data/*`
- `.planning/PROJECT.md` §Context + §Constraints — dialog tone (humorous/meta, fourth wall), Darkwood palette hexes, framed-CRT aesthetic, tech-stack lock, ponytail style discipline
- `.planning/REQUIREMENTS.md` — INTR-01…05 (this phase); CONT-01…03 (Phase 6 owns real content — placeholder depth per D-13); Out of Scope table
- `AGENTS.md` — pre-commit gate (format/test/astro check/build), TDD-lite rule, commit format, ponytail rules, path aliases

### Prior phase context (contracts this phase must honor)
- `.planning/phases/02-multi-room/02-CONTEXT.md` — D-16 hosts placement (computer/bookshelf/phone rects), D-11 `currentRoom` state (used by D-23), D-07 doors never use E, D-13 glide input lock (D-29), D-18 per-room color identity
- `.planning/phases/01-core-game-loop/01-CONTEXT.md` — D-09/D-12 placeholder-rect + framed-box aesthetic this phase's UI extends
- `.planning/STATE.md` §Constraints/blockers — **WR-01** (door trigger fires from a bump without confirming entry side) and **WR-02** (mid-glide teardown leaves body disabled / `gliding=true`) — Phase 3 attaches interaction to the same surfaces; D-27/D-29 partially hedge WR-01. Also: Phase 1/2 verification staleness deferral (refresh both in one sweep when Phase 3 closes).

### Existing code (the attachment surface)
- `src/game/data/rooms.ts` — `LIVING/OFFICE/BEDROOM_LAYOUT` solids+decor tuples are where the five interactables' rects live (D-03 Phase 2 already reserved them); `DOORS` registry is the data-registry precedent
- `src/game/scenes/buildRoom.ts` — one shared builder draws all rooms; interaction zones hang off layout coords, not per-room code
- `src/game/objects/Player.ts` — `handleInput(keys)` + `getFacing()`; E-key handling and input locking extend this path
- `src/game/systems/currentRoom.ts` + `src/game/state/currentRoom.ts` — the same-room check for D-23 reads this
- `src/game/systems/doorGlide.ts` — glide input-lock integration point for D-29
- `src/components/GameCanvas.astro` + `src/pages/index.astro` — the 640×480 frame the dialog box and partial-cover overlay mount into; `src/pages/` currently holds only `index.astro`
- `src/game/systems/movement.ts` / `doorGlide.ts` + their `.test.ts` — TDD-lite precedent for proximity/variant pure modules

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Phase 2's data-registry pattern (`DOORS: DoorDef[]` + one generic loop) is the template for an interactable registry (rect, verb, overlay mapping, variant pools).
- `currentRoom` state (D-11 Phase 2) already answers "which room is the player in" — D-23's room check reuses it, zero new math.
- Scene-constant coordinate contract (`TILE`/`ROOM_*`/origins in `rooms.ts`) gives exact object centers for radius checks.
- `ensurePlayerTexture` + placeholder-rect style = the prompt badge/box can be code-drawn with zero assets.

### Established Patterns
- TDD-lite: proximity membership, nearest-selection, room check, and variant cycling are pure math → framework-free vitest modules (`movement.ts`, `doorGlide.ts` precedent).
- Pure-system tests co-located as `*.test.ts` (`rooms.test.ts` asserts layout rect clearance — interactable zones must pass the same overlap guards).
- Astro hosts the game client-side via component mount + script import — the overlay follows the same DOM-over-canvas model (partial cover over `#game-frame`).
- Path aliases `@/systems/*`, `@/data/*`, `@/state/*` per PLAN.md.

### Integration Points
- `src/pages/` gains `projects.astro`, `skills.astro`, `contact.astro` (D-11) — Phase 6 replaces their content source.
- `Player.handleInput` gains an interaction/lock gate; `doorGlide` lock now also swallows E (D-29).
- The overlay is DOM layered over `GameCanvas.astro`'s frame — input blocking must span both Phaser keys and DOM focus (E/Esc close per D-30).
- Variant state is game-level (per-object counters), not scene-local — room transitions and overlay open/close both read it.

</code_context>

<specifics>
## Specific Ideas

- "Dialog box = the house speaks, overlay = the screen speaks" — the Darkwood-paper vs CRT split (D-08) is deliberate two-language design, not an inconsistency.
- The house as navigation: closing the overlay and walking to the next object is the point (D-12) — no menu-like jumping between pages.
- The floating badge carries all onboarding by itself (D-26) — verb-specific prompts (`[E] Answer`) re-teach every time without a tutorial.
- Lamp's prompt verb is literally "Toggle" — wording that anticipates Phase 5's lamp-toggle SFX without building toggling now (see Deferred).
- User consistently picked the option that protects atmosphere and reading: partial cover over full-frame, generous radius, badge over HUD corner.

</specifics>

<deferred>
## Deferred Ideas

- **Lamp light toggling** (E flips the Living Room lamp on/off, feeding LITE-02 and giving AUD-02's "lamp toggle" SFX a real trigger) — a new capability, not INTR scope; Phase 3's lamp is dialog-only with the "Toggle" verb as the placeholder wording.
- **In-overlay cross navigation** (Projects ↔ Skills ↔ Contact links) — considered and rejected (D-12); revisit only if a later phase wants menu-style browsing.
- **Mouse/click interaction on objects** — desktop mouse could also trigger interactables; INTR-01 specifies E-key, so click support would be its own addition.
- **One-time onboarding hint line** — considered and rejected (D-26); revisit in Phase 8 with the title screen if UAT shows visitors never press E.

None — discussion otherwise stayed within phase scope (0 todos matched this phase).

</deferred>

---

*Phase: 3-interaction*
*Context gathered: 2026-10-22*
