---
phase: 00-setup-foundation
plan: 01
subsystem: infra
tags: [toolchain, biome, husky, commitlint, vitest, astro, pnpm]

requires: []
provides:
  - "Nine devDeps installed and locked (biome 1.9.4, husky 9.1.7, lint-staged 15.5.2, vitest 2.1.9, happy-dom 15.11.7, @commitlint/cli + config-conventional 19.8.1, typescript 5.9.3, @astrojs/check 0.9.10)"
  - "Root configs: astro static base /darkfolio, strict tsconfig with ten @/ path aliases, biome lint+format, flag-independent gitmoji commitlint pattern, vitest happy-dom, gitignore set"
  - "Husky hooks: pre-commit lint-staged, pre-push test+build, commit-msg commitlint"
  - "AGENTS.md four-command gate green end-to-end; commitlint CLI probes pass"
affects: [all subsequent phases]

actuals:
  tokens: 44948
  tasks: 4
  commits: 3
  plan_head_before: 48fae624015c976ec761a617b2e3f664cafd5aba
  plan_head_after: 048f9dbfadaddcffe7e2c004f82ed2d2c950fa64

tech-stack:
  added:
    - "@biomejs/biome 1.9.4 (lint + format)"
    - "husky 9.1.7 + lint-staged 15.5.2 (git hooks)"
    - "vitest 2.1.9 + happy-dom 15.11.7 (unit tests)"
    - "@commitlint/cli 19.8.1 + config-conventional (commit format gate)"
    - "typescript 5.9.3 + @astrojs/check 0.9.10 (real astro check typecheck leg)"
  patterns:
    - "Single-quote + semicolons-always source convention enforced by Biome"
    - "commitlint parser options via parserPreset.parserOpts (top-level keys are dead config in commitlint 19)"
    - "Build-script approval via pnpm-workspace.yaml allowBuilds"

key-files:
  created:
    - biome.json
    - commitlint.config.js
    - lint-staged.config.mjs
    - vitest.config.ts
    - .gitignore
    - .nvmrc
    - README.md
    - .husky/pre-commit
    - .husky/pre-push
    - .husky/commit-msg
    - src/test/sanity.test.ts
  modified:
    - package.json
    - pnpm-lock.yaml
    - pnpm-workspace.yaml
    - astro.config.mjs
    - tsconfig.json

key-decisions:
  - "Approved @biomejs/biome build script in pnpm-workspace.yaml allowBuilds — pnpm 12 hard-fails pnpm install (exit 1) on unapproved postinstall, voiding the Task 1 done criterion"
  - "sanity.test.ts imports describe/it/expect from vitest instead of globals — the locked vitest.config.ts deliberately omits globals: true"
  - "gitmoji headerPattern kept flag-independent: BMP code-point class + literal astral emoji + optional VS-16, exactly 3 capture groups"

requirements-completed: []

coverage:
  - id: D1
    description: "Toolchain devDeps installed and root configs carry their locked identifiers (SC#1, SC#2)"
    verification:
      - kind: other
        ref: "Task 1 <automated> verify chain (.verify/install.log) — pnpm install exit 0 + config greps + regex probe both flag modes"
        status: pass
    human_judgment: false
  - id: D2
    description: "Husky hooks wired with locked bodies; core.hooksPath set; pnpm test exits 0 with 1 passed (SC#3, SC#4)"
    verification:
      - kind: other
        ref: "Task 2 <automated> verify chain — hook greps + prepare + vitest 1 passed + hooksPath"
        status: pass
    human_judgment: false
  - id: D3
    description: "AGENTS.md four-command gate (format, test, astro check, build) + format:check idempotency leg all exit 0; astro check performed a real typecheck (Result line, 0 errors, no missing-dependency sentinel)"
    verification:
      - kind: other
        ref: "Task 3 <automated> verify chain — FORMAT1/TEST/ASTROCHECK/BUILD/FORMATCHECK all 0, dist/index.html exists"
        status: pass
    human_judgment: false
  - id: D4
    description: "commitlint CLI accepts all four emoji classes of the locked table and rejects bad + missing-emoji messages; hook chain probes green (SC#5)"
    verification:
      - kind: other
        ref: "Task 4 <automated> verify chain — GOOD1-4=0, BAD=1, NOEMOJI=1 with error tokens"
        status: pass
    human_judgment: false

