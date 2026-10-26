# Phase 3: Interaction - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-22
**Phase:** 3-interaction
**Areas discussed:** Dialog → overlay flow, Overlay content source, Revisit variants, Prompt & input lock, Reaching through furniture, Overlay variant scope, First-time discoverability, Dialog box look

---

## Dialog → overlay flow

| Option | Description | Selected |
|--------|-------------|----------|
| Dialog, then auto-overlay | E starts typewriter; overlay slides up automatically when text finishes | ✓ |
| Dialog, then E again | Second E press opens the overlay (player-paced) | |
| Overlay directly | No dialog for overlay objects | |

**User's choice:** Dialog, then auto-overlay
**Notes:** One continuous beat, one keypress.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-type, E skips | Steady typing, E jumps to full text | ✓ |
| Auto-type only | No interruption possible | |
| E-driven chunks | Player reveals text per press | |

**User's choice:** Auto-type, E skips

---

| Option | Description | Selected |
|--------|-------------|----------|
| Three hosts only | Computer, Bookshelf, Phone (matches D-16) | |
| Add TV + lamp dialog | Five interactables; TV/lamp dialog-only | ✓ |

**User's choice:** Add TV + lamp dialog
**Notes:** Scope extension requested by user — two Living Room flavor objects with no overlays.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Stay until E/Esc | Box waits for keypress | |
| Auto-dismiss after pause | ~1.5 s then slides away | ✓ |
| Any movement key closes | Movement dismisses the box | |

**User's choice:** Auto-dismiss after pause
**Notes:** Follow-up decision: blinking ▼/… end cue during the pause.

---

| Option | Description | Selected |
|--------|-------------|----------|
| One screen only | Copy fits one box (~2–3 lines), no pagination | ✓ |
| Paginated chunks | Long text pages via E | |

**User's choice:** One screen only

---

| Option | Description | Selected |
|--------|-------------|----------|
| Speaker tag | `[TV]` / `[COMPUTER]` header | ✓ |
| No label | Just the text | |

**User's choice:** Speaker tag

---

| Option | Description | Selected |
|--------|-------------|----------|
| Slide in/out | Bottom-edge slide, matches overlay language | ✓ |
| Instant pop | Hard terminal cut | |

**User's choice:** Slide in/out

---

## Overlay content source

| Option | Description | Selected |
|--------|-------------|----------|
| Placeholder Astro routes | Create projects/skills/contact.astro with stubs; Phase 6 swaps content | ✓ |
| Overlay-only stub markup | No routes until Phase 6 | |
| Real content now | Hand-write real content (duplicates Phase 6) | |

**User's choice:** Placeholder Astro routes

---

| Option | Description | Selected |
|--------|-------------|----------|
| Link between pages | In-overlay navigation between the three pages | |
| One page per object | Close and walk — the house is the navigation | ✓ |

**User's choice:** One page per object

---

| Option | Description | Selected |
|--------|-------------|----------|
| Realistic stand-ins | ~3 projects, ~10 skills, contact links | ✓ |
| Skeleton only | Headings + one line | |

**User's choice:** Realistic stand-ins

---

| Option | Description | Selected |
|--------|-------------|----------|
| Full-frame cover | Overlay fills the frame | |
| Partial cover | Strip of dark room stays visible | ✓ |

**User's choice:** Partial cover
**Notes:** Atmosphere first; exact cover height left to planner geometry.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Subtle CRT | Darkwood frame, faint scanlines, amber/green tint | ✓ |
| Heavy retro | Strong phosphor terminal treatment | |
| No CRT effect | Plain dark page | |

**User's choice:** Subtle CRT

---

| Option | Description | Selected |
|--------|-------------|----------|
| Internal scroll | Wheel / arrows scroll inside the overlay; E/Esc close | ✓ |
| Fit, no scroll | Copy must fit exactly | |

**User's choice:** Internal scroll

---

## Revisit variants

| Option | Description | Selected |
|--------|-------------|----------|
| Two, alternating | A→B→A→B | |
| Three+, cycling | A→B→C→A per object | ✓ |
| Random from pool | Unpredictable selection | |

