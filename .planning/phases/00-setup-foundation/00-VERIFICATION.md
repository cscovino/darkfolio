---
phase: 00-setup-foundation
verified: 2026-10-15T22:10:00Z
status: passed
score: 6/6 must-haves verified
covered_files:
  - .gitignore
  - .husky/commit-msg
  - .husky/pre-commit
  - .husky/pre-push
  - .nvmrc
  - .planning/phases/00-setup-foundation/00-PLAN.md
  - .planning/phases/00-setup-foundation/00-SUMMARY.md
  - README.md
  - astro.config.mjs
  - biome.json
  - commitlint.config.js
  - lint-staged.config.mjs
  - package.json
  - pnpm-lock.yaml
  - pnpm-workspace.yaml
  - src/test/commit-gate.test.ts
  - src/test/sanity.test.ts
  - tsconfig.json
  - vitest.config.ts
covered_digest: "v3:sha256:e46cb664f20093eecf6e4e8d9711cd349b8b594edf2c4d26d94db912349f6505"
behavior_unverified: 0
overrides_applied: 0
---

# Phase 0: Setup (Foundation) Verification Report

**Phase Goal:** Tooling and config foundation is in place — `pnpm install`, `pnpm test`, `pnpm build` all green on a clean clone, and every commit / push is gated by hooks.
**Verified:** 2026-10-15T22:10:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth | Status | Evidence |
| --- | ----- | ------ | -------- |
| 1   | SC#1: `astro.config.mjs` exists with base `/darkfolio` AND output static AND `server.host true` | ✓ VERIFIED | File contains `base: '/darkfolio'`, `output: 'static'`, `server: { host: true }`. Build exits 0 with base applied. (ROADMAP writes the literal with trailing slash `/darkfolio/`; Astro normalizes — the plan's must_have wording matches the code verbatim.) |
| 2   | SC#2: `tsconfig.json` extends `astro/tsconfigs/strict` AND declares the ten path aliases with the canon's two mapping groups | ✓ VERIFIED | All 10 aliases present, correctly grouped (`@/systems/*`,`@/scenes/*`,`@/objects/*`,`@/data/*` under `src/game/`; rest under `src/` directly). Note: `include` is `["src/**/*","tests/**/*"]` — the plan's acceptance text said `src/**`; commit `2083633` deliberately fixed the recursive wildcard precisely because `src/**` was NOT recursive and made `astro check` vacuous (0 files). This deviation is what makes truth #3 hold. |
| 3   | AGENTS.md gate leg: `pnpm exec astro check` performs a REAL typecheck | ✓ VERIFIED | Ran live: exit 0, log contains `Result (3 files):` summary, no `requires the following dependency` sentinel. `@astrojs/check ^0.9.10` in devDependencies. Genuine post-`2083633` (was vacuous "Result (0 files)" pre-fix). |
| 4   | SC#3: Pre-commit hook fires `pnpm lint-staged` so committed TS/JS/JSON/MJS/CJS pass `biome check --write` | ✓ VERIFIED | `.husky/pre-commit` body `pnpm lint-staged`; `lint-staged.config.mjs` single glob `*.{ts,tsx,js,jsx,mjs,cjs,json}` → `biome check --write`. `core.hooksPath=.husky/_`. Hook chain fired live: `git commit --allow-empty -m "bad message"` executed pre-commit then was rejected by commit-msg (exit 1, HEAD unchanged) — husky dispatch is mechanically proven. |
| 5   | SC#4: Pre-push hook body invokes `pnpm test` AND `pnpm build`; `astro check` deliberately excluded per D3 | ✓ VERIFIED | `.husky/pre-push` contains exactly `pnpm test && pnpm build` (plus the D3 comment); no `astro check` in any hook. Both legs exit 0 live in the working tree AND on a fresh clean clone. |
| 6   | SC#5: commit-msg hook invokes `pnpm commitlint --edit "$1"`; gitmoji `headerPattern` wired through `parserPreset.parserOpts` with exactly 3 capture groups; 72-char cap via `rules['header-max-length'] = [2, 'always', 72]` | ✓ VERIFIED | Config puts `headerPattern` under `parserPreset.parserOpts` (the commitlint-19 read path) — top level absent. Live CLI probes (corrected form `commitlint --edit <file>`): ✨feat / 🐛fix / ♻️-VS-16-refactor / 🚀chore all exit 0; `bad message` and `feat(game): missing emoji` exit 1 with `✖ subject-empty/type-empty` tokens; 102-char header exits 1 with `✖ header-max-length`. Composition `commitlint` (script) + `--edit "$1"` (hook) yields exactly one `--edit` — pinned by `src/test/commit-gate.test.ts` (CR-01 regression lock, 6 passing tests). Live hook rejection confirmed end-to-end. |

