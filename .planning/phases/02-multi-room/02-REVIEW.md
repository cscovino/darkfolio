---
phase: 02-multi-room
reviewed: 2026-10-21T13:10:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - src/game/data/rooms.ts
  - src/game/data/rooms.test.ts
  - src/game/systems/currentRoom.ts
  - src/game/systems/currentRoom.test.ts
  - src/game/systems/doorGlide.ts
  - src/game/systems/doorGlide.test.ts
  - src/game/state/currentRoom.ts
  - src/game/scenes/LivingRoomScene.ts
  - src/game/scenes/OfficeScene.ts
  - src/game/scenes/BedroomScene.ts
  - src/game/objects/Player.ts
findings:
  critical: 0
  warning: 2
  info: 4
  total: 6
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-10-21T13:10:00Z
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

Phase 2 delivers a continuous 640×480 L-world with two deterministic door glides, dense Office/Bedroom layouts, the first-class `currentRoom` store, and yard dressing. Pure systems (`roomAt`, `triggeredSide`, `glideEnd`, `reachRect`) are well tested and the full gate (format/test/astro check/build) is green. Two logic issues in door triggering and glide lifecycle robustness were found; the rest are minor spec/contract notes. No security vulnerabilities or data-loss risks were identified.

## Warnings

### WR-01: Door trigger fires without confirming the player is on the entry side

**File:** `src/game/systems/doorGlide.ts:53-72`
**Issue:** `triggeredSide` fires a side based only on facing (bump pass) or a raw key hold (handle pass) plus membership in `door.zone`. Because each `DoorDef.zone` straddles the shared wall, a player standing in the zone on the wrong side — or holding both opposite keys at once (net movement zero) — can trigger a spurious glide that does not cross a real door, locking input for `GLIDE_MS` and moving the player 48px along a direction with no door. For example, a player in the living-side lower half of the north zone (`y ≈ 250`) facing down satisfies `side.dir === 'down'` (office side) and glides to `(408, 288)` even though no south door exists.
**Fix:** Add an entry-side guard so each side only fires when the player is on its source side of `door.axis`, and require the held key's opposite not also be held in the handle pass:

```ts
const opposite: Record<Dir, Dir> = {
  up: 'down', down: 'up', left: 'right', right: 'left',
};

function onEntrySide(side: DoorSide, pos: Vec, axis: Vec): boolean {
  switch (side.dir) {
    case 'up': return pos.y >= axis.y;
    case 'down': return pos.y <= axis.y;
    case 'left': return pos.x >= axis.x;
    case 'right': return pos.x <= axis.x;
  }
}

// bump pass:
if (side.dir === facing && inside(door.zone, pos) && onEntrySide(side, pos, door.axis))
  return { door, side };

// handle pass:
if (keys[side.dir] && !keys[opposite[side.dir]] &&
    inside(reachRect(door.zone, side.dir), pos) && onEntrySide(side, pos, door.axis))
  return { door, side };
```

### WR-02: Glide relies solely on tween `onComplete` to restore physics/input

**File:** `src/game/scenes/LivingRoomScene.ts:149-167`
**Issue:** `startGlide` disables the physics body and sets `gliding = true`, restoring both only inside the tween's `onComplete`. If the tween is stopped or the scene is torn down mid-glide (transition, hot-reload, or any future `scene.stop`), `onComplete` never fires: the body stays disabled, `gliding` stays `true`, the player becomes permanently unresponsive, and `currentRoom` stays stale. There is no cleanup on the tween or scene shutdown.
**Fix:** Register cleanup on the tween and scene shutdown so state is always restored:

```ts
const tween = this.tweens.add({
  targets: this.player,
  x: end.x, y: end.y,
  duration: GLIDE_MS, ease: GLIDE_EASE,
  onComplete: () => finish(),
});
const finish = () => {
  body.reset(end.x, end.y);
  body.enable = true;
  setCurrentRoom(side.dest);
  this.gliding = false;
};
tween.on('stop', finish);
this.events.once(Phaser.Scenes.Events.SHUTDOWN, finish);
```

## Info

### IN-01: Glide distance (48px / 3 tiles) vs. context "~2 tiles"

**File:** `src/game/systems/doorGlide.ts:14`
**Issue:** `GLIDE_STEP` is 48px (3 tiles) while `02-CONTEXT.md` D-14 describes the glide ending "~2 tiles" inside the destination room. The co-located tests lock 48px, so this is a spec/implementation drift rather than a runtime bug.
**Fix:** Either update D-14 to "~3 tiles (48px)" to match the implemented, tested value, or change `GLIDE_STEP` to 32 and update `doorGlide.test.ts` rest-spot expectations.

### IN-02: `currentRoom` is stale for the duration of a glide

**File:** `src/game/scenes/LivingRoomScene.ts:67,165`
**Issue:** `update()` returns early while `gliding` is true, so `setCurrentRoomFrom(roomAt(...))` is skipped; `currentRoom` is only set to `side.dest` in `onComplete`. For the full 700ms glide, `getCurrentRoom()` still reports the origin room even though the player is physically crossing into the destination. No Phase 2 consumer reads it mid-glide (input is locked), but Phase 3 interaction/overlay logic may.
**Fix:** Call `setCurrentRoom(side.dest)` at glide start (the destination is already known) and keep the existing `onComplete` as a no-op for state, or document that consumers must not read `currentRoom` during a glide.

### IN-03: `LivingRoomScene` hosts all three rooms

**File:** `src/game/scenes/LivingRoomScene.ts:31`
**Issue:** Despite its name, `LivingRoomScene` is the single live scene composing the Living, Office, and Bedroom builders plus the yard. The name implies a living-room-only scene and may confuse later phases wiring per-room scenes.
**Fix:** Rename to `WorldScene`/`HouseScene` and update the registration in `src/game/main.ts` (optional, cosmetic).

### IN-04: Handle pass fires on raw key holds even with net-zero movement

**File:** `src/game/systems/doorGlide.ts:64-71`
**Issue:** The second pass checks `keys[side.dir]` directly, so holding both opposite keys (e.g., left+right) while standing in a reach zone still satisfies the held-key condition for that side. Combined with the missing entry-side check (WR-01), this can trigger a glide while the player is effectively standing still.
**Fix:** Require `keys[side.dir] && !keys[opposite[side.dir]]` (see WR-01) so a glide only fires when there is net movement toward the door.

---

_Reviewed: 2026-10-21T13:10:00Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_