duration: 9min
completed: 2026-10-15
status: complete
---

# Phase 0 Plan 01: Toolchain & Commit Gate Summary

**Nine devDeps locked, eight root configs written, husky's three hooks carrying their locked bodies, and the full AGENTS.md gate (`format → test → astro check → build`) plus commitlint gitmoji enforcement verified green end-to-end on the `phase-0-setup` branch.**

## Performance

- **Duration:** ~9 min
- **Started:** 2026-10-15T19:24:16Z
- **Completed:** 2026-10-15T19:33Z
- **Tasks:** 4
- **Files modified/created (committed):** 13 tracked + pnpm-workspace.yaml deviation; 1 untracked mirror

## Accomplishments

- ROADMAP Phase 0 SC#1–#5 all verified (see coverage block; per-SC evidence in task verify chains, captured under gitignored `.verify/`)
- Tracer task (Task 1) verified end-to-end and re-verified after commit before expansion — the configs + nine-package install hold in steady state
- Hook chain proven live: the Task 2 and Task 3 commits themselves passed through lint-staged (Biome check --write) and commitlint — real-world proof, not just dry-run
- `pnpm exec astro check` now performs a REAL typecheck via @astrojs/check 0.9.10: `Result (` summary, 0 errors, no missing-dependency sentinel
- Pre-push body kept at `pnpm test && pnpm build` — D3 preserved (astro check lives in the AGENTS.md gate only)

## Task Commits

Each task committed atomically:

1. **Task 1 (tracer): Install devDeps + root configs** — `0f9d0e6` (feat)
2. **Task 2: Husky hooks + sanity spec + plan mirror** — `c486026` (feat; hooks executed on this very commit)
3. **Task 3: AGENTS.md gate end-to-end** — `048f9db` (style; formatter-steady-state drift on biome.json was the only tracked mutation the gate produced)
4. **Task 4: Hook-chain probe (dry run)** — no commit by design (probe touches only `/tmp/hookprobe/` and gitignored `.verify/`)

**Plan metadata:** committed with SUMMARY (see git log).

## Files Created/Modified

- `package.json` — nine devDeps + 8 new scripts (+ `prepare: husky` by husky init)
- `pnpm-lock.yaml` — rewritten to cover the 256-package resolved tree
- `pnpm-workspace.yaml` — added `'@biomejs/biome': true` to `allowBuilds` (deviation, see below)
- `astro.config.mjs` — `base: '/darkfolio'`, `output: 'static'`, `server.host: true` preserved
- `tsconfig.json` — extends `astro/tsconfigs/strict`, ten path aliases, include `src/**` + `tests/**`
- `biome.json` — 4 lint rules at warn, LF/single-quote/semicolons-always, `files.include` (singular key)
- `commitlint.config.js` — ESM; `parserPreset.parserOpts.headerPattern` (flag-independent gitmoji, 3 capture groups) + `header-max-length` 72 pin
- `lint-staged.config.mjs` — single glob → `biome check --write`
- `vitest.config.ts` — happy-dom + `src/**/*.test.ts`
- `.gitignore` — Node/Astro ignores incl. `.opencode/`, `.codegraph/`, `.verify/`; `.planning/` NOT ignored (D2)
- `.nvmrc` (`22`), `README.md` (H1 + commands + spec pointer)
- `.husky/pre-commit` / `pre-push` / `commit-msg` — locked bodies
- `src/test/sanity.test.ts` — one passing spec with `ponytail:` rationale comment
- `.opencode/plan/darkfolio-plan.md` — local mirror of `.planning/PLAN.md` (mandate: PLAN.md §Phase 0 Agent Instructions; directory gitignored)

## Decisions Made

