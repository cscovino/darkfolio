---
status: complete
phase: 02-multi-room
source: [02-VERIFICATION.md]
started: 2026-10-21T13:25:00.000Z
updated: 2026-10-21T14:51:47.356Z
---

## Current Test

[testing complete]

## Tests

### 1. Full SC#1-6 walk on pnpm dev
expected: Spawn in Living → north door glide into Office → south door back → west door glide into Bedroom → east door back; collision and camera follow live in all three rooms; yard reads as exterior with shrub/fence silhouettes, never a black void or walkable gap; no console errors on boot.
result: pass

### 2. Entry-tile determinism on repeat crossings
expected: North entries rest at house (408,192) facing up / (408,288) facing down; west entries at (272,344) facing left / (368,344) facing right — pixel-identical on every crossing (ROOM-02).
result: pass

### 3. Sealed/locked door and yard readability (D-04, D-08, D-12)
expected: East wall shows a dark boarded door the player cannot pass; behind the spawn the south wall shows locked front-door planks with a lock glint; peeking past outer corners shows a dark yard with shrub and fence silhouettes.
result: pass

## Summary

total: 3
passed: 3
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