**User's choice:** Three+, cycling

---

| Option | Description | Selected |
|--------|-------------|----------|
| In-memory | Resets on reload; Phase 5 owns localStorage | ✓ |
| localStorage | Survives reloads | |

**User's choice:** In-memory

---

| Option | Description | Selected |
|--------|-------------|----------|
| Same overlay | Only dialog differs | |
| Overlay changes too | Overlay has its own variant pool | ✓ |

**User's choice:** Overlay changes too
**Notes:** Follow-up pinned it down: full variant pool (later scoped to copy-only rotation), not a meta flourish.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Same flow | Dialog (next variant) → auto-overlay every visit | ✓ |
| Skip dialog after 1st | Revisit E goes straight to overlay | |

**User's choice:** Same flow

---

| Option | Description | Selected |
|--------|-------------|----------|
| Meta flourish | Header wink only, body unchanged | |
| Full variant pool | Overlay cycles variants like dialog | ✓ |

**User's choice:** Full variant pool

---

| Option | Description | Selected |
|--------|-------------|----------|
| Synced | Visit N = dialog variant N = overlay variant N | ✓ |
| Independent counters | Dialog and overlay advance separately | |

**User's choice:** Synced

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, all five | TV and lamp cycle dialog variants too | ✓ |
| Hosts only | TV/lamp repeat first text | |

**User's choice:** Yes, all five

---

| Option | Description | Selected |
|--------|-------------|----------|
| On E press | Counter advances when interaction fires | ✓ |
| On overlay close | Counter advances when overlay closes | |

**User's choice:** On E press

---

| Option | Description | Selected |
|--------|-------------|----------|
| Agent drafts | Agent writes all copy in the fourth-wall tone as data | ✓ |
| You write it | User supplies text up front | |

**User's choice:** Agent drafts
**Notes:** User reviews and swaps wording freely during UAT.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Atomic on E | Variant spent the moment E fires | ✓ |
| Replay if interrupted | Re-show if dialog never finished | |

**User's choice:** Atomic on E

---

## Prompt & input lock

| Option | Description | Selected |
|--------|-------------|----------|
| Radial, any facing | Circle around object, no facing bookkeeping | ✓ |
| Must face object | Facing required | |
| Rect zone per object | DoorDef-style rectangular zones | |

**User's choice:** Radial, any facing
**Notes:** Radius later pinned to 2 tiles, generous.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Float over object | World-anchored label above the object | ✓ |
| Fixed HUD corner | Screen-corner hint | |
| Highlight only | Visual pulse, no words | |

**User's choice:** Float over object

---

| Option | Description | Selected |
|--------|-------------|----------|
| Lock movement | Velocity zeroed while box open; doors blocked too | ✓ |
| Free movement | Player keeps walking during dialog | |

**User's choice:** Lock movement

---

| Option | Description | Selected |
|--------|-------------|----------|
| Block input, keep rendering | Input dead, scene still draws behind strip | ✓ |
| Full pause | Physics + update halted | |

**User's choice:** Block input, keep rendering
**Notes:** Phases 4/5 lighting/audio stay alive behind the overlay for free.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Per-object verb | Boot up / Browse / Answer / Watch / Toggle | ✓ |
| Generic 'Examine' | One label for all | |

**User's choice:** Per-object verb

---

| Option | Description | Selected |
|--------|-------------|----------|
| Same as E — skip | Esc skips typewriter like E | ✓ |
| Esc aborts dialog | Esc closes the box outright | |
| Esc ignored | Only E skips before overlay exists | |

**User's choice:** Same as E — skip

---

| Option | Description | Selected |
|--------|-------------|----------|
| Nearest only | Closest in-range object wins | ✓ |
| All show, facing wins | Multiple prompts, facing decides | |

**User's choice:** Nearest only

---

| Option | Description | Selected |
|--------|-------------|----------|
| 2 tiles, generous | ~32 px from object center | ✓ |
| 1–1.5 tiles, tight | Must stand right at the object | |

**User's choice:** 2 tiles, generous