- Followed AGENTS.md branch rule and plan success criterion #7: work committed on `phase-0-setup` (branch off `master`), never on the protected trunk.
- Biome rules kept at severity `"warn"` per plan (stub drift must not block husky; promote to `error` later).
- Canon deviation surfaced, not silent: PLAN.md §"Biome Configuration" fifth rule `noDuplicateImports` does not exist in Biome 1.9.4 (unknown key → config invalid); implemented the four real rules per plan Step 4's pre-declared note.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Approved `@biomejs/biome` build script in `pnpm-workspace.yaml`**
- **Found during:** Task 1 (Step 1 devDep install)
- **Issue:** pnpm 12.9.1 hard-fails `pnpm install` (exit 1) with `ERR_PNPM_IGNORED_BUILDS` for biome's unapproved postinstall script — the Task 1 done criterion "`pnpm install` exited 0" was unreachable, and a fresh-machine clone would hit the same gate
- **Fix:** Added `'@biomejs/biome': true` to the existing `allowBuilds` map (the repo's established pattern; esbuild already approved there). Plan context said "leave alone" for this file, but its own done criterion supersedes; the package is the official Biome artifact (provenance established in threat T-00-07)
- **Files modified:** `pnpm-workspace.yaml`
- **Verification:** `pnpm install` exit 0, postinstall ran ("biome postinstall: Done"), `pnpm exec biome --version` prints 1.9.4
- **Committed in:** `0f9d0e6` (Task 1 commit)

**2. [Rule 1 - Bug] sanity.test.ts now imports vitest APIs explicitly**
- **Found during:** Task 2 (verify step `pnpm test`)
- **Issue:** The plan's locked spec body uses vitest globals (`describe`/`it`/`expect` bare), but the plan's locked `vitest.config.ts` deliberately omits `globals: true` (and Step 3 forbids `types: ["vitest/globals"]`) — vitest failed with `ReferenceError: describe is not defined`
- **Fix:** Kept the config exactly as locked; added `import { describe, expect, it } from 'vitest'` to the spec instead (smaller, more honest fix — the `expect(1 + 1).toBe(2)` acceptance grep still passes)
- **Files modified:** `src/test/sanity.test.ts`
- **Verification:** `pnpm test` → `1 passed`; TASK2_OK
- **Committed in:** `c486026` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking install-gate fix, 1 bug in the locked spec body). **Impact:** both were required for the plan's own done criteria to be reachable; no scope change, no contract change (all must_haves truths still hold verbatim).

## Issues Encountered

- `pnpm commitlint` script + hook arg produce `--edit --edit` (script body `commitlint --edit` plus hook's `"$1"` path). Flag is idempotent — commitlint validates correctly either way; both strings are plan-locked, left untouched.
- Pre-existing untracked scaffolding (`src/pages/index.astro`, `public/`, `opencode.jsonc`) was NOT staged: the plan's `files_modified` declares it untouched ("existing Astro stub stays"), and staging discipline says stage only task-declared files. Whoever lands the Phase 1 stub should commit these alongside it — flagged for the roadmap owner.
- `.planning/milestone.lock` and `.planning/state.json` appeared untracked during execution; left for the orchestrator (not plan-declared artifacts).
- `state.advance-plan` / `state.update-progress` reject this project's STATE.md "Current Position" bullet format (they require a bare `Current Plan: N of M` line the planner never wrote). Position was updated manually in STATE.md prose; frontmatter `progress.total_plans/completed_plans` left for the orchestrator/phase-verifier to recompute. `record-metric`, `add-decision`, `record-session`, and `roadmap.update-plan-progress` all applied normally.


## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 1 can commit freely: hooks, commit format enforcement, gate commands, path aliases, and test harness are all live and proven.
- `dist/index.html` builds with `base: '/darkfolio'` — Phase 8 deployment config has its prerequisite.
- Astro stub `src/pages/index.astro` typechecks clean under strict via @astrojs/check; Phase 1 GameCanvas integration can proceed without touching toolchain.
- Minor follow-up for canon docs (out of Phase 0 scope, pre-declared in plan Step 4): `.planning/PLAN.md` §"Biome Configuration" lists the nonexistent `noDuplicateImports` rule — worth a canon update.

## Verification Log Pointers

Task verify chains captured under gitignored `.verify/`: install.log, test2.log, format1.log, test.log, astrocheck.log, build1.log, formatcheck.log, good1-4/bad/noemoji logs. All five task-level verify runs exited 0; Task 3 re-run post-commit stayed green (idempotent formatter confirmed).

---
*Phase: 00-setup-foundation*
*Completed: 2026-10-15*

## Self-Check: PASSED
- All 16 key files present on disk (15 tracked + untracked mirror)
- All 3 task commits are ancestors of HEAD (`0f9d0e6`, `c486026`, `048f9db`)
