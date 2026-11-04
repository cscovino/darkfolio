---
status: testing
phase: 01-core-game-loop
source: [01-VERIFICATION.md]
started: 2026-11-04T17:55:00Z
updated: 2026-11-04T17:55:00Z
---

## Current Test

number: 1
name: MVP user-flow walk-through: open the site at `/darkfolio/` (or `/` on the dev server), confirm the framed canvas box centered on the dark page with no page scroll, press any key at the 'PRESS ANY KEY' gate, then walk the player around the Living Room with WASD and arrow keys
expected: |
  Framed CRT-style canvas mounts with no other page content and no scrollbar; the gate is the first screen; a single keypress drops into the Living Room; the player moves at a constant speed, diagonals are not faster than cardinals, releasing every key stops the player
awaiting: user response

## Tests

### 1. MVP user-flow walk-through
expected: Framed canvas mounts with no other page content and no scrollbar; the gate is first; one keypress enters the Living Room; constant speed, diagonals not faster, release stops the player
result: [pending]

### 2. Collision blocking walk (SC#3 / GAME-02)
expected: Player is stopped flush by every solid — no pass-through at any angle, no snagging that traps the player, no exit from the room (push into all four walls and the TV, coffee table, couch and floor lamp from several angles, then into the west/north door-gap recesses)
result: [pending]

### 3. Camera lerp feel (SC#4 / GAME-03)
expected: Camera visibly trails, settles over about a second, never snaps, and clamps at the house bounds with no black area (walk on both axes, stop abruptly, walk to a room edge)
result: [pending]

### 4. Console check (SC#5)
expected: Zero console errors from load through boot into the Living Room and the first walk, with the devtools console open
result: [pending]

### 5. Gate must not consume gameplay keyboard input (01-02 judgment-tier prohibition)
expected: Gate shows only 'PRESS ANY KEY' / 'the house is listening'; no player appears or moves during the gate; holding WASD/arrows at the gate then pressing a key enters the Living Room with the player still at spawn (not pre-moved by gate-time key state)
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Superseded Run

- run: 2026-10-20 (3/3 pass — walk, door-gap clearance W-2, console/canvas check)
  note: supporting history only; the blocking evidence predates the multi-room and interaction rewrites of `LivingRoomScene`, which is why this batch exists.
- deferred: test — "Phaser lib loads too slow — add some kind of loading progress of the lib" (deferred 2026-10-20, addressed by Phase 8)

## Gaps
