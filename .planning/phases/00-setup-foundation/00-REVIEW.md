---
phase: 00-setup-foundation
reviewed: 2026-10-15T22:05:00Z
depth: standard
files_reviewed: 16
files_reviewed_list:
  - .gitignore
  - .husky/commit-msg
  - .husky/pre-commit
  - .husky/pre-push
  - .nvmrc
  - README.md
  - astro.config.mjs
  - biome.json
  - commitlint.config.js
  - lint-staged.config.mjs
  - package.json
  - pnpm-workspace.yaml
  - src/test/commit-gate.test.ts
  - src/test/sanity.test.ts
  - tsconfig.json
  - vitest.config.ts
findings:
  critical: 1
  warning: 3
  info: 3
  total: 7
status: issues_found
---

# Phase 00: Code Review Report

**Reviewed:** 2026-10-15T22:05:00Z
**Depth:** standard (empirical — every hook command executed against live fixtures, not just read)
**Files Reviewed:** 16
**Status:** issues_found

## Summary

The declarative half of the toolchain is sound: `commitlint.config.js`'s gitmoji `headerPattern` (wired under `parserPreset.parserOpts`, 3 capture groups) and the 72-char cap were re-verified through the real CLI — `feat(game): missing emoji` exits 1, `✨/♻️/🚀` fixtures exit 0, oversized headers exit 1. Biome/tsconfig/astro/vitest configs match their locked values. Husky 9's `sh -e "$s" "$@"` shim correctly forwards `$1` to hook bodies, and hooks don't need exec bits.

However, the commit-msg hook's command is **broken in a way no artifact in this phase detects**: the package script already contains `--edit`, so `pnpm commitlint --edit "$1"` invokes the CLI with `--edit` **twice**, which makes commitlint ignore `$1` entirely and read `<toplevel>/.git/COMMIT_EDITMSG` instead. For plain `git commit` this passes by accident (same file); for `git merge` (which passes `$GIT_DIR/MERGE_MSG` as `$1`) it validates the stale previous message and lets a non-conforming merge commit land — a demonstrable commit-gate bypass.

## Critical Issues

### CR-01: commit-msg hook double-passes `--edit`; validates `.git/COMMIT_EDITMSG` instead of `$1` — merge-commit gate bypass

**File:** `.husky/commit-msg:1` (interacting with `package.json:17`)
**Issue:** The hook body is `pnpm commitlint --edit "$1"`, but the `commitlint` package script is itself `commitlint --edit`. pnpm appends hook args after the script command, so commitlint actually receives `commitlint --edit --edit <file>`. Verified against `@commitlint/cli@19.8.1` sources and empirically:

- `sh -e .husky/commit-msg /tmp/.../bad.txt` (content `bad message`) → **exit 0**
- `sh -e .husky/commit-msg /tmp/.../noemoji.txt` (content `feat(game): missing emoji`) → **exit 0**
- `pnpm exec commitlint --edit noemoji.txt` (single `--edit`) → exit 1 (rejects correctly)

