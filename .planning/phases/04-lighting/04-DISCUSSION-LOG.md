# Phase 4: Lighting - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-11-04
**Phase:** 4-lighting
**Areas discussed:** Darkness & sightlines, Light source behavior, Flicker character, UI under lighting, Veil depth vs near-black, Light through door gaps, Performance tradeoffs

---

## Darkness & sightlines

| Question | Options presented | Selected |
|----------|-------------------|----------|
| What stays faintly visible beyond the light pools? | Glow through doorways / Tunnel vision / Whole-house faint | Glow through doorways |
| How should the unlit 70% read between pools? | Even dim veil / Near-black floor / Corner vignette | Even dim veil |
| Does the veil apply to every room at once? | Your room only / World-wide veil / Blend on entry | Your room only |
| Should light pools be cut off by walls or bleed through? | Pools stop at walls / Pools bleed through / Strong sources only | Pools stop at walls |
| Does the player's torch obey the same wall rule? | Same rule — stops at walls / Torch passes through | Same rule — stops at walls |
| What happens to the yard/exterior notch? | Same veil as your room / Yard goes near-black | Same veil as your room |
| When should the veil switch rooms during a door glide? | Short fade on crossing / Instant swap at wall line / Swap when glide ends | Short fade on crossing |
| How should a light pool's edge fall off? | Soft 2-step falloff / Hard-edged circle / Smooth gradient | Soft 2-step falloff |
| Can furniture silhouettes be read outside any pool? | Silhouettes stay readable / Pure darkness / Only near the player | Only near the player |
| How does the silhouette ring relate to the 4-tile torch? | Inside the torch footprint / Tighter ~2-tile ring / Ring wider than the torch | Inside the torch footprint |
| Is the torch a plain circle or shaped by movement/facing? | Uniform circle / Facing-weighted / Bob while walking | Facing-weighted |

**User's choice:** as marked above
**Notes:** user revisited "silhouettes readable" — first picked the player-local ring, then scoped it to the torch footprint so one radius governs both glow and readability.

---

## Light source behavior

| Question | Options presented | Selected |
|----------|-------------------|----------|
| Should every light source glow all the time? | Always on / Proximity-gated / Mixed on/off | Free text: "mixed of 1 and 3. I would like the glow but also the option to turn on and turn off the lights" |
| Lamp toggling is beyond LITE-01..03 — how to handle? | Defer toggle to Phase 5 / Fold toggling into Phase 4 / Render now, leave the seam | Defer toggle to Phase 5 |
| How big are pools vs the 4-tile torch? | Hierarchy: lamps big / Uniform 4 tiles / Lamps only, screens tint | Hierarchy: lamps big |
| Do pools recolor objects or just brighten? | Tint what's inside / Brighten + colored rim / Flat color wash | Tint what's inside |
| Does the source object stay full-bright? | Source stays bright / Source dims too | Source stays bright |

**User's choice:** as marked above
**Notes:** user's initial wish for on/off control was recognized as the Phase 3 deferred lamp-toggle idea; after the scope flag, user chose deferral to Phase 5.

---

## Flicker character

| Question | Options presented | Selected |
|----------|-------------------|----------|
| Which lamps should flicker? | All three lamps / Living Room only / All, varying strength | All three lamps |
| What flicker rhythm reads as subtle but visible? | Irregular steps / Steady pulse / Occasional dip | Irregular steps |
| What does the flicker actually animate? | Brightness only / Brightness + radius / Brightness + bulb tint | Brightness only |
| Should anything besides lamps shimmer? | Lamps only / Lamps + faint screen shimmer / Everything flickers | Lamps + faint screen shimmer |
| How fast should flicker steps run? | Slow old-bulb / Fast electric buzz / Slow with rare stutters | Slow old-bulb |
| Should the three lamps flicker independently or in sync? | Independent per lamp / Synced per room / House-wide sync | Independent per lamp |
| How should screen shimmer differ from lamp flicker? | Gentle subordinate wobble / Same steps lower amp / TV livelier than PC | Gentle subordinate wobble |

**User's choice:** as marked above
**Notes:** screen shimmer is a slight extension within LITE-02's "render with their respective colors" — flagged and accepted during discussion.

---

## UI under lighting

| Question | Options presented | Selected |
|----------|-------------------|----------|
| Should dialog box and CRT overlay stay full-bright? | UI always full-bright / UI dims slightly / World dims behind overlay | UI always full-bright |
| Does darkness touch the world-anchored E-badge? | Badge always full-bright / Badge dims with veil / Badge glows | Badge always full-bright |
| What does lighting do while dialog/overlay is open? | Runs untouched / Extra dim while UI open / Overlay washes the strip | Runs untouched |
| Does lighting apply to the boot gate? | House only / Gate starts dark | House only |

**User's choice:** as marked above

---

## Veil depth vs near-black (follow-up)

| Question | Options presented | Selected |
|----------|-------------------|----------|
| Where should the unlit baseline actually sit? | Flat 30% veil / Floor darker than furniture / Darker overall (~20%) | Flat 30% veil |

**User's choice:** Flat 30% veil
**Notes:** resolves the LITE-01 (70% dark) vs SC#5 (near-black) tension — dark palette at 30% reads near-black-ish.

---

## Light through door gaps (follow-up)

| Question | Options presented | Selected |
|----------|-------------------|----------|
| Does light travel through the doorway opening itself? | Light passes through gaps / Room-boundary clip / Torch only spills | Light passes through gaps |

**User's choice:** Light passes through gaps
**Notes:** occlusion follows wall geometry only — gaps are not walls, so spill is the natural outcome of D-03.

---

## Performance tradeoffs (follow-up)

| Question | Options presented | Selected |
|----------|-------------------|----------|
| If lighting threatens the 60 fps target, what gives first? | Glow quality gives first / Animation gives first / Accept a frame dip | Glow quality gives first |

**User's choice:** Glow quality gives first

---

## Scope conflict raised by the agent

| Question | Options presented | Selected |
|----------|-------------------|----------|
| Our decisions contradict PLAN.md §Phase 4's radii/toggle test/flicker scope — which wins? | Context wins / Keep PLAN radii / Edit PLAN.md first | Context wins |

**User's choice:** Context wins (CONTEXT.md records the override as D-20; PLAN.md left unedited)

---

## the agent's Discretion

- Exact pool radii within the agreed hierarchy, veil fade duration, falloff step widths, facing-weight bias, flicker step sizes/seeded patterns, screen-wobble amplitude.
- Lighting technique and code layout (PLAN.md suggests `src/game/systems/Lighting.ts` + `src/game/objects/Light.ts` — planner's choice), TDD-lite module split.

## Deferred Ideas

- Lamp on/off toggling → Phase 5 (user decision; AUD-02 SFX trigger's home).
- Badge as a light source (amber pool on the marked object).
- Gate screen starts dark → revisit with Phase 8 title screen.
- House-wide synced flicker as a deliberate "supernatural event" beat.
