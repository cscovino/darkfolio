---
phase: 02-multi-room
reviewed: 2026-11-04T19:43:38Z
depth: standard
files_reviewed: 10
files_reviewed_list:
  - src/game/data/rooms.ts
  - src/game/systems/doorGlide.ts
  - src/game/state/currentRoom.ts
  - src/game/scenes/LivingRoomScene.ts
  - src/game/scenes/OfficeScene.ts
  - src/game/scenes/BedroomScene.ts
  - src/game/objects/Player.ts
  - src/game/data/rooms.test.ts
  - src/game/systems/currentRoom.test.ts
  - src/game/systems/doorGlide.test.ts
findings:
  critical: 0
  warning: 2
  info: 4
  total: 6
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-11-04T19:43:38Z
**Depth:** standard
**Files Reviewed:** 10
**Status:** issues_found
**Incremental scope:** `b4d5eec..4b62ead` (70f99ca room-builder refactor, 2d36f4d door/type refactor, ee6e8ab E-key interaction)

## Summary

Incremental re-review of the phase-02 source files that moved since the last phase review. The L-world geometry, the two deterministic door glides, the shared room builder and the new E-key interaction flow are all sound: `pnpm test` is green (47 tests across the three in-scope suites), the door/rest-spot arithmetic is exact, and the Arcade-physics mechanics of the glide were re-verified against `node_modules/phaser/src/physics/arcade/{Body,World}.js` (`body.enable = false` suppresses `preUpdate`/`update`/`postUpdate`, so the tween owns the sprite position and `body.reset()` re-syncs cleanly).

Six open findings: two warnings (one narrowed continuation of prior WR-01, one new locked-contract regression) and four info items. No blocker: no security issue, no data-loss path, no crash, no unrecoverable soft-lock found in the reviewed files.

The single highest-risk regression in this window is not in the geometry but in the **test coverage deleted by the two refactor commits** (2d36f4d): the keep-last-room invariant and the cross-door rest-spot trigger-window assertions lost their runnable cases, and the plan's own acceptance gate for the Phase-1 export contract now fails.

## Prior Finding Dispositions

| Prior ID | Prior severity | Disposition | Evidence |
|---|---|---|---|
| WR-01 | warning | **STILL OPEN — NARROWED** | The originally described symptom (a glide that crosses no real door / a wrong-room teleport) **no longer reproduces**: with the current geometry the trigger fires on the *first* frame the player centre enters a zone, the entry direction equals the facing, and each `reachRect` expands only on the approach side, so the side that fires always matches the room the player came from. What remains is a one-frame position/facing skew (see WR-01 below). Kept open at reduced scope. |
| WR-02 | warning | **FIXED** | `LivingRoomScene.create()` now registers a `SHUTDOWN` handler (lines 103-133) that kills the player tween, restores `body.enable`, clears `gliding`, resets `mode`/`activeObject`, removes timers and the window-level overlay listener, and closes the DOM panel. The teardown path no longer strands the player. (No new finding: the handler is registered once per `create()`, and Phaser emits `SHUTDOWN` on every shutdown — `node_modules/phaser/src/scene/Systems.js:772` — so the `once` pairing stays balanced across restarts.) |
| IN-01 | info | **OBSOLETE — NOT CARRIED FORWARD** | The prior claim was "48 px = 3 tiles vs. the context's ~2 tiles". Re-checked against the geometry: the door axis sits at the **centre of the 32 px wall band**, so `axis ± 48` lands exactly 32 px (2 tiles) past the far wall edge — north rest spot 192 vs. the office wall edge 224, west rest spot 272 vs. the bedroom wall edge 304. The implementation matches D-14 ("ends ~2 tiles inside the destination room") and the plan's own derivation ("16 px half-wall + two 16 px tiles"). No drift. |
| IN-02 | info | **OBSOLETE — NOT CARRIED FORWARD** | "currentRoom is stale during a glide" is true but is the *locked* behaviour: plan 02-01 must_have says the store is "updated both on zone crossing and on **glide completion** (D-11)", which is exactly what `startGlide.onComplete` does. No phase-2/3 consumer reads the store mid-glide (the interaction path is gated behind `if (this.gliding) return`). Not a defect. |
| IN-03 | info | **OBSOLETE — NOT CARRIED FORWARD** | Naming only (`LivingRoomScene` hosts all three rooms). Unchanged since the prior review, cosmetic, no behavioural or contract impact. |
| IN-04 | info | **STILL OPEN — carried forward as IN-04** | The handle pass still tests a raw key hold with no net-movement check (`doorGlide.ts:65-71`). Behaviour is unchanged, impact unchanged (nil): holding `up`+`down` produces the same outcome as holding `up` alone. |

