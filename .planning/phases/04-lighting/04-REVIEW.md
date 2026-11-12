---
phase: 04-lighting
reviewed: 2026-11-09T16:20:00Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - src/game/systems/lighting.ts
  - src/game/systems/lighting.test.ts
  - src/game/objects/Light.ts
  - src/game/data/lights.ts
  - src/game/data/rooms.ts
  - src/game/data/rooms.test.ts
  - src/game/systems/lightFlicker.ts
  - src/game/scenes/LivingRoomScene.ts
findings:
  critical: 0
  warning: 1
  info: 4
  total: 5
  necessity: 1
status: issues_found
---

# Phase 04: Code Review Report

**Reviewed:** 2026-11-09
**Depth:** standard
**Files Reviewed:** 8 (plus `currentRoom.ts`, `lightFlicker.ts`, `doorGlide.ts` read as dependencies; Phaser 4.2.1 `fillPoints`/`stamp` signatures checked against `node_modules/phaser/types/phaser.d.ts`)
**Status:** issues_found

## Scope note

`git diff acd2dc1..HEAD` contains only plan 04-04 (seam collapse + `seamStripAlpha`). Plan 04-03's wide-angle 5-point `wallShadows` and the 40/48/24 radii are ancestors of `acd2dc1` (`eebeebf`/`268f655` precede it) — so they are *new since the previous review* but not new since the diff base. All eight listed files were reviewed in full at current HEAD, so the delta named in the brief (5-point shadows, retuned radii, collapsed seams, veil strip rule) is covered regardless.

## Summary

The 5-point shadow geometry is sound: the apex construction keeps every half-chord under 90°, so the projected far edge clears the radius for any wall whose span at the light is under 180° (the only degenerate case — a light strictly inside a wall rect — is unreachable: pool registry positions are room-interior and the player body is walled out of `WORLD_WALLS`). `SHADOW_QUAD` length 5 matches the polygon arity, and `fillPoints(points, closeShape, closePath, endIndex)` is the real Phaser 4 signature. The seam data is internally consistent: the deleted office/bedroom bands sit at world y 224–240 / x 304–320 and the surviving living bands at y 240–256 / x 320–336, the gaps were resized to exactly the surviving 16px band, and `VEIL_ZONES + SEAM_STRIPS + YARD_RECT` provably tile the 640×480 box (area-sum test). WR-01 and IN-01 from the prior review are confirmed fixed in the current source; WR-02, IN-02, IN-03, IN-04 are re-verified and carried.

One new real defect: `seamStripAlpha`'s two literal `VEIL_ALPHA` returns ignore the room the player is actually in, which both paints a lighter band across near-black territory while idle and snaps the adjacent-but-not-crossed strip +0.25 brighter in one frame at every glide end — contradicting the function's own doc comment and the "no jumps" promise recorded in 04-04. Its `current` parameter is threaded from `refillVeil` and provably never read, which is the signature of the mis-implementation. No crash, security, or data-loss defect found; suite green (82/82 across the three lighting/rooms/doorGlide files).

## Warnings

### WR-01: `seamStripAlpha` ignores `current` — lighter idle band across dark rooms and a one-frame brightness snap at every glide end

**File:** `src/game/systems/lighting.ts:98-110` (both literal returns), call site `src/game/objects/Light.ts:241`
**Issue:** The idle branch (`if (!fade) return VEIL_ALPHA;`) and the adjacent-to-neither branch (`:105`) return a literal 0.7 for every strip regardless of which room is current. Two provable consequences, both verified against the shipped math:

