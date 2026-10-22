# Phase 2: Multi-Room - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-20
**Phase:** 2-multi-room
**Areas discussed:** Door topology & gap geometry, Transition feel, Office & Bedroom contents, Entry spawn placement, L-notch void, Tilemaps vs code rects, Room-state tracking

---

## Door topology & gap geometry

| Option | Description | Selected |
|--------|-------------|----------|
| Match roadmap: north→Office, west→Bedroom | Cut new north gap, rewire west gap, east gap repurposed; SC#2-4 stay literally true | ✓ |
| Keep built: west→Office, east→Bedroom | Preserve Phase 1 geometry, amend ROADMAP/PLAN | |

| Option | Description | Selected |
|--------|-------------|----------|
| 3-tile gaps everywhere | 48 px gap, 8 px slack per side; fixes the W-2 zero-clearance blocker | ✓ |
| 2-tile gaps, shrink body to 24 px | Keep classic proportions, inset physics body | |
| Keep 2-tile zero-clearance | Retro precision; revisit only if triggers prove flaky | |

| Option | Description | Selected |
|--------|-------------|----------|
| Center door, move furniture aside | North gap centered, TV cluster relocated for a clear lane | |
| Offset the door, keep furniture | Gap left of the TV; built rects untouched | ✓ |
| Narrow lane accepted | Door and TV both centered; tight entry as vibe | |

| Option | Description | Selected |
|--------|-------------|----------|
| Open gap + frame accent | Walkable gap, 2 px frame + brighter threshold (D-09/D-11 style) | ✓ |
| Closed-door placeholders | Panel + knob rects with open logic Phase 7 will discard | |
| Plain threshold, no frame | Phase 1 styling unchanged | |

| Option | Description | Selected |
|--------|-------------|----------|
| Auto on step-in | Overlap zone fires immediately | partial |
| Dwell in threshold | 0.3 s standstill required | |
| Press E at door | Reuse Phase 3 idiom | |
| Bump + press-to-open hybrid | Free-text answer: "like darkwood could open with a key but also if the player run will open the door like a hit" — confirmed as overlap auto-fire + direction-key try-the-handle | ✓ |
| Closed doors, key-only | Panel stays closed; adjacent keypress opens | offered, not chosen |

| Option | Description | Selected |
|--------|-------------|----------|
| Wall it up | Fill the now-unused east gap | |
| Sealed decorative door | Boarded-shut planks rect, atmosphere, no traversal | ✓ |
| Leave open | Confusing gap to nowhere | |

| Option | Description | Selected |
|--------|-------------|----------|
| One door each | Office south, Bedroom east — dead-end rooms per SC#4 | ✓ |
| One working + one sealed each | More decorative doors for atmosphere | |
| Connect all three rooms | Office↔Bedroom door; contradicts SC#2-4 | |

| Option | Description | Selected |
|--------|-------------|----------|
| Adjacent rooms, seamless pan | L-shaped continuous world; camera literally slides across shared walls | ✓ |
| Separate scenes, stylized transition | Per-scene bounds + effect-based room change | |

**Notes:** The topology choice resolved a Phase 1/roadmap conflict (D-02 built west/east gaps vs ROADMAP north/west doors). Continuous-world decision (D-09) re-frames several later answers.

---

## Transition feel

| Option | Description | Selected |
|--------|-------------|----------|
| Short auto-glide through the door | Input locks, camera eases player through threshold (~0.4-0.8 s), unlocks far side | ✓ |
| Plain walk-through, no effect | Doors are just gaps; no ceremony | |
| Fade-through-black | Dramatic vignette; fights continuous-world decision | |

| Option | Description | Selected |
|--------|-------------|----------|
| Carry your direction | Glide continues along entry vector, stops a few tiles inside | ✓ |
| Fixed endpoint | Glide always ends at one camera position | |

| Option | Description | Selected |
|--------|-------------|----------|
| Match the floaty mood | ~0.6-0.8 s ease-in-out, same lethargy as D-06 follow-cam | ✓ |
| Snappy arcade glide | ~0.3 s brisk | |

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, visible through doorway | Neighbor room glimpsible before crossing; rooms read interesting from their door | ✓ |
| Covered doorway | Curtains/blinds until crossing | |