## Narrative Findings (AI reviewer)

## Critical Issues

None. No blocker-severity defect found in the reviewed files.

## Warnings

### WR-01: Door side is chosen from the instantaneous facing with no entry-side check (one-frame reversal fires the opposite side)

**Severity:** warning (prior finding, narrowed)
**File:** `src/game/systems/doorGlide.ts:59-72` (selection) · `src/game/scenes/LivingRoomScene.ts:176-181` (call site)

**Issue:** `triggeredSide` picks a side from `side.dir === facing` plus zone membership; nothing confirms the player is on that side's *source* side of the door. The plan's designed guard for this (`DoorSide.from`, see 02-01-PLAN Task 1) was deleted in 2d36f4d as "unused", so the trigger now relies entirely on emergent geometry.

The geometry does hold for the common case — the trigger fires on the first frame the centre enters the zone, and the entry direction equals the facing — but the call site compares two different frames:

- Arcade physics steps on the scene's `UPDATE` event, i.e. **before** `scene.update()` (`node_modules/phaser/src/physics/arcade/World.js:963` → `body.preUpdate`, then `body.update`), so `this.player.x/y` at line 177 reflects the **previous** frame's velocity;
- `this.player.getFacing()` at line 179 is derived from **this** frame's keys (`Player.handleInput`).

So the position and the facing can disagree by one frame. A player walking north into the north-door zone who reverses to `down` on exactly the crossing frame satisfies `side.dir === 'down'` and fires the *office → living* side: the player is bounced 48 px back to (408,288) with a 700 ms input lock instead of entering the Office. Same shape at the west door. The impact is bounded (the opposite side always points back to the origin room, so this is a bounce, not a wrong-room teleport), but the code has no invariant preventing it, and widening any `zone` past its wall band reintroduces the broad prior-WR-01 symptom immediately.

**Fix:** select the side from the player's position relative to the door axis rather than from the instantaneous facing, and make the call site use one frame's motion consistently:

```ts
// src/game/systems/doorGlide.ts
export function triggeredSide(
  doors: DoorDef[],
  pos: Vec,
  facing: Dir,
  keys: Record<Dir, boolean>,
): { door: DoorDef; side: DoorSide } | null {
  for (const door of doors) {
    for (const side of door.sides) {
      if (side.dir === facing && insideRect(door.zone, pos) && onEntrySide(side, pos, door.axis))
        return { door, side };
    }
  }
  ...
}

// The player must be on the side the side travels FROM: 'up' travels from
// below the axis, 'down' from above it, 'left' from the right, 'right' from the left.
function onEntrySide(side: DoorSide, pos: Vec, axis: Vec): boolean {
  switch (side.dir) {
    case 'up': return pos.y >= axis.y;
    case 'down': return pos.y <= axis.y;
    case 'left': return pos.x >= axis.x;
    case 'right': return pos.x <= axis.x;
  }
}
```

With that guard the geometry's current correctness becomes an enforced invariant instead of an accident, and the deleted `DoorSide.from` field is no longer needed.

### WR-03: The Phase-1 export contract re-exports were deleted from `LivingRoomScene.ts`

**Severity:** warning (new finding)
**File:** `src/game/scenes/LivingRoomScene.ts:1-13`

**Issue:** ee6e8ab (the E-key interaction commit) removed the contract re-export line

```ts
export { TILE, ROOM_W, ROOM_H, WORLD_W, WORLD_H, SPAWN_X, SPAWN_Y };
```

that phase 01 exported from this module. Nothing imports it today (`main.ts` imports only `LivingRoomScene`; `GateScene` only uses the scene key), so the build is green — but plan 02-01 locked the opposite in two places:

- must_have truth: *"Phase-1 export contract stays intact and extended: `LivingRoomScene.ts` still exports `TILE` (16), `ROOM_W` (20), `ROOM_H` (15), `WORLD_W`, `WORLD_H`, `SPAWN_X`, `SPAWN_Y`"*;
- acceptance criterion / runnable gate: *"grep -q `export { TILE` or equivalent re-export line in `src/game/scenes/LivingRoomScene.ts` — all seven Phase-1 contract symbols still exported from that file"*.

That gate now fails, and the plan's `key_links` entry ("`LivingRoomScene.ts` contract re-exports → `rooms.ts` definitions (extend, don't replace)") is broken. Any phase-3+ module that imports the geometry contract from the scene (rather than from `@/data/rooms`) breaks at compile time.
**Fix:** Restore the re-export, or amend the plan so `@/data/rooms` is the single contract source and drop the scene-level gate:

