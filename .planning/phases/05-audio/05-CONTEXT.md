# Phase 5: Audio - Context

**Gathered:** 2026-11-10
**Status:** Ready for planning

<domain>
## Phase Boundary

The house becomes audible: two procedural ambient layers start the moment the visitor enters, six contextual SFX fire on their existing trigger events, the lamp gains the on/off toggle Phase 4 deferred here, and a mute control (top-right pixel button + `M`) silences everything instantly and survives reloads. (AUD-01, AUD-02, AUD-03; ROADMAP §Phase 5 SC#1–5.)

**In scope:** ambient drone + wind from boot, footsteps, door, computer-boot, phone-ring, lamp-toggle and TV-static SFX, gate switch click, typewriter dialog blips, lamp light on/off, mute button + `M`, mute persistence.

**Not in scope:** a volume slider or any settings panel (Out of Scope), recorded/Ogg assets (superseded — D-01), per-room music, audio ducking under the CRT overlay (deferred), lamp state persistence (only mute persists), mobile/touch audio (Phase 8 gate), real sprites (Phase 7).

</domain>

<decisions>
## Implementation Decisions

### Sound source & synthesis
- **D-01:** **All audio is synthesized procedurally with Web Audio** — no `.ogg`/audio files, no audio dependency, no licensing or download step. `public/assets/` stays empty this phase. Supersedes `PLAN.md` §"Audio Specifications" "All audio in OGG format" and PLAN §Phase 5's freesound/opengameart/tabletopaudio sourcing lines (same precedent as Phase 4 D-20). — **Reversibility:** costly — undoing it means authoring the whole sound layer against files, adding the asset pipeline, license notes, and auditioning every mix again.
- **D-02:** **Gritty analog character** — filtered noise, detuned oscillator stacks, slow pitch drift, soft transients. Not clean square-wave chiptune.
- **D-03:** **Two ambient layers, each a short looped graph with slow LFO breathing** — a low house drone and a wind layer. Deterministic per session; no generative event scheduler, no sample seams.
- **D-04:** **Room-aware ambient mix** — wind leans toward the yard/bedroom window, drone toward living/office. Gains ease between targets when `currentRoom` changes; no distance-based wind math. — **Reversibility:** reversible — two gain targets and one ease.
- **D-05:** **Tab hidden fades audio out; return restores the mix unless muted.** Visibility changes never override mute.
- **D-06:** **Volumes follow `PLAN.md`: ambient 30%, SFX 70%.** Mute is the only audio control; no slider, no per-sound settings.

### Boot & unlock
- **D-07:** **The gate keypress is the audio unlock.** On the gate's keydown, create/resume the `AudioContext`, play one soft mechanical switch click, and have the ambient layer already breathing when the house scene appears. No autoplay attempt on page load. — **Reversibility:** costly — every browser path, the gate's timing, and UAT SC#1 depend on this single gesture.
- **D-08:** **Audio outlives `GateScene`** — one engine lifespan spanning the gate → house scene transition (engine owned outside scene instances). The gate scene stopping must not silence the house.
- **D-09:** **A muted returning visitor boots silently** — the unlock still happens, the switch click is suppressed, and the house stays silent until unmuted.

### Mute control
- **D-10:** **Accessible DOM `<button>` pinned top-right of the canvas frame**, visible from the gate onward (not just in the house). Tiny pixel speaker glyph that swaps to speaker-with-slash; `aria-pressed` + `aria-label`; keyboard-focusable with a visible focus state. Not a canvas-drawn control.
- **D-11:** **`M` toggles mute everywhere** — exploring, mid-typewriter, during a door glide, with the CRT overlay open, and on the gate. The overlay's own document key handler must let `M` through.
- **D-12:** **Mute is instant silence of every source** (master gain to zero, no fade of individual voices) and unmute restores the previous mix without restarting ambient graphs; no pause/recreate artifacts.
- **D-13:** **Only mute persists**, via `localStorage`; default is unmuted. Lamp on/off, footsteps, and everything else reset on reload (Phase 3 D-20's in-memory precedent).
- **D-14:** **Returning from a hidden tab respects mute** — restore only when unmuted.

### Trigger moments
- **D-15:** **Footsteps fire by distance walked (~24 px, tunable) with two surface timbres** — wood for living/office, carpet for bedroom — selected from a new per-room `surface` field in the room layouts (`rooms.ts`, or a sibling data module). No per-pixel blending. Steps naturally stop while the player is still (dialog, overlay, glide).
- **D-16:** **TV static is a proximity loop** in the living room: its gain follows distance to the TV (roughly the lamp's 48 px radius, tunable). It is audibly on before `WATCH` is pressed; not tied to the interaction.
- **D-17:** **The lamp really toggles.** `E` flips its warm pool and its flicker off/on with a switch click each way; the source stays a light source with on/off state. **Supersedes Phase 4 D-09 for the lamp only** — TV and computer stay always on. Lamp state resets ON on reload; dialog variants stay unchanged (no state-aware lamp text). — **Reversibility:** costly — lighting's source registry, flicker loop, and UAT for Phase 4 SC#3 all read lamp state.
- **D-18:** **Typewriter blips** — a quiet filtered tick every few revealed characters while the typewriter runs, coupled to the existing reveal clock, silent on skip/close and fully above the ambient bed.
- **D-19:** **One-shot interaction SFX on the existing hooks:** computer boot on `BOOT UP`, one-shot ring on `ANSWER` that decays under the dialog (no ring while the Contact overlay is open), door sound at glide start, lamp click on toggle.
- **D-20:** **No SFX on overlay navigation or dialog close** — the listed triggers are the complete set; nothing fires for opening/closing the CRT panel itself.

### the agent's Discretion
- Synthesis graphs, oscillator/noise recipes, envelopes, and voice counts per sound; exact footstep spacing px; TV-static falloff shape and radius; blip rate and pitch; ambient target gains inside D-06's 30% envelope; easing time for room-aware mix and hidden-tab fade.
- Master gain staging / clipping protection when several SFX overlap; whether a limiter sits on the master bus.
- Engine file layout (`PLAN.md` suggests `src/game/systems/Audio.ts`; file choice stays planner's) and how the DOM button reaches the engine (module singleton vs game registry).
- TDD-lite split: mute persistence/default, distance→step cadence, surface selection, and room→ambient-gain mapping are pure logic → framework-free vitest modules (`movement.ts` / `dialog.ts` precedent). Synthesis and audible behavior browser-verified in `pnpm dev`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project canon
- `.planning/ROADMAP.md` §"Phase 5: Audio" — goal + 5 success criteria (ambient from boot, six trigger SFX, mute button + `M`, persistence).
- `.planning/REQUIREMENTS.md` — AUD-01, AUD-02, AUD-03; Out of Scope table (no volume slider/settings, no mobile, no backend, self-hosted assets only).
- `.planning/PLAN.md` §"Audio Specifications" — volumes (ambient 30%, SFX 70%) retained; **"All audio in OGG format" overridden by D-01**.
- `.planning/PLAN.md` §"Phase 5: Audio" — trigger checklist and manual-test list; its OGG asset-sourcing instructions are overridden by D-01; its "TV static plays near TV" and surface-dependent footsteps match D-15/D-16.
- `.planning/PLAN.md` §"Path Aliases" — `@/game/*`, `@/scenes/*`, `@/objects/*`, `@/systems/*`, `@/data/*`, `@/state/*`; §"Tech Stack" — no new dependencies.
- `.planning/PROJECT.md` §Context + §Constraints — Darkwood palette, 60 fps / <5 s load / <10 MB / no leaks, no CDN or Google Fonts, ponytail style discipline.
- `AGENTS.md` — pre-commit gate (format/test/astro check/build), TDD-lite rule, commit format, ponytail rules, accessibility is never cut.

### Prior phase context (contracts this phase must honor)
- `.planning/phases/04-lighting/04-CONTEXT.md` — **D-13** lamp toggle deferred to this phase (→ D-17), **D-09** all sources always on (superseded for lamp only), **D-17** UI stays outside the world layer, **D-19** boot gate is its own screen, **D-21** 60 fps hard floor (audio must not buy frames).
- `.planning/phases/03-interaction/03-CONTEXT.md` — `startInteraction` hook, typewriter reveal clock (→ D-18), overlay key policy (→ D-11), scene keeps rendering behind the overlay (→ D-20).
- `.planning/phases/02-multi-room/02-CONTEXT.md` — `currentRoom` state (→ D-04) and one scene covering all rooms (→ D-08).
- `.planning/phases/01-core-game-loop/01-CONTEXT.md` — `movement.ts` key-state/velocity contract (→ D-15 cadence input).
- `.planning/STATE.md` — current phase and branch bookkeeping.

### Existing code (the attachment surface)
- `src/game/main.ts` — the single `Phaser.Game`; the engine's natural owner for D-08.
- `src/game/scenes/GateScene.ts` — `keyboard.once('keydown')` is D-07's unlock point.
- `src/game/scenes/LivingRoomScene.ts` — `startInteraction` / `startGlide` / `update` are D-15/D-16/D-17/D-18/D-19's hooks; `SHUTDOWN` cleanup must release audio listeners.
- `src/game/components` / `src/components/GameCanvas.astro` — the frame that hosts D-10's DOM button.
- `src/game/objects/InteractionUI.ts` — `setReveal` clock for D-18; badge/dialog language to match.
- `src/game/data/rooms.ts` — layout tuples + floor palettes; new `surface` field for D-15.
- `src/game/data/lights.ts` + `src/game/objects/Light.ts` — light-source registry and `LightLayer` where D-17's lamp state lives.
- `src/game/systems/currentRoom.ts` (+ `.test.ts`) — module-singleton precedent and D-04's room signal.
- `src/game/systems/movement.ts`, `dialog.ts`, `variants.ts` (+ tests) — TDD-lite precedent for the pure modules this phase adds.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`currentRoom` module singleton** — already updated per frame in `LivingRoomScene.update`; D-04 can read it without new state plumbing.
- **`startInteraction(obj)`** — one funnel for every interactable; SFX attach by `obj.id` with no per-object scene code.
- **`startGlide(door, side)`** — single door-transition hook for D-19's door sound.
- **`InteractionUI.setReveal` / `revealCount`** — the typewriter's progress clock is already explicit; D-18 keys off it.
- **`LightLayer` / `lights.ts` registry** — lamp pool + flicker are data-driven; D-17 adds an on/off field rather than a new object.
- **`GameCanvas.astro` frame** — positioned `relative` with `overflow: hidden`; D-10's button anchors here and inherits the CRT border language.
- **Pure-module test precedent** — `movement.test.ts`, `dialog.test.ts`, `currentRoom.test.ts` show how to keep audio logic framework-free.

### Established Patterns
- Data registries over per-case code (`DOORS`, `INTERACTABLES`, `LIGHTS`) — the sound map should be data too.
- `JustDown` edges for presses (no OS key repeat) — mute key and any SFX-on-press follow it.
- Module-singleton state (`currentRoom`) for cross-scene values; no Phaser registry usage so far.
- Scene `SHUTDOWN` handlers release timers, tweens, and window listeners — audio listeners get the same treatment.
- Deterministic logic unit-tested; visible/audible behavior verified in `pnpm dev`.

### Integration Points
- `main.ts` creates the game — engine creation/ownership for D-08.
- `GateScene.create` keydown — unlock + switch click (D-07).
- `LivingRoomScene.create/update` — ambient start, room-aware mix, footsteps, TV proximity, lamp state, dialog blips, interaction SFX, mute key.
- `GameCanvas.astro` — top-right button markup/label (D-10) wired to the engine.
- `GameOverlay.astro`'s document key handler — must not consume `M` (D-11), and overlay open/close gets no SFX (D-20).
- `rooms.ts` layouts — add `surface` metadata without disturbing collision/decor tuples.

</code_context>

<specifics>
## Specific Ideas

- The chosen sound is "gritty analog", never chiptune: worn hardware, pitch drift, filtered noise.
- Ambient must feel alive but never loop-spottable — slow LFO breathing over short graphs, no random event generator.
- Room-aware ambience is the atmosphere beat: wind toward the yard/bedroom window, drone around the living room and office.
- The gate click-then-drone is the entry ritual: one soft switch, then the house is already listening.
- Mute is a real, accessible, always-available control — visible even at the gate, with a pixel speaker that visibly changes state.
- The lamp becomes a real switch: dark to warm and back, with the flicker dying and returning with it.
- TV static is diegetic before interaction — you hear the TV is on before you press WATCH.

</specifics>

<deferred>
## Deferred Ideas

- **Distance-based wind gain** — considered for ambience; not selected (room-aware mix is enough). Revisit only if per-room ambience feels flat.
- **Ring while the Contact overlay is open** — rejected in favor of a one-shot ring; revisit if the panel feels silent.
- **Generative creaks/drips over the ambient bed** — rejected for determinism; future atmosphere pass.
- **Per-pixel surface blending for footsteps** — rejected in favor of per-room surfaces.
- **State-aware lamp dialog** ("dark"/"lit" lines) — declined; dialog variants stay rotation-based.
- **Ambience ducking under the open CRT overlay** — raised, not discussed; revisit if the panel competes with the house bed.
- **Volume slider / settings UI** — Out of Scope, not a future phase.

None folded — 0 todos matched this phase.

</deferred>

---

*Phase: 5-audio*
*Context gathered: 2026-11-10*