**Notes:** With one continuous world, "slide transition" became "auto-glide across the shared wall" — no scene cut.

---

## Office & Bedroom contents

| Option | Description | Selected |
|--------|-------------|----------|
| Office: computer+bookshelf, Bedroom: phone | Work room hosts Projects+Skills objects; phone is the bedside gag | ✓ |
| Office: computer, Bedroom: bookshelf+phone | Study/work split across rooms | |
| Spread across 3 rooms | Bookshelf in Living Room | |

| Option | Description | Selected |
|--------|-------------|----------|
| Lean 5-body set | D-01-style minimalism | |
| Dense study | Desk+chair+computer, bookshelf, filing cabinet, lamp, plants, typewriter, rug | ✓ |
| Bare minimum 2 bodies | Nearly empty until Phase 7 | |

| Option | Description | Selected |
|--------|-------------|----------|
| Recommended mid set | Bed, nightstand+phone, wardrobe, rug, plant | |
| Dense bedroom too | Add dresser, mirror, floor lamp, book pile | ✓ |
| Sparse | Eerie just-left minimalism | |

| Option | Description | Selected |
|--------|-------------|----------|
| Per-room color temperature | Living=warm browns, Office=muted greens/greys, Bedroom=deep browns/near-black + lamp pop | ✓ |
| Uniform across house | Furniture silhouettes only | |
| Shared tones, distinct patterns | Per-room floor patterns | |

| Option | Description | Selected |
|--------|-------------|----------|
| Clear lane from each door | ~2-tile walking lane before clutter | ✓ |
| Clutter can touch the door | Maze-y lived-in feel, snag risk | |

**Notes:** Dense rooms promote the Phase 1 deferred idea ("dense furniture if rooms feel empty").

---

## Entry spawn placement

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed rest 2 tiles past door | Deterministic landing on door axis, facing travel direction | ✓ |
| Pure carry-through, no snap | Momentum-only; risk of resting in the wall line | |

| Option | Description | Selected |
|--------|-------------|----------|
| Locked front door at spawn | Boarded front-door rect on Living Room bottom wall behind the spawn | ✓ |
| Plain wall for now | Wait for Phase 7/8 art | |

---

## L-notch void (follow-up gray area)

| Option | Description | Selected |
|--------|-------------|----------|
| Per-room camera clamp | Viewport never leaves a room's frame | |
| Exterior dressing in the notch | Dirt/grass + fence visible past corners | ✓ |
| Embrace the dark void | Black = ominous, risk of bug-read | |

| Option | Description | Selected |
|--------|-------------|----------|
| Just ground tone | Dirt/grass rects only | |
| Ground + silhouette props | Dead shrub + fence posts, non-walkable | ✓ |
| Walkable exterior strip | Expands play space beyond SC scope | |

---

## Tilemaps vs code rects (follow-up gray area)

| Option | Description | Selected |
|--------|-------------|----------|
| Code rects, defer tilemaps to Phase 7 | Keep Phase 1 pattern; override PLAN.md instruction | ✓ |
| Adopt Tiled now | .tmj pipeline, Tiled editor dependency | |
| JSON layout data, no tile renderer | External data, code placement | |

**Notes:** PLAN.md §Phase 2 said "create tilemaps for all 3 rooms (JSON)"; user consciously re-defers to Phase 7 (recorded as D-10).

---

## "Which room am I in" tracking (follow-up gray area)

| Option | Description | Selected |
|--------|-------------|----------|
| Room zones + currentRoom state | First-class value for Phases 3-5 | ✓ |
| Leave it to later phases | Each phase re-derives coordinate math | |

---

## The agent's Discretion

- Exact world coordinate placement of the L-shape in positive space
- Scene architecture (one world vs three logical scenes sharing it) as long as currentRoom stays first-class
- Threshold zone shapes, glide mechanism, door frame pixel details, exterior prop placement, camera clamp math
- StaticGroup organization per room

## Deferred Ideas

- Tilemap pipeline → Phase 7 (with real tile art)
- Front door functional / exterior walkable → only if a future milestone wants "leave the house"
- Door open/close animation on sealed doors → Phase 7 art territory
- Walk-bob during glide → stays parked with Phase 7
