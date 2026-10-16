---
phase: 00-setup-foundation
plan: 01
status: gaps-found
created: 2026-10-15
validated_by: nyquist validate-phase step
coverage:
  - id: SC#1
    description: "astro.config.mjs exists with base /darkfolio AND output static AND server.host true"
    type: config-content-check
    status: covered
    command: "grep -F \"/darkfolio\" astro.config.mjs && grep -F \"output: \" astro.config.mjs && grep -F \"host: true\" astro.config.mjs"
    evidence: "all three greps hit (verified 2026-10-15 post-validation re-run); pnpm build exit 0 and dist/index.html exists, built under the base path"
  - id: SC#2
    description: "tsconfig.json extends astro/tsconfigs/strict AND declares the ten path aliases"
    type: config-content-check
    status: BLOCKER
    command: "pnpm exec tsc -p tsconfig.json --noEmit"
    evidence: "content greps pass (extends strict, 10 aliases present, tsc --showConfig variant confirms strict:true resolves) BUT the file is INVALID for tsc: include entries 'src/**' and 'tests/**' end in a bare recursive wildcard → TS5010 x2 + TS18003, tsc exits 2. Declared-but-broken config does not deliver the criterion's intent."
  - id: AGENTS-gate-leg
    description: "pnpm exec astro check performs a REAL typecheck"
    type: gate-command
    status: BLOCKER
    command: "pnpm exec astro check"
    evidence: "exit 0 and prints 'Result (' with no missing-dependency sentinel (plan's own greps satisfied) — but the line reads 'Result (0 files)'. ZERO files are analyzed. Consequence of the SC#2 broken include globs: the typecheck leg is vacuous. Any future TS error in src/ passes the gate silently. The plan's <automated> verify never asserted a nonzero file count — verification gap that let this ship."
  - id: SC#3
    description: "Pre-commit hook fires pnpm lint-staged so staged JS/TS/JSON pass biome check --write"
    type: hook-behavior
    status: covered
    command: "grep -F 'pnpm lint-staged' .husky/pre-commit && node -e 'import(\"./lint-staged.config.mjs\").then(m => process.exit(Object.keys(m.default).length === 1 ? 0 : 1))'"
    evidence: "hook body + single-glob config verified; live firing proven twice: 0f9d0e6/c486026 passed through the hooks, and validation commit 13309a7 (new test file) was formatted-checked by lint-staged on this very session's commit — real commits, not dry runs"
  - id: SC#4
    description: "Pre-push hook body invokes pnpm test AND pnpm build; astro check kept out per D3"
    type: hook-behavior
    status: covered
    command: "grep -F 'pnpm test && pnpm build' .husky/pre-push && git config core.hooksPath"
    evidence: "body is the locked one-liner, no astro check present; core.hooksPath = .husky/_ (husky wired); pnpm test (2 files 6 tests pass) and pnpm build (exit 0, dist/index.html) re-verified green during validation"
  - id: SC#5
    description: "commit-msg enforces gitmoji + conventional format and the 72-char cap through the real CLI"
    type: unit-test
    status: covered
    command: "pnpm test"
    evidence: "src/test/commit-gate.test.ts (5 specs, committed 13309a7) permanently pins: parserPreset.parserOpts wiring (top-level headerPattern must be absent — the commitlint-19 dead-key regression class), header-max-length pinned [2,'always',72], all locked gitmoji table classes accepted under both RegExp flag modes, no-emoji/bad-type/garbage rejected, 3-capture-group correspondence. Mutation-probed IN the runner: flattened-config and dropped-emoji-class mutants both failed these assertions before cleanup. Fresh CLI probe: good1-4 exit 0; bad / missing-emoji / 200-char header exit 1"
ambiguities:
  - "ROADMAP SC#2 wording 'declares strict: true' vs implementation 'extends astro/tsconfigs/strict' — plan's must_haves authorize the extends form; tsc --showConfig on a fixed-include variant resolves strict: true, so intent is met once the include bug is fixed"
gaps_filled:
  - SC#5: ephemeral Task-4 /tmp probe → permanent vitest spec (this was the only genuine no-reusable-check must-have; all other config criteria are content-check-appropriate per phase type — inventing fixtures for them is forbidden by AGENTS.md)