```ts
// src/game/scenes/LivingRoomScene.ts — restore the Phase-1 contract
export { TILE, ROOM_W, ROOM_H, WORLD_W, WORLD_H, SPAWN_X, SPAWN_Y };
```

## Info

### IN-04: Handle pass fires on a raw key hold with no net-movement check

**Severity:** info
**File:** `src/game/systems/doorGlide.ts:65-71`

**Issue:** The second pass tests `keys[side.dir]` directly, so holding both opposite keys (net movement zero — `velocityFromKeys` cancels them, `movement.ts:12-13`) still satisfies the held-key condition. Behaviour and impact are unchanged from the prior review: the outcome equals holding that direction alone, so nothing breaks today.
**Fix:** Optional — `keys[side.dir] && !keys[opposite[side.dir]]` makes the intent explicit. No urgency.

### IN-05: The keep-last-room-on-null invariant lost its runnable test

**Severity:** info
**File:** `src/game/state/currentRoom.ts:9-11` · `src/game/scenes/LivingRoomScene.ts:186-187` · `src/game/systems/currentRoom.test.ts:36-42`

**Issue:** 2d36f4d deleted `setCurrentRoomFrom` and with it the runnable "keeps the last room when given null" case; the null-guard now lives inline in the scene (`if (room) setCurrentRoom(room)`). The behaviour still holds, but plan 02-01's must_have — "the store keeps the last valid room when `roomAt` returns null — enforced by the pure `setCurrentRoomFrom()` seam … **and covered by runnable `currentRoom.test.ts` cases**" — no longer has runnable coverage. The remaining store test only round-trips one id.
**Fix:** Restore a pure seam and keep its case, or add a scene-level test for the null path:

```ts
// src/game/state/currentRoom.ts
export function setCurrentRoomFrom(room: RoomId | null): void {
  if (room !== null) setCurrentRoom(room);
}

// src/game/systems/currentRoom.test.ts
it('keeps the last room when given null', () => {
  setCurrentRoom('bedroom');
  setCurrentRoomFrom(null);
  expect(getCurrentRoom()).toBe('bedroom');
});
```

### IN-06: The cross-door rest-spot trigger-window assertions were deleted

**Severity:** info
**File:** `src/game/systems/doorGlide.test.ts:92-105` · `src/game/systems/doorGlide.ts:13-14`

**Issue:** 2d36f4d removed the `rest spots never land inside a trigger window (ROOM-02)` block and the `REACH`/`GLIDE_STEP` constant pins (both constants are now module-private, `doorGlide.ts:13-14`). The surviving cases still pin the four known rest spots against *their own* door, but nothing asserts that a rest spot is clear of the *other* door's zone, nor that `REACH`/`GLIDE_STEP` keep their pinned values — a future rest-spot or constant change could land a spot inside a foreign trigger window with no red test.
**Fix:** Re-add one cross-door assertion and keep the constants exported (or pinned indirectly):

```ts
it('keeps every rest spot outside every door zone and reach window', () => {
  const spots = [{ x: 408, y: 192 }, { x: 408, y: 288 }, { x: 272, y: 344 }, { x: 368, y: 344 }];
  for (const spot of spots) {
    for (const door of [DOOR_NORTH, DOOR_WEST]) {
      for (const side of door.sides) {
        expect(insideRect(door.zone, spot)).toBe(false);
        expect(insideRect(reachRect(door.zone, side.dir), spot)).toBe(false);
      }
    }
  }
});
```

### IN-07: Rest-spot clearance assertions never check walls, though T-02-01 claims they do

**Severity:** info
**File:** `src/game/data/rooms.test.ts:48-52` (helper) · `src/game/data/rooms.test.ts:92-95, 145-148` (call sites)

**Issue:** `expectClearOfSolids` compares only `layout.solids`; the wall tuples are checked exclusively against the door *gaps*. Phase 2's threat register T-02-01 states the mitigation is "player.body.reset to the exact integer end + rooms.test.ts rest-spot clearance assertions guarantee the player never re-enables inside a wall (soft-lock)" — the assertions do not cover walls, so the stated guarantee is not actually enforced. All four current rest spots are in fact wall-clear by hand (north 192 vs. the office wall edge 224; living 288 vs. 256; bedroom 272 vs. 304; living-from-bedroom 368 vs. 336), so this is a coverage gap, not a live bug.
**Fix:** Extend the helper to the wall tuples as well:

```ts
function expectClearOfSolids(layout: RoomLayout, rect: Rect): void {
  for (const t of layout.solids) {
    expect(rectsOverlap(toRect(t), rect)).toBe(false);
  }
  for (const t of layout.walls) {
    expect(rectsOverlap(toRect(t), rect)).toBe(false);
  }
}
```

---

_Reviewed: 2026-11-04T19:43:38Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_