With the doubled flag, yargs leaves `flags.edit` non-string; `normalizeFlags`/`getEditValue` pass it through and `read()` routes to `getEditCommit()`, which resolves the git root from **cwd** and hardcodes `.git/COMMIT_EDITMSG` (`@commitlint/read/lib/get-edit-file-path.js`). The `$1` file the hook was told to validate is never opened. For ordinary `git commit` the two paths coincide, masking the bug. But git invokes the commit-msg hook for **`git merge`** with `$1 = $GIT_DIR/MERGE_MSG` — commitlint then re-validates the last (valid) `COMMIT_EDITMSG` and the merge message escapes the gitmoji/72-char gate entirely. `git commit -t <file>` and other $1-divergent flows bypass identically. The phase's own verification missed this because Task 4 probed `pnpm commitlint /tmp/hookprobe/goodN.txt` (single `--edit` after script expansion) — never the hook's exact expanded argv — and `commit-gate.test.ts` pins only the config object, not the hook command.
**Fix:** Call the binary directly so `--edit` appears exactly once:
```sh
# .husky/commit-msg
pnpm exec commitlint --edit "$1"
```
(Alternatively revert `package.json` to `"commitlint": "commitlint"` and keep the hook body as-is — either single-`--edit` form works; the first keeps the script's convenience.)

## Warnings

### WR-01: Biome walks `.planning/` — `pnpm format --write` auto-rewrites project canon

**File:** `biome.json:38-44` (with `files.include` `**/*.json` at line 29-37)
**Issue:** `files.ignore` lists `.astro/**`, `dist/**`, `node_modules/**`, `.opencode/**`, `.verify/**` but **not** `.planning/**`. `biome check . --verbose` confirms `.planning/config.json` and `.planning/state.json` are in scope. AGENTS.md declares `.planning/` committed canon that agents must not hand-edit — but every `pnpm format` run can silently reformat it, and since GSD rewrites `state.json` between sessions, formatting drift in canon files can flip `pnpm format:check`/`pnpm lint` without any source change (and lint-staged would rewrite + re-stage a canon file during a commit whose message describes something else).
**Fix:**
```json
"ignore": [
  ".astro/**",
  ".planning/**",
  "dist/**",
  "node_modules/**",
  ".opencode/**",
  ".verify/**"
]
```

### WR-02: The gate test suite pins the config but not the hook wiring — CR-01 class of defect is undetectable

**File:** `src/test/commit-gate.test.ts:9-61`
**Issue:** The test's own comment states its purpose: catch "a future edit that moves headerPattern back to top level... instead of silently un-enforcing the commit format." It imports `commitlint.config.js` and asserts the pattern object — but nothing asserts the hook **invokes** commitlint correctly. The broken `--edit --edit` argv shipped green through `pnpm test`, Task 4's CLI probe, and the auditor's re-verification because every probe used single-`--edit` invocations. A config-only pin guards half the gate; the hook body × package-script interaction is the half that broke.
**Fix:** add one spec that runs the hook the way git does, in a scratch repo whose `COMMIT_EDITMSG` differs from the passed file (or, after fixing CR-01, the minimal version): assert `.husky/commit-msg` does not expand to a double `--edit` — e.g. read the hook body and the package script and assert `pnpm commitlint --edit` is not the composed command:
```ts
const hook = readFileSync('.husky/commit-msg', 'utf8');
const script = (pkg.scripts as Record<string, string>).commitlint;
expect(`${script} ${hook.match(/pnpm commitlint (.*)/)?.[1] ?? ''}`)
  .not.toMatch(/--edit[\s\S]*--edit/);
```

### WR-03: `package.json` lacks `"private": true`

**File:** `package.json:1-4`
**Issue:** Name `darkfolio`, version `1.0.0`, no `private` flag. A mistyped `pnpm publish`/`npm publish` (or a future script/CI job doing `publish --access public`) would push the personal-portfolio package to the public registry — an information-disclosure path the field exists to close. One-word fix, standard guard for non-library apps.
**Fix:** add `"private": true,` to package.json.

## Info

### IN-01: All four Biome lint rules are `"warn"` — no gate command can ever fail on them

**File:** `biome.json:11-20`
**Issue:** `biome check`/`biome format` exit 0 when diagnostics are only warnings (no `--error-on-warnings` anywhere), so `noConsoleLog`/`noUnused*` can never block a commit, push, or the AGENTS gate. This matches the plan's deliberate D-choice ("severity warn keeps existing stubs from blocking husky"), so it is recorded as an awareness note, not a defect. If enforcement is ever wanted: `"lint": "biome check --error-on-warnings ."`.

### IN-02: tsconfig `include` references `tests/**/*`, a directory that does not exist

**File:** `tsconfig.json:18`
**Issue:** Tests actually live in `src/test/` (already covered by `src/**/*`). The `tests/**/*` entry is the plan's declared forward-compat include and is inert; harmless but slightly misleading about where tests go. The fix commit 2083633 correctly repaired `src/**` → `src/**/*` (`**` alone matches only directories).

### IN-03: Duplicate scripts `lint` and `check:biome`

**File:** `package.json:12-13`
**Issue:** Both are exactly `biome check .`. Plan-mandated (AGENTS.md/README reference `lint`; canon references `check:biome`), so kept for convention compatibility — noting the duplication only.

---

_Reviewed: 2026-10-15T22:05:00Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_
