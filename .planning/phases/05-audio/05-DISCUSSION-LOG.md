# Phase 5: Audio - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-11-10
**Phase:** 5-audio
**Areas discussed:** Sound source & format, Boot & autoplay unlock, Mute control, Trigger moments

---

## Sound source & format

| Option | Description | Selected |
|--------|-------------|----------|
| Procedural Web Audio | Oscillators/noise in code: zero assets, zero licensing, deterministic | ✓ |
| Vendored OGG samples | CC0 samples from freesound/opengameart into `public/assets/audio/` | |
| Hybrid | Synthesized SFX + recorded ambient loops | |

**User's choice:** Procedural Web Audio
**Notes:** Chosen for no assets/licensing/download step; accepted chiptune-adjacent tradeoff, so character was set separately.

| Option | Description | Selected |
|--------|-------------|----------|
| Gritty analog | Filtered noise, detuned stacks, pitch drift | ✓ |
| Clean chiptune | Square/triangle tones, clean envelopes | |

**User's choice:** Gritty analog
**Notes:** Matches Darkwood palette and Phase 4's slow old-bulb flicker.

| Option | Description | Selected |
|--------|-------------|----------|
| Static mix everywhere | Both loops at a flat 30% | |
| Room-aware mix | Wind toward yard/bedroom, drone toward living/office, eased on `currentRoom` change | ✓ |
| Distance-based wind | Wind gain follows distance to yard | |

**User's choice:** Room-aware mix
**Notes:** Keeps atmosphere without distance math; uses existing room state.

| Option | Description | Selected |
|--------|-------------|----------|
| Short looped graph + LFO | Built graph with slow breathing; deterministic | ✓ |
| Generative events over a bed | Randomized creaks/gusts/drips | |

**User's choice:** Short looped graph + LFO
**Notes:** Deterministic, no sample seams, testable.

| Option | Description | Selected |
|--------|-------------|----------|
| Fade out when hidden | `visibilitychange` fades, resumes unless muted | ✓ |
| Keep playing | Only mute silences | |

**User's choice:** Fade out when hidden

---

## Boot & autoplay unlock

| Option | Description | Selected |
|--------|-------------|----------|
| Start on gate keypress | One gesture unlocks; ambience already playing on entry | ✓ |
| Unlock at gate, fade in after entry | Breath of silence before the room settles | |
| Attempt autoplay, fallback on gesture | Inconsistent across browsers | |

**User's choice:** Start on gate keypress
**Notes:** Gate's existing `keyboard.once('keydown')` is the unlock point.

| Option | Description | Selected |
|--------|-------------|----------|
| Silent unlock | No gate SFX | |
| Soft switch click | One mechanical click, then ambience | ✓ |

**User's choice:** Soft switch click

---

## Mute control

| Option | Description | Selected |
|--------|-------------|----------|
| DOM button on the frame | Accessible `<button>`, focusable, screen-reader labeled | ✓ |
| Phaser-drawn button | Pixel-perfect UI-camera button, canvas-only | |

**User's choice:** DOM button on the frame
**Notes:** Accessibility not traded for pixel fit.

| Option | Description | Selected |
|--------|-------------|----------|
| Always active | Exploring, typing, glide, overlay, gate | ✓ |
| Only while exploring | Ignored during dialog/overlay | |

**User's choice:** Always active

| Option | Description | Selected |
|--------|-------------|----------|
| Text label | SOUND ON / MUTED monospace label | |
| Pixel icon | Speaker glyph swapping to speaker-with-slash; SR-only label | ✓ |

**User's choice:** Pixel icon

| Option | Description | Selected |
|--------|-------------|----------|
| Visible from the gate | Muted visitor can unmute before the click | ✓ |
| Only in the house | Gate stays single-purpose | |

**User's choice:** Visible from the gate

| Option | Description | Selected |
|--------|-------------|----------|
| Top-right | Conventional HUD corner | ✓ |
| Top-left | Busier next to the top wall | |
| Bottom-right | Near the dialog box edge | |

**User's choice:** Top-right

---

## Trigger moments

| Option | Description | Selected |
|--------|-------------|----------|
| Two surfaces by room | Wood living/office, carpet bedroom via new `surface` field; ~24 px cadence | ✓ |
| Single footstep sound | One timbre everywhere | |
| Per-pixel surface blend | Continuous floor-pixel crossfade | |

**User's choice:** Two surfaces by room
**Notes:** Honors PLAN.md's wood/carpet spec.

| Option | Description | Selected |
|--------|-------------|----------|
| Proximity loop | Static gain follows distance to TV | ✓ |
| One-shot on WATCH | Hiss only on interaction | |
| Bed + burst | Proximity bed plus louder WATCH burst | |

**User's choice:** Proximity loop
**Notes:** Matches PLAN.md's "TV static plays near TV".

| Option | Description | Selected |
|--------|-------------|----------|
| Real light toggle | E flips warm pool + flicker with click; resets ON on reload | ✓ |
| Toggle + state-aware dialog | Also rewrites lamp lines by state | |
| SFX only | Light stays on; click only | |

**User's choice:** Real light toggle
**Notes:** Completes Phase 4 D-13; supersedes D-09 for the lamp only.

| Option | Description | Selected |
|--------|-------------|----------|
| Typewriter blips | Quiet ticks every few revealed chars | ✓ |
| Single open blip | One tick on box open | |
| Skip dialog audio | No dialog sound | |

**User's choice:** Typewriter blips
**Notes:** In PLAN.md but not AUD-02; user opted to include.

| Option | Description | Selected |
|--------|-------------|----------|
| One-shot ring | Short ring decaying under dialog | ✓ |
| Ring while overlay open | Loop tied to Contact panel lifecycle | |
| Short trill | Brief single trill | |

**User's choice:** One-shot ring

---

## the agent's Discretion

- Synthesis graphs, envelopes, voice counts; exact cadence px, falloff radii, blip rate/pitch; ambient target gains within 30%.
- Master gain staging / clipping protection; engine file layout; DOM-to-engine wiring.
- TDD-lite split: mute persistence, cadence, surface selection, room→ambient gain mapping as pure modules; audible behavior browser-verified.

## Deferred Ideas

- Distance-based wind gain.
- Ringing while the Contact overlay is open.
- Generative creaks/drips over the ambient bed.
- Per-pixel surface blending for footsteps.
- State-aware lamp dialog.
- Ambience ducking under the open CRT overlay.
- Volume slider / settings UI — Out of Scope.