escalations:
  - id: TS5010-BROKEN-TSCONFIG-INCLUDE
    severity: blocker
    requirement: SC#2 + "astro check performs a REAL typecheck" must-have
    file: tsconfig.json
    symptom: "tsc -p tsconfig.json --noEmit exits 2 (TS5010 'File specification cannot end in a recursive directory wildcard' on src/** and tests/**; TS18003 no inputs). astro check consequently reports 'Result (0 files)' — the AGENTS.md gate's typecheck leg verifies nothing."
    root-cause: "Plan Step 3 locked the literal include [\"src/**\", \"tests/**\"]; tsc requires a terminal segment after ** (e.g. src/**/*). Canon defect inherited verbatim by the executor."
    suggested-fix: "Change include to [\"src/**/*\", \"tests/**/*\"] (two characters). Then re-run pnpm exec astro check and require 'Result (N files)' with N ≥ 2 (sanity + commit-gate specs, plus src/pages/index.astro once tracked). Consider adding the nonzero-file-count assertion to any future gate-leg checks."
    proof_fix_works: "validated during this audit: tsconfig variant with src/**/* → tsc --noEmit exit 0 over the full current src/ (including the new commit-gate spec); --showConfig resolves strict: true and all ten aliases"
---

# Phase 0 Validation — Setup (Foundation)

Toolchain phase; per phase type the "tests" are the AGENTS.md gate commands, hook behavior, and config content checks. Vitest coverage was added only where logic is genuinely separable and was left unpinned after execution (SC#5's pattern contract).

## Criterion coverage

| # | Criterion | Status | Re-runnable check | Evidence |
|---|-----------|--------|-------------------|----------|
| 1 | astro.config base /darkfolio + static + host | ✅ COVERED | greps above + `pnpm build` | all green, re-run 2026-10-15; `dist/index.html` emitted |
| 2 | tsconfig strict + ten aliases | 🚨 BLOCKER | `pnpm exec tsc -p tsconfig.json --noEmit` | content present, config **invalid**: TS5010 on both include entries, exit 2 — see escalation |
| — | astro check = real typecheck (gate leg) | 🚨 BLOCKER | `pnpm exec astro check` | exit 0 but **`Result (0 files)`** — vacuous leg, consequence of #2 |
| 3 | pre-commit → lint-staged → biome | ✅ COVERED | grep + ESM load probe | live-fired on real commits incl. this session's `13309a7` |
| 4 | pre-push = test && build (no astro check) | ✅ COVERED | grep + `git config core.hooksPath` | body locked-correct; both legs green on re-run; hooksPath `.husky/_` |
| 5 | commit-msg gitmoji + conventional + 72 cap | ✅ COVERED (upgraded) | `pnpm test` | new `src/test/commit-gate.test.ts` (5 specs) + fresh CLI probe incl. 72-char rejection |

## Gate re-run (validation session, all fresh)

`pnpm format:check` 0 · `pnpm test` 0 (2 files / 6 tests) · `pnpm exec astro check` 0 *but 0 files* · `pnpm build` 0 (+ `dist/index.html`) · commitlint CLI: good ×4 = 0, bad/no-emoji/long-header = 1 · `git config core.hooksPath` = `.husky/_`.

## Gap filled by this validation

**SC#5 → permanent unit coverage.** The gitmoji enforcement was proven only ephemerally (inline node probe in Task 1 verify + `/tmp/hookprobe` fixtures in Task 4 — nothing re-runnable). Any future edit flattening `headerPattern` to a top-level key (commitlint 19 ignores it there — the exact T-00-01 spoofing threat) would silently un-enforce the format with every existing check still green. `src/test/commit-gate.test.ts` now fails `pnpm test` (hence every pre-push) on that regression class. Falsifiability proven: config mutants run inside vitest failed exactly the paired assertions before removal. Committed `13309a7` through the live husky chain.

## Escalation — TS5010: tsconfig include globs are invalid (BLOCKER)

**Requirement:** SC#2 (strict + aliases usable) and the must-have "astro check performs a REAL typecheck."

**What actually happens (repro):**

```
pnpm exec tsc -p tsconfig.json --noEmit        # exit 2
# tsconfig.json(18,15): error TS5010: File specification cannot end in
#   a recursive directory wildcard ('**'): 'src/**'.        (same for 'tests/**')
# error TS18003: No inputs were found in config file
pnpm exec astro check                           # exit 0 — but "Result (0 files)"
```

**Impact:** every tsc-based consumer of tsconfig.json fails today; the AGENTS.md typecheck leg inspects zero files, so Phase 1+ type errors would pass the gate silently. The plan's verify gate (exit code + `Result (` line + sentinel absence) is satisfied by a vacuous run — the file-count gap in the check let this through.

**Fix (developer/executor, not this auditor — implementation is read-only here):** `include: ["src/**/*", "tests/**/*"]` in `tsconfig.json`. Proven during this audit: a variant with exactly that change compiles the current `src/` clean (exit 0) and resolves `strict: true` + all ten aliases via `--showConfig`. After fixing, re-run `pnpm exec astro check` and expect a nonzero file count.

**Origin note:** the plan's Step 3 dictated the literal `["src/**", "tests/**"]` — canon defect (`.planning/PLAN.md` §Path Aliases area), inherited verbatim. Flag for canon correction alongside the known `noDuplicateImports` stale entry.
