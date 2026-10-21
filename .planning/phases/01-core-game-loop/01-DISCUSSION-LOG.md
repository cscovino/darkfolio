# Phase 1: Core Game Loop - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-19
**Phase:** 1-Core Game Loop
**Areas discussed:** Living Room layout, Camera zoom & feel, Placeholder look, Landing page framing

---

## Living Room layout

| Option | Description | Selected |
|--------|-------------|----------|
| TV + couch + lamp + table | Phase 3 interactable set as collision-only obstacles; rug walkable | ✓ |
| Sparse (TV + couch) | Fewer collision shapes to tune, more walking space | |
| Dense (add shelf, plants) | Bookshelf + potted plants as pure collision props | |

**User's choice:** TV + couch + lamp + table

| Option | Description | Selected |
|--------|-------------|----------|
| Left + right walls | Living Room is middle room — Office door left, Bedroom door right | ✓ |
| Top wall pair | Both doors on top wall; bottom wall clean for spawn | |
| Single door for now | One gap in Phase 1, second when Phase 2 builds transitions | |

**User's choice:** Left + right walls

| Option | Description | Selected |
|--------|-------------|----------|
| Bottom-center | Spawn bottom-center facing up — "walked in" feel | ✓ |
| At left door | Player "entered from the Office" | |
| Room center | Center of floor, camera pre-framed | |

**User's choice:** Bottom-center

| Option | Description | Selected |
|--------|-------------|----------|
| Plain rectangle | Four solid 1-tile walls, doors cut in — simplest collision | ✓ |
| Interior partitions | Furniture-defined nooks, more tuning | |

**User's choice:** Plain rectangle

---

## Camera zoom & feel

| Option | Description | Selected |
|--------|-------------|----------|
| Half-room viewport | ~160×120 world px visible, integer zoom, camera pans both axes — SC#4 obviously observable | ✓ |
| Full-width, vertical pan | Whole room width visible; horizontal follow deferred to Phase 2's wider house | |
| Whole-room framing | Camera barely moves until Phase 2 | |

**User's choice:** Half-room viewport
**Notes:** Room is 320×240 world px — at 1× zoom the camera could never move, so zoom-in framing was required for lerp follow to be real.

| Option | Description | Selected |
|--------|-------------|----------|
| Medium follow | Lerp ≈0.1, settles in ~half a second | |
| Floaty trail | ≈0.05, camera trails noticeably — dreamy dark-house vibe | ✓ |
| Snappy | ≈0.2, near-instant but still lerped | |

**User's choice:** Floaty trail

| Option | Description | Selected |
|--------|-------------|----------|
| Centered | Player dead-center, simplest and predictable | ✓ |
| Lead the facing | Camera sits ahead of movement direction — needs facing tracking | |

**User's choice:** Centered

---

## Placeholder look

| Option | Description | Selected |
|--------|-------------|----------|
| Square + facing notch | 32×32 square with lighter face notch flipping toward movement direction | ✓ |
| Flat square | Plain solid square, no facing cue (literal PLAN.md wording) | |
| Square + walk bob | Adds squash/bob tween while moving | |

**User's choice:** Square + facing notch

| Option | Description | Selected |
|--------|-------------|----------|
| Darkwood palette rects | Walls/furniture in PROJECT.md palette; TV cold-blue, lamp warm-yellow accents | ✓ |
| Gray boxes | Literal placeholder gray, maximum honesty | |

**User's choice:** Darkwood palette rects

| Option | Description | Selected |
|--------|-------------|----------|
| Checkerboard floor | Two alternating brown 16×16 tones — motion legible | ✓ |
| Flat floor | Single color, cleaner but motion harder to perceive | |

**User's choice:** Checkerboard floor

| Option | Description | Selected |
|--------|-------------|----------|
| Marked thresholds | Lighter frame/threshold rect at reserved door gaps | ✓ |
| Bare gaps | Plain wall gap; Phase 2 styles doors when they work | |

**User's choice:** Marked thresholds

---

## Landing page framing

| Option | Description | Selected |
|--------|-------------|----------|
| Fullscreen bleed | Canvas fills viewport edge-to-edge | |
| Centered fixed box | Fixed-size canvas centered on dark page — framed-CRT look | ✓ |

**User's choice:** Centered fixed box
**Notes:** Deliberate retro "CRT screen on a dark wall" framing, previewing Phase 3's CRT-overlay aesthetic.

| Option | Description | Selected |
|--------|-------------|----------|
| Show more world | Fixed world px scale; resize reveals more room | |
| Constant framing | FIT + integer zoom — ~half-room visible at every window size | ✓ |
| You decide | Planner/researcher picks cleaner ScaleManager setup | |

**User's choice:** Constant framing

| Option | Description | Selected |
|--------|-------------|----------|
| Play instantly | Boot → immediately walkable Living Room | |
| Press-key gate | Boot → minimal "press any key" black screen → play; formal TitleScene stays Phase 8 | ✓ |

**User's choice:** Press-key gate

---

## The agent's Discretion

- Exact base resolution + integer zoom yielding the half-room viewport in the fixed box (640×480 @ 4× suggested).
- Tile coordinates for furniture, camera-bounds clamping method, deadzone implementation, Graphics-vs-texture placeholder generation, gate scene placement/naming.

## Deferred Ideas

- Dense furniture (bookshelf, plants) — promote if Phase 2 rooms feel empty.
- Walk-bob animation on placeholder — revisit with Phase 7 sprites.
- Formal title screen — stays Phase 8; press-key gate is its placeholder.
- Fullscreen-bleed framing — rejected; reversal is a layout-only edit.
