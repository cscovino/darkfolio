---
phase: 01-core-game-loop
audited: 2026-10-20
asvs_level: 1
block_on: high
threats_total: 3
threats_closed: 3
threats_open: 0
status: secured
---

# Phase 01 — Core Game Loop: Security Audit

## Scope and assumptions

- Plans audited: 01-01, 01-02, 01-03. Threat register taken from each plan's `<threat_model>`.
- No `asvs_level` or `block_on` declared in config. Assumed ASVS L1 and `block_on: high` (default).
- Static Astro site with client-side Phaser. No auth, database, user data, or server endpoints.
- No `## Threat Flags` section exists in any SUMMARY.md.

## Threat verification

| Threat ID | Category | Severity | Disposition | Status | Evidence |
|-----------|----------|----------|-------------|--------|----------|
| T-01-01 | Tampering | low | accept | CLOSED | Keyboard input only sets local player velocity. Velocity is bounded by `Player.SPEED` (`src/game/objects/Player.ts:40`) and `velocityFromKeys` (`src/game/systems/movement.ts:8`). Bounds: `this.physics.world.setBounds` and `cam.setBounds` (`LivingRoomScene.ts:63,66`), `setCollideWorldBounds(true)` (`Player.ts:47`), and `physics.add.collider(player, solids)` (`LivingRoomScene.ts:62`). Accepted risk logged below. |
| T-01-02 | Tampering | low | mitigate | CLOSED | One-shot listener `this.input.keyboard?.once('keydown', …)` (`src/game/scenes/GateScene.ts:28`). Phaser removes it when it fires. `GateScene` reads no movement keys. Movement polling (`LivingRoomScene.ts:75-81`) is registered only in `LivingRoomScene.create`, after the transition. |
| T-01-SC | Tampering | high | mitigate | CLOSED | Exact pin `"phaser": "4.2.1"` (`package.json`, no caret). `pnpm-lock.yaml` is git-tracked and pins `phaser@4.2.1` with sha512 integrity (lines 2119-2120), plus transitive `eventemitter3@5.0.4` with sha512 integrity. Phaser declares no install-time scripts, and the lockfile has no `hasInstallScript` or tarball/git resolutions. Lock diff for this phase is +10 lines, i.e. phaser and its one transitive dependency only. Human legitimacy approval is recorded in 01-01-SUMMARY "Task 1 Checkpoint Outcome". That approval is process evidence and cannot be re-verified from code. |

## Additional checks (no declared threat; recorded for completeness)

| Check | Result |
|-------|--------|
| XSS / DOM sinks (`innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`) in `src/` and `public/` | None found. |
| Inline scripts in built HTML | `dist/index.html` has one `<script type="module" src=…>` (external bundle). No inline `<script>` bodies. |
| Secrets in tracked files | Pattern scan over tracked files (excluding lockfile and skills) found no keys, tokens, or private keys. `opencode.jsonc` contains no credentials. |
| Dependency lockfile tracked | Yes, `pnpm-lock.yaml` is tracked. |

## Accepted risks log

| Threat ID | Rationale | Owner / accepted by |
|-----------|-----------|---------------------|
| T-01-01 | Single-player static page. Input effects are confined to one browser session with no server, storage, or cross-visitor surface. Velocity and position are clamped by world bounds and colliders. | Plan 01-01 threat model (disposition `accept`). |

## Unregistered flags (no threat-register mapping)

1. **WARNING (low, non-blocking)**: `opencode.jsonc` loads an unpinned npm plugin, `@dietrichgebert/ponytail`, into the developer's OpenCode runtime. It is a dev-tooling surface, not shipped in the site bundle, and it is outside every phase 01 threat. Suggested action: pin the version or review it at the next tooling change.
2. **INFO (low, non-blocking)**: No Content-Security-Policy is defined in the page or config. The site has no inline scripts and no user-rendered content, so this is defense-in-depth only. A CSP can be set at the static host.

## Result

All three declared threats are CLOSED. No blocking or non-blocking open threats. `threats_open: 0`.