**Score:** 6/6 truths verified (0 present-but-behavior-unverified — every behavior-dependent truth was exercised live: gate commands run, CLI probes run, real commit rejected through the real hook).

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `package.json` | 9 scripts + 9 devDeps | ✓ VERIFIED | All 9 devDeps present (`@astrojs/check` included); `format`/`format:check`/`lint`/`check:biome`/`astro:check`/`test`/`test:watch`/`prepare: husky` present; `commitlint` script is bare `commitlint` per dedupe fix `a2e85dd` (plan text predated CR-01); `private: true` per review. |
| `astro.config.mjs` | base `/darkfolio` | ✓ VERIFIED | VERIFIED via gsd verify.artifacts + direct read. |
| `tsconfig.json` | strict extends + aliases | ✓ VERIFIED | Contains `"@/*": ["src/*"]` and nine siblings. |
| `biome.json` | `noConsoleLog` + 4 rules + `files.include` | ✓ VERIFIED | All 4 rules at `warn`; `.planning/**` in ignore per `40ed247`. |
| `.husky/pre-commit` | `pnpm lint-staged` | ✓ VERIFIED | Tracked; body exact. |
| `.husky/pre-push` | `pnpm test && pnpm build` | ✓ VERIFIED | Tracked; body exact. |
| `.husky/commit-msg` | `pnpm commitlint --edit "$1"` | ✓ VERIFIED | Tracked; body exact; fired live. |
| `commitlint.config.js` | `parserPreset` | ✓ VERIFIED | Nesting correct; pattern flag-independent (both RegExp modes tested in commit-gate spec). |
| `lint-staged.config.mjs` | biome check --write glob | ✓ VERIFIED | Single key. |
| `vitest.config.ts` | happy-dom env | ✓ VERIFIED | `src/**/*.test.ts` discovery proven (7 tests in 2 files found). |
| `src/test/sanity.test.ts` | `expect(1 + 1).toBe(2)` | ✓ VERIFIED | Passes; imports vitest APIs explicitly (documented deviation #2 — config locked without globals). |
| `.gitignore` | `.opencode/` etc, NO `.planning` | ✓ VERIFIED | No `.planning` line (D2 honored). |
| `.nvmrc` | `22` | ✓ VERIFIED | Exact. |
| `.opencode/plan/darkfolio-plan.md` | local mirror | ✓ VERIFIED | Exists (gitignored, local-only per D2/task spec — directory excluded from repo per AGENTS.md). |
| `src/pages/index.astro` | CONDITIONAL (Task-3 fallback) | ✓ N/A — untouched | Fallback never needed; pre-existing stub left as-is per plan. Remains untracked (see Observations). |
| `src/content.config.ts` | CONDITIONAL — absent unless astro check demands | ✓ N/A — correctly absent | `astro check` passed without it. gsd verify.artifacts flagged "File not found" against the conditional declaration; the plan's own text makes absence the correct outcome. |

Tooling: `verify.artifacts` 15/16 (sole "failure" is the conditionally-absent `src/content.config.ts` — declared outcome). `verify.commits` 7/7 valid.

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| `.husky/pre-commit` | `lint-staged.config.mjs` | `pnpm lint-staged` loads config | ✓ WIRED | Hook body + config load probe green; chain fired live on the rejection test and on 8 real commits since `c486026`. |
| `.husky/commit-msg` | `commitlint.config.js` | `pnpm commitlint --edit` reads `parserPreset.parserOpts.headerPattern` | ✓ WIRED | CLI-level rejection of `feat(game): missing emoji` proves the parser reads the pattern (not dead config); live hook rejection proves git→commitlint wiring. |
| `.husky/pre-push` | `src/test/sanity.test.ts` | `pnpm test` → vitest.config.ts glob → test files | ✓ WIRED | gsd tool reported "pattern not found" because `src/**/*.test.ts` lives in the intermediate hop (`vitest.config.ts`), not the two endpoints — tool 2-hop limitation, manually traced and runtime-proven: `pnpm test` discovers and passes 7 tests across both files (working tree AND clean clone). |
| `package.json` | scripts | Gate entry points | ✓ WIRED | `verify.key-links` 3/5 raw; the two "failures" are the intermediate-hop limitation above and the non-file ROADMAP→truths meta-link (1:1 SC mapping confirmed in this report). |

### Data-Flow Trace (Level 4)

Not applicable per artifact kind — this is a config/toolchain phase; every "flow" is a command chain, verified by execution above (hook → script → binary → exit code), not rendered data.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Clean clone: install | `git clone -b phase-0-setup` + `pnpm install` (in `/tmp/opencode/darkfolio-clean`) | Done in 2.4s, exit 0 | ✓ PASS |
| Clean clone: test | `pnpm test` | 7 passed (2 files) | ✓ PASS |
| Clean clone: build | `pnpm build` | exit 0 ("0 page(s) built" — stub page untracked by design; see Observations) | ✓ PASS |
| Gate leg 1 | `pnpm format` | exit 0 | ✓ PASS |
| Gate leg 2 | `pnpm test` | exit 0, 7 passed | ✓ PASS |
| Gate leg 3 | `pnpm exec astro check` | exit 0, `Result (3 files)`, no missing-dep sentinel | ✓ PASS |
| Gate leg 4 | `pnpm build` | exit 0, `dist/index.html` exists | ✓ PASS |
| Formatter idempotency | `pnpm format:check` | exit 0 | ✓ PASS |
| commitlint accepts 4 emoji classes | `commitlint --edit goodN.txt` ×4 | all exit 0 | ✓ PASS |
| commitlint rejects bad/no-emoji/over-72 | `commitlint --edit {bad,noemoji,long}.txt` | exit 1 ×3 with `✖` tokens | ✓ PASS |
| Hooks fire on REAL commits | `git commit --allow-empty -m "bad message no gitmoji"` | exit 1, `✖ subject-empty/type-empty` from live commit-msg hook, HEAD unchanged | ✓ PASS |
| Husky wired into git | `git config core.hooksPath` | `.husky/_` | ✓ PASS |
| Test suite exists/enumerable | `pnpm test` (full, 7 tests) | 7 green | ✓ PASS |

### Probe Execution

Task 4's hook-chain dry-run is this phase's probe suite; re-executed independently above (commitlint fixtures, hooksPath, hook-body greps, lint-staged load). SUMMARY's Task-4 claims reproduced verbatim — including the correction that `pnpm commitlint <file>` without `--edit <file>` reads stdin/COMMIT_EDITMSG; the wired form validated via `commitlint --edit <path>`.

### Requirements Coverage

Plan declares `requirements: []` / `requirements_addressed: []` — nothing to trace. REQUIREMENTS.md confirms: "Phase 0 (Setup) — no v1 reqs (foundation; enables every other phase)". No orphaned requirements. ROADMAP SC#1–#5 mapped 1:1 to truths above, all verified.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| — | — | No TBD/FIXME/XXX markers in any phase-touched file | — | Clean |
| `src/test/sanity.test.ts` / `src/test/commit-gate.test.ts` | 1 / 6 | `ponytail:` rationale comments | ℹ️ Info | AGENTS.md-sanctioned tags, not debt markers |

### Observations (non-blocking)

1. **`src/pages/index.astro`, `public/`, `opencode.jsonc` remain untracked.** Deliberate per plan ("existing stub untouched") and already flagged in SUMMARY for the Phase-1 owner. Consequence measured: clean-clone `pnpm build` exits 0 but builds 0 pages (no `dist/index.html` on a bare clone; it exists in the working tree). The phase goal is "build green on clean clone" — exit 0 satisfies it; the page-owning phase should commit the stub.
2. **Two deviations from plan acceptance text are load-bearing fixes, verified in place:** `tsconfig include` recursive wildcard (`2083633`, makes truth #3 real) and bare `commitlint` script (`a2e85dd`, closes CR-01 gate bypass, pinned by `commit-gate.test.ts`). `.planning/**` biome ignore (`40ed247`) present.
3. First-commit-per-clone relies on `prepare: husky` running during `pnpm install` — verified: the clean clone's install completed and husky shims exist there.

### Gaps Summary

None. All six must-haves verified with runtime evidence, all five ROADMAP success criteria hold, clean-clone install/test/build green, hooks demonstrated live (one real commit rejected through the real hook chain, HEAD untouched).

---

_Verified: 2026-10-15T22:10:00Z_
_Verifier: the agent (gsd-verifier)_