---

| Option | Description | Selected |
|--------|-------------|----------|
| E ignored while gliding | Input stays locked during room transition | ✓ |
| Queue for after glide | Fire the press when glide lands | |

**User's choice:** E ignored while gliding

---

| Option | Description | Selected |
|--------|-------------|----------|
| Hide while active | Prompt hides while its dialog/overlay is open | ✓ |
| Keep showing | Badge stays visible | |

**User's choice:** Hide while active

---

| Option | Description | Selected |
|--------|-------------|----------|
| Amber badge | #FFA500 key badge, dark plate, light text, 2 px frame | ✓ |
| Cold-blue badge | #6B8FBF screen-family accent | |
| Text only | No plate | |

**User's choice:** Amber badge

---

| Option | Description | Selected |
|--------|-------------|----------|
| Blink cue | Blinking ▼ / … during auto-dismiss pause | ✓ |
| No cue | Box just leaves | |

**User's choice:** Blink cue

---

| Option | Description | Selected |
|--------|-------------|----------|
| Ignore during slide | Keys dead until slide-up completes | ✓ |
| Cancel mid-slide | E reverses the opening animation | |

**User's choice:** Ignore during slide

---

| Option | Description | Selected |
|--------|-------------|----------|
| Wide bottom bar | Spans most of the frame width | |
| Narrow centered box | ~70 % width, speech-bubble feel | ✓ |

**User's choice:** Narrow centered box

---

## Reaching through furniture

| Option | Description | Selected |
|--------|-------------|----------|
| Distance only | Plain radius, reaches through solids | |
| Blocked by solids | Line-of-sight raycast | |
| Distance + room check | Radius + same-`currentRoom` guard | ✓ |

**User's choice:** Distance + room check
**Notes:** Reuses Phase 2's `currentRoom` (D-11); avoids desk-blocking the computer without raycasting.

---

## Overlay variant scope

| Option | Description | Selected |
|--------|-------------|----------|
| Copy rotates | Same layout, copy/asides rotate with the dialog | ✓ |
| Copy + layout shuffle | Sections reorder per visit | |
| Headline only | One line varies | |

**User's choice:** Copy rotates

---

| Option | Description | Selected |
|--------|-------------|----------|
| Independent per object | Each object has its own pool + counter | ✓ |
| Global counter | All overlays advance together | |

**User's choice:** Independent per object
**Notes:** Consistent with D-18 sync — sync is per object, not across objects.

---

## First-time discoverability

| Option | Description | Selected |
|--------|-------------|----------|
| Badge only | The floating verb badge is the whole onboarding | ✓ |
| Emphasized first time | Badge pulses/holds longer on first encounter | |
| One-time hint line | Dialog-style hint shown once after the gate | |

**User's choice:** Badge only

---

## Dialog box look

| Option | Description | Selected |
|--------|-------------|----------|
| CRT family | Box matches the overlay's scanline look | |
| Darkwood paper | Warm brown plate, plain text — house speaks | ✓ |
| Heavy terminal | Loud phosphor treatment | |

**User's choice:** Darkwood paper
**Notes:** Deliberate two-language split — world UI (house) vs screen UI (CRT overlay).

---

## The agent's Discretion

- Exact radius/geometry values (2 tiles, ~70 % box width, cover height are intents), typewriter speed, auto-dismiss duration, easing/durations.
- Interaction-state architecture and data-registry shape (Phase 2 `DOORS` precedent suggested, not mandated).
- Stub content wording within the realistic-stand-ins depth and the fourth-wall tone.
- Where Phaser vs DOM responsibilities split for the partial-cover overlay.

## Deferred Ideas

- Lamp light toggling (E flips the lamp on/off — feeds LITE-02 and gives AUD-02's "lamp toggle" SFX a real trigger).
- In-overlay cross navigation (Projects ↔ Skills ↔ Contact links) — considered, rejected.
- Mouse/click interaction on objects — INTR-01 specifies the E key.
- One-time onboarding hint line — considered, rejected; revisit with Phase 8 title screen if UAT shows visitors never press E.