1. **Idle lighter line.** Standing idle in the bedroom, the north strip (`rooms: ['office','living']`) fills at 0.7 while both its neighbors — the office zone and the living zone — fill at 0.95. The same holds for the west strip while idle in the office. From the bedroom's NE corner (player ~x 304) and the office's south edge (player ~y 224) the 16px band is inside the 160×120 zoom-4 viewport: a lighter band across near-black territory — precisely the artifact class G-04-4 exists to remove. Before this plan those pixels lived inside a room zone and correctly took 0.95.
2. **Glide-end snap.** For a strip adjacent to exactly one gliding room (e.g. the west strip during a living→office glide — both strips contain `'living'`, so every door's fade touches both), the last fade frame computes `Math.min(0.95, 0.95) = 0.95`; the next frame `this.fade` is null and the idle branch returns 0.7. That is a 0.25-alpha brightening in a single frame at the glide-end store flip, visible because the strip's top is inside the office arrival frame's view. It contradicts the function's doc (`:92-96`) and the recorded profile "0.7 → 0.825 → 0.7 with no jumps".

**Fix:** derive the idle/vacuous level from `current` instead of the literal:

```ts
if (!fade) return Math.min(veilAlphaFor(current, rooms[0]), veilAlphaFor(current, rooms[1]));
if (!rooms.includes(fade.from) && !rooms.includes(fade.to))
  return Math.min(veilAlphaFor(current, rooms[0]), veilAlphaFor(current, rooms[1]));
```

This keeps "rides the current room" for adjacent strips (one side is 0.7 → min 0.7) and makes a non-bordering band near-black; at every glide end the last fade frame and the first idle frame now agree (verified: both 0.95), removing the snap. Update the two cases that pin the wrong value: `lighting.test.ts:334` (`(null, 'office', west)` — the current room borders neither) and the synthetic neither-room case `:363-369` must expect `NEAR_BLACK_ALPHA`; the remaining idle pins at `:333` and `:335` and the hold case at `:338-341` stay at `VEIL_ALPHA` because the current room borders those strips.

**Severity rationale:** not cosmetic-only — it violates the invariant the function documents ("never reads lighter than its own bordering rooms", `rooms.ts:165-166`) and the no-jump property 04-04 recorded as its acceptance; reachable in normal play, so Warning. The doc-vs-code mismatch also means one of the two texts must change under a D-04 wording check, consistent with how F-1 (radii) was escalated for an owner call rather than silently patched.

## Info

### IN-01: Necessity — impossible-state guard: the "adjacent to neither gliding room" branch is unreachable with today's room graph

**File:** `src/game/systems/lighting.ts:105`, pinned by `src/game/systems/lighting.test.ts:363-369`
**Issue:** Every door connects through `'living'` (`DOOR_NORTH` living↔office, `DOOR_WEST` living↔bedroom — `rooms.ts:172-192`) and both `SEAM_STRIPS` entries contain `'living'` (`rooms.ts:168-169`), so `rooms.includes(fade.from) || rooms.includes(fade.to)` is always true for a live fade. The branch runs only for the synthetic `['bedroom','bedroom']` fixture in the test — it is a guard against a geometry the data does not permit. **Category:** necessity (impossible-state guard). Evidence: `SEAM_STRIPS` rooms tuples + `DOORS` side destinations, both in `src/game/data/rooms.ts`.
**Fix:** None forced — the plan records the retention as deliberate ("so the stated Option A cannot silently drift"). But note the branch carries the same wrong literal as WR-01: if it is kept, fix its value with the WR-01 expression rather than deleting it.

### IN-02: Carried (prior WR-02, disposition `open`) — `bakePool`'s null-guard returns a texture key that does not exist

**File:** `src/game/objects/Light.ts:83-88`
**Issue:** `scene.textures.addDynamicTexture` returns `null` when the key is already registered under a different texture class; `if (!poolDT) return key;` still hands back `pool-<id>`, and the constructor builds a tint `Image` on the missing key (Phaser substitutes `__MISSING` — a magenta ADD-blend square). Unreachable with today's registry (pinned by the five-id contract test), unchanged since the last review, still recorded open.
**Fix:** `return ''` on null and skip tint creation for an empty key.

### IN-03: Carried (prior IN-03, disposition `open`) — nearest-point cull plus the new apex makes shadow polygons reach farther past the frame

**File:** `src/game/systems/lighting.ts:120-124`, `:156-160`; consumers `src/game/objects/Light.ts:92-97`, `:214-219`
**Issue:** The cull stays nearest-point, so a long wall in range bakes a polygon whose apex now sits at `dmax + 2r + 64` from the light (e.g. the torch in a door gap: ~230px west of a 192px frame). Points clip harmlessly against the DynamicTexture and pools bake once; the registry probe (`lighting.test.ts:120-162`) proves occlusion for all five pools at the new radii on the collapsed layout. Note retained so a refactor does not mistake the enlarged quads for a regression.
**Fix:** none — safe as-is.

### IN-04: Carried (prior IN-02/IN-04, dispositions `open`) — `hashSeed` placement and fade-hold-until-crossing notes still accurate

**File:** `src/game/objects/Light.ts:168` (constructor-time `hashSeed`, D-21 — must not move into `update`), `:181-189` (fade holds the source level until `crossedAxis`; a walk-path room swap still snaps the veil — now the zones snap and the strips keep the literal level, see WR-01)
**Issue:** Both are accepted-design records, unchanged in code. The strip logic adds one nuance worth knowing when WR-01 is fixed: `beginFade` never fires outside a glide, so the snap path remains glide-gated.
**Fix:** none — record only.

## Previously reported — re-verification status

| Prior id | Status at HEAD | Evidence |
|---|---|---|
| WR-01 (flicker dims hole not tint) | fixed | `Light.ts:256-258` — `entry.tint.setAlpha(TINT_ALPHA * brightness)` with the same `brightness` as the erase stamp |
| WR-02 (bakePool null-guard) | open, still applies | carried as IN-02 above |
| IN-01 (POOL_KEY duplication) | fixed | `POOL_KEY` gone; torch base and pool bases share `basePoolKey(radius)` (`Light.ts:46-50,78,144`) |
| IN-02 / IN-03 / IN-04 | open, still apply | carried as IN-03 / IN-04 above |

---

_Reviewed: 2026-11-09T16:20:00Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_
