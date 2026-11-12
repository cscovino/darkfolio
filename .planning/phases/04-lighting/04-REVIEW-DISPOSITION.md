---
phase: 04
review: 04-REVIEW.md
titles: json
findings:
  - id: WR-01
    severity: warning
    disposition: fixed
    title: "seamStripAlpha ignores current — lighter idle band across dark rooms and a one-frame brightness snap at every glide end"
  - id: IN-01
    severity: info
    disposition: open
    title: "Necessity — the adjacent-to-neither gliding-room branch is unreachable with today's room graph"
  - id: IN-02
    severity: info
    disposition: open
    title: "Carried (prior WR-02) — bakePool's null-guard returns a texture key that does not exist"
  - id: IN-03
    severity: info
    disposition: open
    title: "Carried (prior IN-03) — nearest-point cull plus the new apex makes shadow polygons reach farther past the frame"
  - id: IN-04
    severity: info
    disposition: open
    title: "Carried (prior IN-02/IN-04) — hashSeed placement and fade-hold-until-crossing notes still accurate"
---

# Phase 04 — Review Disposition

> One row per finding in `04-REVIEW.md` (re-reviewed 2026-11-09 after the seam/shadow gap closure
> landed). Default disposition is `open`; a row is only `fixed`/`deferred`/`rejected` once someone
> records why.

| ID | Severity | Finding | Disposition | Action |
|----|----------|---------|-------------|--------|
| WR-01 | warning | `seamStripAlpha` returns the literal `VEIL_ALPHA` on its idle and adjacent-to-neither branches, so a shared band can read lighter than both rooms around it, and a crossed strip snaps back at glide end | fixed | User chose "fix now" before the phase verdict; idle and adjacent-to-neither now take `min(veilAlphaFor(current, rooms[]))`, matching D-04's "rides the current room's level" — two test pins updated (RED first), full gate green |
| IN-01 | info | The "adjacent to neither gliding room" branch cannot fire with the current door graph (both strips contain `living`) | open | Kept deliberately by the plan; carries the same wrong literal as WR-01 |
| IN-02 | info | `bakePool` returns a nonexistent texture key when `addDynamicTexture` yields null (`__MISSING` magenta) | open | Carried from the prior review unchanged; Phaser-texture-creation failure path |
| IN-03 | info | Nearest-point cull + bisector apex bake quads reaching ~`dmax + 2r + 64` past the frame | open | Carried; harmless (bake-once, clipped), probe-covered |
| IN-04 | info | `hashSeed` runs in the constructor; fade holds until crossing / `beginFade` only on glides | open | Carried; both remain accurate descriptions of intended behavior |

**Counts:** 0 critical · 1 warning · 4 info · 5 total.
