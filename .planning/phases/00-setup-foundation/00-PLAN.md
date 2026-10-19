---
phase: 00-setup-foundation
plan: 01
plan_slug: toolchain-commit-gate
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - pnpm-lock.yaml
  - astro.config.mjs
  - tsconfig.json
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
  - .opencode/plan/darkfolio-plan.md
  # Conditional fallbacks — Task 3 touches these ONLY if `astro check` fails on the
  # existing stub (one minimal round of edits; see Task 3 step 3 fallback rules):
  - src/pages/index.astro
  - src/content.config.ts
autonomous: true
requirements: []
requirements_addressed: []
user_setup: []
estimate:
  tokens: 32000
  raw_tokens: 19000
  tasks: 4
  confidence: low
schema_version: "1"

must_haves:
  truths:
    - "SC#1: astro.config.mjs exists with base /darkfolio AND output static AND server.host true"
    - "SC#2: tsconfig.json extends astro/tsconfigs/strict AND declares the ten path aliases (@/*, @/components/*, @/game/*, @/systems/*, @/scenes/*, @/objects/*, @/data/*, @/styles/*, @/layouts/*, @/pages/* — mapping per .planning/PLAN.md §'Path Aliases': @/* and @/components/*, @/styles/*, @/layouts/*, @/pages/* into src/* directly; @/systems/*, @/scenes/*, @/objects/*, @/data/* under src/game/)"
    - "AGENTS.md gate leg: `pnpm exec astro check` performs a REAL typecheck — @astrojs/check is installed, the run prints astro-check's `Result (` summary line, and the log never contains 'requires the following dependency'"
    - "SC#3: Pre-commit hook fires pnpm lint-staged so committed TS/JS/JSON/MJS/CJS files pass biome check --write"
    - "SC#4: Pre-push hook body invokes pnpm test AND pnpm build (vitest + Astro static build); astro check deliberately kept out per D3"
    - "SC#5: commit-msg hook invokes pnpm commitlint --edit $1; commitlint.config.js wires the gitmoji-requiring headerPattern through parserPreset.parserOpts (the ONLY path commitlint 19.8.1's selectParserOpts reads — top-level headerPattern is dead config) with exactly 3 capture groups (type, scope, subject) so the default headerCorrespondence binds, and enforces the 72-char cap via rules['header-max-length'] = [2, 'always', 72]"
  artifacts:
    - path: package.json
      provides: "scripts block (format, format:check, lint, check:biome, astro:check, test, test:watch, commitlint, prepare:husky) plus devDependencies (9 packages: the locked 8-package batch + @astrojs/check@^0.9 surfaced by the checker gate so astro check does a real typecheck)"
      contains: "\"format\": \"biome format --write .\""
    - path: astro.config.mjs
      provides: "Astro 7 static-output configuration"
      contains: "base: '/darkfolio'"
    - path: tsconfig.json
      provides: "TypeScript strict + ten path aliases"
      contains: "\"@/*\": [\"src/*\"]"
    - path: biome.json
      provides: "Biome 1.9 lint + format config (four rules — canon's fifth is a nonexistent key in 1.9.4, see Step 4 deviation note; LF line endings, single quotes, semicolons-always)"
      contains: "noConsoleLog"
    - path: .husky/pre-commit
      provides: "triggers `pnpm lint-staged` on every commit"
      contains: "pnpm lint-staged"
    - path: .husky/pre-push
      provides: "triggers vitest + build before push (astro check excluded per D3)"
      contains: "pnpm test && pnpm build"
    - path: .husky/commit-msg
      provides: "triggers commitlint on every commit message"
      contains: "pnpm commitlint --edit \"$1\""
    - path: commitlint.config.js
      provides: "conventional-commits config whose gitmoji headerPattern lives under parserPreset.parserOpts (commitlint 19's only read path) + rules['header-max-length'] 72 cap"
      contains: "parserPreset"
    - path: lint-staged.config.mjs
      provides: "Biome check+write on staged JS/TS/JSON glob"
      contains: "biome check --write"
    - path: vitest.config.ts
      provides: "vitest wired with happy-dom and src/**/*.test.ts discovery"
      contains: "environment: 'happy-dom'"
    - path: src/test/sanity.test.ts
      provides: "one passing vitest spec so husky pre-push's pnpm test exits 0"
      contains: "expect(1 + 1).toBe(2)"
    - path: .gitignore
      provides: "gitignores .opencode/, node_modules/, dist/, .astro/, .codegraph/, coverage/, .verify/ (verify scratch logs); commits .planning/ per D2"
      contains: ".opencode/"
    - path: .nvmrc
      provides: "Node version pin"
      contains: "22"
    - path: .opencode/plan/darkfolio-plan.md
      provides: "opencode-runtime mirror of `.planning/PLAN.md` (gitignored, local only)"
    - path: src/pages/index.astro
      provides: "CONDITIONAL (Task 3 fallback only) — existing stub; touched with one minimal type-annotation edit only if astro check fails on it"
      contains: ""
    - path: src/content.config.ts
      provides: "CONDITIONAL (Task 3 fallback only) — created only if astro check demands a content-collections stub; otherwise absent"
      contains: ""
  key_links:
    - from: .husky/pre-commit
      to: lint-staged.config.mjs
      via: "executes `pnpm lint-staged` which loads lint-staged.config.mjs and applies its glob"
      pattern: "pnpm lint-staged"
    - from: .husky/commit-msg
      to: commitlint.config.js
      via: "executes `pnpm commitlint --edit` which reads commitlint.config.js parserPreset.parserOpts.headerPattern (commitlint 19 cli.js selectParserOpts path) and rejects bad subjects"
      pattern: "parserPreset"
    - from: .husky/pre-push
      to: src/test/sanity.test.ts
      via: "executes `pnpm test` which uses vitest.config.ts to discover src/**/*.test.ts; if zero tests, husky pre-push fails"
      pattern: "src/\\*\\*/\\*\\.test\\.ts"
    - from: package.json
      to: scripts
      via: "scripts block is the entry point for ALL AGENTS.md pre-commit gate commands (format, test, astro:check, build)"
      pattern: "\"format\": \"biome"
    - from: ROADMAP Phase 0 SC#1..#5
      to: must_haves.truths
      via: "every ROADMAP success criterion maps 1:1 into a must_haves.truths row above"
      pattern: "SC#\\d"

threat_model:
  trust_boundaries:
    - boundary: developer-machine → repo
      description: "Developer commits source code; husky pre-commit + commit-msg enforce formatting and message format locally"
    - boundary: developer-machine → remote (later)
      description: "Pre-push fires vitest + build before remote submission; remote is reachable only if pre-push passes"
  stride_register:
    - id: T-00-01
      category: Spoofing
      component: "commitlint regex too lax"
      severity: medium
      disposition: mitigate
      mitigation: "headerPattern uses a flag-independent emoji prefix (BMP code-point range + literal SMP emoji + optional VS-16) — verified in BOTH new RegExp(p) and new RegExp(p, 'u') compilations by Task 1's inline node probe — AND the pattern is genuinely wired (not dead config): Task 4 runs the real commitlint CLI on a missing-emoji fixture ('feat(game): missing emoji') and asserts exit non-zero, which a regex-only probe cannot catch because commitlint 19 only reads parser options via parserPreset.parserOpts"
    - id: T-00-02
      category: Tampering
      component: "pnpm test exits non-zero on empty test set, breaking pre-push"
      severity: medium
      disposition: mitigate
      mitigation: "Task 2 ships src/test/sanity.test.ts so vitest finds at least one passing test"
    - id: T-00-03
      category: Repudiation
      component: "developer claims format passes but skipped formatting"
      severity: low
      disposition: accept
      mitigation: "AGENTS.md pre-commit gate runs pnpm format manually before push; husky lint-staged covers staged files only"
    - id: T-00-04
      category: "Information disclosure"
      component: "n/a"
      severity: low
      disposition: accept
      mitigation: "No external services touched in Phase 0"
    - id: T-00-05
      category: "Denial of service"
      component: "husky pre-push blocking too long"
      severity: low
      disposition: mitigate
      mitigation: "Pre-push is pnpm test && pnpm build (vitest+happy-dom fast on empty set; astro build short on 1 stub page); astro check deliberately excluded per D3 (otherwise 5-8s added)"
    - id: T-00-06
      category: "Elevation of privilege"
      component: "n/a"
      severity: low
      disposition: accept
      mitigation: "No auth or user input in Phase 0"
    - id: T-00-07
      category: Tampering
      component: "pnpm add of surfaced new devDep @astrojs/check"
      severity: high
      disposition: mitigate
      mitigation: "Package-legitimacy gate: @astrojs/check@0.9.10 ships npm provenance attestation (SLSA v1, trusted publisher = GitHub Actions in withastro/astro monorepo — verified against registry.npmjs.org during planning); version pinned to ^0.9 in Step 1's batch; install itself was surfaced to and approved by the developer via the checker-gate revision note before this plan lands"
---

<objective>
Wire every toolchain leg in one go: install all nine devDeps (the locked eight-package batch plus `@astrojs/check` — surfaces: new devDep per checker gate, developer-approved in the revision run; without it `pnpm exec astro check` silently checks nothing), write the eight root-level config files Phase 0 calls for, init husky's three hooks (with the locked body per `.planning/PLAN.md` §"Husky Hooks"), seed one passing Vitest spec so the pre-push `pnpm test` exits 0, and stage a local mirror of the canonical plan. After this plan lands, a developer can `pnpm install && pnpm test && pnpm build`, the AGENTS.md pre-commit gate is enforceable against any future commit, and the locked `<emoji> <type>(<scope>): <subject>` commit format is mechanically enforced by commitlint. Tracing the single happy path: developer edits `src/test/sanity.test.ts` → runs `git add . && git commit -m "✨ chore(deps): add commit hooks in .husky/"` → husky pre-commit fires lint-staged → biome formats the diff → husky commit-msg fires commitlint → message passes headerPattern → commit lands.

**User story framing (per MVP_MODE):** **As a** Darkfolio maintainer, **I want to** clone the repo to a fresh machine and have `pnpm install && pnpm test && pnpm build` all green and a real `git commit` filtered through husky + Biome + commitlint, **so that** every Phase 1+ commit is structurally correct and the AGENTS.md pre-commit gate is enforceable without manual re-setup.

**Why this is a tracer, not horizontal layering:** Phase 0 is foundation; the "thin slice that touches every layer" is the toolchain itself. Wiring Biome + Vitest + Astro + Husky + Commitlint end-to-end IS the deliverable — there is no domain layer to defer. Task 1 (configs) and Task 2 (hooks + sanity) split at the husky boundary to keep each task inside its context budget; Tasks 3–4 close the AGENTS.md gate (which is the Phase 0 goal from ROADMAP) and probe the hook chain — horizontal expansion of the proven slice.
</objective>

<execution_context>
@/home/jetson/github/darkfolio/.opencode/gsd-core/workflows/execute-plan.md
@/home/jetson/github/darkfolio/.opencode/gsd-core/templates/summary.md
</execution_context>

<context>
@/home/jetson/github/darkfolio/.planning/PLAN.md      (Phase 0: Setup section, Tech Stack, Biome Configuration, Husky Hooks, Path Aliases, Commit Format)
@/home/jetson/github/darkfolio/.planning/PROJECT.md    (D1 TS ^5; D2 .planning/ committed; D3 astro check out of husky hooks)
@/home/jetson/github/darkfolio/.planning/ROADMAP.md    (Phase 0 Success Criteria #1–#5)
@/home/jetson/github/darkfolio/AGENTS.md              (Pre-commit gate four-command floor; commit format `<emoji> <type>(<scope>): <subject>`, ≤72 chars; Never list — do NOT edit AGENTS.md without asking)
@/home/jetson/github/darkfolio/package.json           (scripts section is extended; devDependencies populated; prepare:husky added by husky init)
@/home/jetson/github/darkfolio/astro.config.mjs       (host:true MUST be preserved; base + output added)
@/home/jetson/github/darkfolio/tsconfig.json          (currently extends astro/tsconfigs/base — switch to strict + add path aliases)
@/home/jetson/github/darkfolio/pnpm-workspace.yaml    (allowBuilds.esbuild: true — leave alone)
</context>

<tasks>

<task type="tracer">
  <name>Task 1 (tracer): Install the nine devDeps + write every root-level config — wires the toolchain's declarative half end-to-end</name>
  <files>
    - /home/jetson/github/darkfolio/package.json
    - /home/jetson/github/darkfolio/pnpm-lock.yaml
    - /home/jetson/github/darkfolio/astro.config.mjs
    - /home/jetson/github/darkfolio/tsconfig.json
    - /home/jetson/github/darkfolio/biome.json
    - /home/jetson/github/darkfolio/commitlint.config.js
    - /home/jetson/github/darkfolio/lint-staged.config.mjs
    - /home/jetson/github/darkfolio/vitest.config.ts
    - /home/jetson/github/darkfolio/.gitignore
    - /home/jetson/github/darkfolio/.nvmrc
    - /home/jetson/github/darkfolio/README.md
  </files>
  <read_first>
    - /home/jetson/github/darkfolio/package.json (scripts block to extend; type:module and packageManager pins)
    - /home/jetson/github/darkfolio/astro.config.mjs (preserve server.host: true)
    - /home/jetson/github/darkfolio/tsconfig.json (current extends target to switch)
    - /home/jetson/github/darkfolio/.planning/PLAN.md §"Phase 0: Setup", §"Path Aliases", §"Biome Configuration" (locked values this task writes)
    - /home/jetson/github/darkfolio/pnpm-workspace.yaml (allowBuilds — leave alone)
  </read_first>
  <done>
    - All root-level config files exist with the locked identifiers from the spec (`/darkfolio` base, static output, `host: true`, strict tsconfig, ten path aliases, four biome rules, flag-safe gitmoji headerPattern regex wired through parserPreset.parserOpts, single glob to biome, happy-dom vitest, `.opencode/` + `.verify/` gitignored)
    - `pnpm install` exited 0 with all nine devDeps persisted in `package.json` and `pnpm-lock.yaml`
    - `pnpm exec biome/vitest/lint-staged/commitlint --version` all exit 0 (proves the BINARIES are linked from node_modules/.bin into PATH and the config files load; husky is deliberately excluded — husky 9's argv parser treats `--version` as the hooks DIRECTORY and would repoint `core.hooksPath` at a stray `--version/_` dir; Task 2's `husky init` + `core.hooksPath` assertion is the husky proof)
    - The commitlint pattern string, loaded from the written config at `parserPreset.parserOpts.headerPattern` with `rules['header-max-length']` pinned to 72, accepts `✨ feat(game): add player movement`, `♻️ refactor(game): tidy loop` (VS-16 form), `🚀 chore(config): point build at pages`, and `🐛 fix(pages): guard null params` under BOTH `new RegExp(p)` and `new RegExp(p, 'u')` compilation, yields exactly type/scope/subject capture groups 1–3 for the default headerCorrespondence, and rejects a bare `bad message`
  </done>
  <precondition>Repo on master with `astro ^7.3.5` already in package.json `dependencies`; existing `src/pages/index.astro` stub is left untouched. pnpm 12.9.1 on PATH (matches the `packageManager` pin in package.json).</precondition>
  <action>
    Run each step in order. Each step is small and idempotent — do NOT skip ahead.

    **Step 1 — Install the devDeps batch (single pnpm invocation).** Run `pnpm add -D @biomejs/biome@^1.9 husky@^9 lint-staged@^15 vitest@^2 happy-dom@^15 @commitlint/cli@^19 @commitlint/config-conventional@^19 typescript@^5 @astrojs/check@^0.9`. This populates package.json `devDependencies` and grows `pnpm-lock.yaml`. Lockfile changes are expected — committing them keeps the install reproducible per Phase 0 verification. # surfaces: new dep — `@astrojs/check` is NOT in the locked eight-package batch in `.planning/PLAN.md` §"Phase 0" nor in §"Tech Stack"; the checker gate established that without it `pnpm exec astro check` prints an Astro missing-dependency install prompt (sentinel string asserted in Task 3's verify), shows an interactive prompt, and exits 0 while checking NOTHING — which silently voids the AGENTS.md gate leg (D3 keeps the leg, and a vacuous leg is worse than no leg). The developer approved surfacing it in this revision run. `^0.9` resolves to 0.9.10 (registry-checked: SLSA provenance, trusted publisher `github:withastro/astro`; peer `typescript ^5.0.0 || ^6.0.0` — satisfied by D1's `typescript@^5`).

    **Step 2 — `astro.config.mjs`.** Replace the one-line body with `import { defineConfig } from 'astro/config'; export default defineConfig({ base: '/darkfolio', output: 'static', server: { host: true } });` — **single quotes throughout** (see the quote-convention note under Step 4; Biome's `quoteStyle: 'single'` will rewrite any double-quoted JS/TS source you write, so write the convention from the start and every later grep is deterministic). The literal substring `host: true` MUST stay — the existing file already has it. Astro expects `base` to be an absolute path with a leading slash; Phase 8 reads `'static'` indirectly via `astro build`.

    **Step 3 — `tsconfig.json`.** Replace contents with: extended from `"astro/tsconfigs/strict"` (this surgical baseline already sets `strict: true`), `compilerOptions.baseUrl: "."`, the `paths` object copied EXACTLY from `.planning/PLAN.md` §"Path Aliases" — note two mapping groups: `@/*`, `@/components/*`, `@/styles/*`, `@/layouts/*`, `@/pages/*` map into `src/<subdir>/*` directly, while `@/game/*`, `@/systems/*`, `@/scenes/*`, `@/objects/*`, `@/data/*` map into `src/game/…` (systems/scenes/objects/data are UNDER `src/game/` — do not flatten them to `src/systems/*`), plus `include: ["src/**", "tests/**"]` (JSON uses double quotes; Biome never rewrites JSON quoting). Do NOT add `"types": ["vitest/globals"]` — Vitest is invoked via `pnpm test` (not `tsc`), and `tests/` is not yet a directory; the include is forward-compat.

    **Step 4 — `biome.json`.** Write a Biome 1.9 JSON config: top-level keys are `formatter` (object with `enabled: true`, `indentStyle: "space"`, `indentWidth: 2`, `lineEnding: "lf"`), `linter` (object with `enabled: true` and a `rules` block listing the four spec rules with severity `"warn"`: `noConsoleLog`, `noUnusedImports`, `noUnusedVariables`, `noUnusedFunctionParameters` — Biome 1.9 organizes these as `linter.rules.<category>.<ruleName>`; place each in its canonical category: `suspicious.noConsoleLog`, `correctness.noUnusedImports`, `correctness.noUnusedVariables`, `correctness.noUnusedFunctionParameters`; severity `"warn"` (not `"error"`) keeps existing stubs from blocking husky if they drift — the AGENTS.md gate can promote to `"error"` later when false positives are confirmed absent), `javascript` (formatter sub-object with `quoteStyle: "single"`, `semicolons: "always"` — the key is plural `semicolons`; `semicolon` is an unknown key and Biome 1.9.4 exits 1 on config errors; trailing-comma defaults are fine — DO NOT set if unsure), and `files` (object with key **`include`** — singular; Biome 1.9's key is `files.include`, and an unknown key like `includes` makes Biome treat the whole config as invalid, so `pnpm format`/`pnpm lint` would exit non-zero — with value `["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.mjs", "**/*.cjs", "**/*.json"]`, and key `ignore` with `[".astro/**", "dist/**", "node_modules/**", ".opencode/**", ".verify/**"]`). **Deviation note (surfaced, not silent):** `.planning/PLAN.md` §"Biome Configuration" lists a fifth rule, `noDuplicateImports` — measured against Biome 1.9.4 that rule does not exist in its correctness set, and Biome errors out ("Found an unknown key") on configs that reference it, which would fail every `pnpm format`/`pnpm format:check` run. This plan implements the four rules Biome 1.9 actually has; the canon table is the stale side (it predates the 1.9 rule registry — flag for a future canon doc update, out of Phase 0 scope). Quote convention for the whole plan, stated once here: because `quoteStyle` is `single`, every `.ts`/`.js`/`.mjs` file you write in this plan must be authored with single-quoted strings from the start — Biome would rewrite double quotes on the first `pnpm format`, and greps written against your source stay deterministic when source and formatter agree before the first run.

    **Step 5 — `commitlint.config.js`.** package.json has `"type": "module"`, so a `.js` file is parsed as ESM. Write an ESM default export (NOT `module.exports =`, which throws `ReferenceError: module is not defined` here; commitlint 19 loads ESM configs fine) with exactly these top-level keys: `extends: ['@commitlint/config-conventional']`; `parserPreset` — an object whose sole key `parserOpts` is an object carrying `headerPattern: '<PATTERN>'`; and `rules` — an object with `'header-max-length': [2, 'always', 72]`. The nesting is load-bearing, not stylistic: measured against `@commitlint/cli@19.8.1`, cli.js reads parser options ONLY via `loaded.parserPreset` (`selectParserOpts(loaded.parserPreset)`) — a top-level `headerPattern`/`headerMaxLength` are dead config keys with zero references in the dist. With top-level keys the default conventional parser rejects the emoji prefix (all good fixtures exit 1) while `feat(game): missing emoji` exits 0 — SC#5's gitmoji requirement and 72-cap silently unenforced. Hence: `headerPattern` goes inside `parserPreset.parserOpts`, and the 72 cap goes in `rules['header-max-length']: [2, 'always', 72]` (the config-conventional preset already carries this rule; restating it pins the value at 72 per AGENTS.md).

    Where `<PATTERN>` is (as a JS single-quoted string with `\\u` double-backslash escapes so the runtime string value carries the `\u` escapes for RegExp itself): `^(?:[\\u2190-\\u2BFF\\u3030\\u303D]|🐛|📝|🎨|🔧|🚀|💡|🔥|🌱|🔒|👷|🔖|🚨|🎯|🚑|💬|📦|🔄|🚧)(?:\\uFE0F)?\\s+(feat|fix|refactor|perf|test|docs|style|chore|build|ci)(?:\\(([a-z0-9-]+)\\))?!?:\\s(.+)`. **Exactly three capture groups, in order type → scope → subject**, because commitlint's default `headerCorrespondence` is `[type, scope, subject]` and needs group 3 for the subject: group 1 = the type alternation, the scope's OUTER parens are non-capturing `(?:\\(...\\))?` so the INNER `([a-z0-9-]+)` lands as group 2, and the subject `(.+)` is group 3. Do not convert any of these to non-capturing beyond the scope wrapper, and do not add groups. Why the emoji prefix shape (do not "simplify" it): conventional-commits-parser compiles `headerPattern` with an unspecified flag set, so the pattern must be correct under BOTH `new RegExp(p)` and `new RegExp(p, 'u')` — Unicode property escapes (`\\p{Emoji_Presentation}`) and lone-surrogate classes each fail one of the two modes (measured: property escapes reject `♻️` even with `u`; surrogate-pair classes reject every astral emoji with `u`). The verified shape is: a BMP code-point range class (`\\u2190-\\u2BFF` covers ✨ `\\u2728`, `♻ \\u267B`, `⚡ \\u26A1`, `✅ \\u2705` and the rest of the PLAN.md §"Commit Format" BMP entries; `\\u3030`/`\\u303D` add the wave-dash gitmoji strays outside the range), plus LITERAL astral emoji from the locked table and common gitmoji (🐛📝🎨🔧🚀💡🔥🌱🔒👷🔖🚨🎯🚑💬📦🔄🚧 — literal pairs match identically in both flag modes), plus `(?:\\uFE0F)?` so `♻️`-style VS-16 forms pass (VS-16 tolerance was the old pattern's measured defect). Then optional scope, then one of the ten AGENTS.md types, then `: <subject>`. Task 1's verify probe locks the wiring + grouping + matching in; Task 4 locks it through the real CLI. If a probe fails, fix the PATTERN or the nesting, do not swap in property escapes.

    **Step 6 — `lint-staged.config.mjs`.** Write `export default { '*.{ts,tsx,js,jsx,mjs,cjs,json}': ['biome check --write'] };` (single quotes per the Step 4 convention). Single glob, single command. Don't add prettier, eslint, or vitest stages — Phase 0 only formats and lints via Biome.

    **Step 7 — `vitest.config.ts`.** Import `defineConfig` from `vitest/config` (NOT from `vitest`; the config helper lives in `vitest/config`). Return `{ test: { environment: 'happy-dom', include: ['src/**/*.test.ts'] } }` (single quotes per the Step 4 convention). `include` is relative to the config file's directory (repo root); the `src/test/sanity.test.ts` seeded in Task 2 crosses it.

    **Step 8 — `.gitignore`.** Write a Node/Astro-standard ignore set: `node_modules/`, `dist/`, `.astro/`, `.codegraph/`, `.opencode/`, `.verify/` (verify scratch logs written by every task's `<verify>` chain), `coverage/`, `*.log`, `.DS_Store`, `.env`, `.env.local`, `.env.*.local`. Explicitly DO NOT add a `.planning` line <!-- planner-discipline-allow: .planning --> — D2 says it stays committed. The `pnpm-debug.log*` pattern is optional.

    **Step 9 — `.nvmrc`.** Single line: `22`. No trailing newline beyond the standard POSIX one.

    **Step 10 — `README.md`.** Replace the empty file. Structure: H1 `# Darkfolio`, a one-line purpose ("16-bit Darkwood-inspired portfolio — Astro game canvas with a CRT-overlay content layer."), a `## Commands` section listing the gate + workflow commands (`pnpm dev`, `pnpm build`, `pnpm preview`, `pnpm test`, `pnpm test:watch`, `pnpm format`, `pnpm format:check`, `pnpm lint`, `pnpm exec astro check` — script names verbatim from Step 11), and a one-line `Specification` footer pointing at `.planning/PLAN.md`. Per AGENTS.md scope rule: README references code only — no `.planning/` mentions are needed, but the spec pointer is content, not a commit subject, so allowed.

    **Step 11 — `package.json` scripts.** Augment the existing scripts block (don't clobber `dev`, `build`, `preview`). Add in any order: `"format": "biome format --write ."`, `"format:check": "biome format ."`, `"lint": "biome check ."`, `"check:biome": "biome check ."`, `"astro:check": "astro check"`, `"test": "vitest run"`, `"test:watch": "vitest"`, `"commitlint": "commitlint --edit"` (JSON double quotes are Biome-stable). Task 2's husky init will also inject `"prepare": "husky"`.

    **Avoid:**
    - Adding `--frozen-lockfile` (the first install legitimately grows the lockfile from `astro@^7.3.5` only → nine new devDeps).
    - Configuring `.astro` template formatting (Biome skips `.astro`; spec defers prettier-plugin-astro).
    - Adding a CI workflow (spec §"Skipped now, add when" — CI section is explicitly out of Phase 0).
    - Adding Vitest coverage (`--coverage`) — spec defers coverage until a floor is wanted.
    - Adding a `prettier` config (Biome owns formatting; AGENTS.md forbids prettier/ESLint).
    - Writing the husky hooks, the sanity spec, or the plan mirror in this task — Task 2 owns them (split at the husky boundary for context budget; this task's files stop at the last root config).
  </action>
  <verify>
    <automated>mkdir -p .verify && pnpm install 2>&1 | tee .verify/install.log && test ${PIPESTATUS[0]} -eq 0 && grep -F "@biomejs/biome" package.json >/dev/null && grep -F '"vitest"' package.json >/dev/null && grep -F '"husky"' package.json >/dev/null && grep -F '"lint-staged"' package.json >/dev/null && grep -F "@commitlint/cli" package.json >/dev/null && grep -F "@commitlint/config-conventional" package.json >/dev/null && grep -F '"happy-dom"' package.json >/dev/null && grep -F '"typescript"' package.json >/dev/null && grep -F "@astrojs/check" package.json >/dev/null && node -e 'import("./commitlint.config.js").then(m => { const c = m.default || m; const p = c.parserPreset && c.parserPreset.parserOpts && c.parserPreset.parserOpts.headerPattern; const hl = c.rules && c.rules["header-max-length"]; if (!p || !(hl && hl[0] === 2 && hl[2] === 72)) { console.error("parserPreset.parserOpts.headerPattern or rules[header-max-length]=72 missing — top-level headerPattern is dead config in commitlint 19"); process.exit(1); } const u = new RegExp(p, "u"), n = new RegExp(p); const g = n.exec("✨ feat(game): add player movement"); const groups = !!g && g[1] === "feat" && g[2] === "game" && g[3] === "add player movement"; const good = ["✨ feat(game): add player movement","♻️ refactor(game): tidy loop","♻ refactor(game): tidy loop","🚀 chore(config): point build at pages","🐛 fix(pages): guard null params"].every(s => u.test(s) && n.test(s)); const bad = ["bad message","feat(game): missing emoji","✨ nope(deps): bad type"].every(s => !u.test(s) && !n.test(s)); process.exit(groups && good && bad ? 0 : 1); }).catch(e => { console.error(e); process.exit(1); })' && node -e 'import("./lint-staged.config.mjs").then(m => process.exit(m.default && Object.keys(m.default).length === 1 ? 0 : 1)).catch(e => { console.error(e); process.exit(1); })' && node -e 'import("vitest/config").then(m => process.exit(m.defineConfig ? 0 : 1)).catch(e => { console.error(e); process.exit(1); })' && pnpm exec biome --version >/dev/null && pnpm exec vitest --version >/dev/null && pnpm exec lint-staged --version >/dev/null && pnpm exec commitlint --version >/dev/null && grep -F "/darkfolio" astro.config.mjs >/dev/null && grep -F "output: " astro.config.mjs >/dev/null && grep -F "static" astro.config.mjs >/dev/null && grep -F "host: true" astro.config.mjs >/dev/null && grep -F "astro/tsconfigs/strict" tsconfig.json >/dev/null && grep -F '"@/*": ["src/*"]' tsconfig.json >/dev/null && grep -F '"@/components/*"' tsconfig.json >/dev/null && grep -F '"@/game/*"' tsconfig.json >/dev/null && grep -F '"@/systems/*"' tsconfig.json >/dev/null && grep -F '"@/scenes/*"' tsconfig.json >/dev/null && grep -F '"@/objects/*"' tsconfig.json >/dev/null && grep -F '"@/data/*"' tsconfig.json >/dev/null && grep -F '"@/styles/*"' tsconfig.json >/dev/null && grep -F '"@/layouts/*"' tsconfig.json >/dev/null && grep -F '"@/pages/*"' tsconfig.json >/dev/null && grep -F '"src/**"' tsconfig.json >/dev/null && grep -F "noConsoleLog" biome.json >/dev/null && grep -F "noUnusedImports" biome.json >/dev/null && grep -F "noUnusedVariables" biome.json >/dev/null && grep -F "noUnusedFunctionParameters" biome.json >/dev/null && grep -F '"include"' biome.json >/dev/null && grep -F "parserPreset" commitlint.config.js >/dev/null && grep -F "headerPattern" commitlint.config.js >/dev/null && grep -F "header-max-length" commitlint.config.js >/dev/null && grep -F "biome check --write" lint-staged.config.mjs >/dev/null && grep -F "happy-dom" vitest.config.ts >/dev/null && grep -F "src/**/*.test.ts" vitest.config.ts >/dev/null && grep -F ".opencode/" .gitignore >/dev/null && grep -F ".verify/" .gitignore >/dev/null && ! grep -qF ".planning" .gitignore && grep -F '"format": "biome format --write ."' package.json >/dev/null && grep -F '"format:check": "biome format ."' package.json >/dev/null && grep -F '"lint": "biome check ."' package.json >/dev/null && grep -F '"check:biome": "biome check ."' package.json >/dev/null && grep -F '"astro:check": "astro check"' package.json >/dev/null && grep -F '"test": "vitest run"' package.json >/dev/null && grep -F '"test:watch": "vitest"' package.json >/dev/null && grep -F '"commitlint": "commitlint --edit"' package.json >/dev/null && test "$(cat .nvmrc)" = "22" && grep -F "# Darkfolio" README.md >/dev/null && echo TASK1_OK</automated>
    <fails_when>`pnpm install` exits non-zero (install log captured at .verify/install.log); OR any devDep grep fails (a package from the nine-package batch is not persisted in package.json); OR the commitlint node probe exits non-zero (config fails to load as ESM, `parserPreset.parserOpts.headerPattern` or the `header-max-length` rule missing — top-level keys do NOT count, they are dead config in commitlint 19 — the 3-group exec check fails, or the pattern misclassifies a fixture under either the u-flag or no-flag compilation — fix the pattern/nesting per Step 5's rules, do not swap in Unicode property escapes); OR lint-staged/vitest-config ESM load fails (syntax error); OR any of `pnpm exec biome/vitest/lint-staged/commitlint --version` exits non-zero (binary not installed or PATH missing); OR any config-content grep fails (note the base/output/happy-dom greps are deliberately quote-agnostic — they pass under either quote style, but Step 2/4/7's single-quote convention means they pass on the FIRST run without needing a format pass); OR `! grep -qF ".planning" .gitignore` fails (a .planning ignore line exists — D2 violation); OR `.nvmrc` content is not exactly `22`; OR README.md lacks the `# Darkfolio` H1.</fails_when>
  </verify>
  <acceptance_criteria>
    - `pnpm install` exits 0; `pnpm-lock.yaml` is updated to cover all nine devDependencies (the locked eight-package batch + @astrojs/check surfaced per the checker gate)
    - `package.json` `devDependencies` lists all nine packages — asserted by greps for `@biomejs/biome`, `husky`, `lint-staged`, `vitest`, `happy-dom`, `@commitlint/cli`, `@commitlint/config-conventional`, `typescript` (D1), `@astrojs/check`
    - `pnpm exec biome --version`, `pnpm exec vitest --version`, `pnpm exec lint-staged --version`, `pnpm exec commitlint --version` all exit 0 (proves the binary PATH resolution — same four binaries as <done>; husky excluded on purpose, `--version` would be parsed as its hooks directory)
    - `astro.config.mjs` contains the quote-agnostic substrings `/darkfolio`, `output: ` together with `static`, and `host: true`
    - `tsconfig.json` content contains `astro/tsconfigs/strict` extends + all ten `@/*` path-alias declarations (including `@/components/*`) + `include: ["src/**", "tests/**"]`
    - `biome.json` contains a `linter` block with the four spec rule names (`noConsoleLog`, `noUnusedImports`, `noUnusedVariables`, `noUnusedFunctionParameters`) and the `files` block keyed `include` (singular — Biome 1.9's actual key)
    - `commitlint.config.js` exports (as ESM, per package type:module) `parserPreset.parserOpts.headerPattern` + `rules['header-max-length']` pinned to 72 — NOT top-level `headerPattern`/`headerMaxLength`, which commitlint 19.8.1 never reads; the loaded pattern string accepts ✨-feat, ♻️-with-VS-16, bare ♻, 🚀, and 🐛 fixtures, yields type/scope/subject as capture groups 1/2/3, and rejects no-emoji/bad-type fixtures under BOTH `new RegExp(p)` and `new RegExp(p, 'u')` compilations
    - `lint-staged.config.mjs` exports a default object with exactly one key — the `*.{ts,tsx,js,jsx,mjs,cjs,json}` glob → `['biome check --write']`
    - `vitest.config.ts` declares `test.environment` = happy-dom and `test.include` = `src/**/*.test.ts` (greps quote-agnostic)
    - `.gitignore` excludes `.opencode/`, `node_modules/`, `dist/`, `.astro/`, `.codegraph/`, `coverage/`, `.verify/`; contains NO `.planning` line (D2 — checked decisively with `! grep -qF`)
    - `.nvmrc` is `22` (literal content match, no trailing spaces); `README.md` has the H1 `# Darkfolio`
    - package.json scripts block contains all eight new script strings (`format`, `format:check`, `lint`, `check:biome`, `astro:check`, `test`, `test:watch`, `commitlint`)
  </acceptance_criteria>
  <reversibility>rating="costly"</reversibility>
</task>

<task type="auto">
  <name>Task 2: Init husky's three hooks (locked bodies), seed the vitest sanity spec, and stage the local plan mirror — the executable half of the toolchain</name>
  <files>
    - /home/jetson/github/darkfolio/.husky/pre-commit
    - /home/jetson/github/darkfolio/.husky/pre-push
    - /home/jetson/github/darkfolio/.husky/commit-msg
    - /home/jetson/github/darkfolio/src/test/sanity.test.ts
    - /home/jetson/github/darkfolio/.opencode/plan/darkfolio-plan.md
    - /home/jetson/github/darkfolio/package.json
  </files>
  <read_first>
    - /home/jetson/github/darkfolio/.planning/PLAN.md §"Phase 0: Setup" Husky table (locked hook bodies) and §"Husky Hooks"
    - /home/jetson/github/darkfolio/package.json (Task 1 left the scripts block here; husky init appends `prepare`)
    - /home/jetson/github/darkfolio/vitest.config.ts (Task 1 output — the include glob the sanity spec must cross)
  </read_first>
  <precondition>Task 1 closed clean — the nine-package devDep batch is persisted in package.json, all root configs contain their locked identifiers per Task 1 acceptance, and `node_modules/.bin/husky` exists (husky's real proof is this task's own `husky init` + the `core.hooksPath` assertion — never run `pnpm exec husky --version`: husky 9.1.7's argv parser treats `--version` as the hooks DIRECTORY, repoints `core.hooksPath` at `--version/_`, and leaves a stray `--version/` dir in the repo root).</precondition>
  <action>
    **Step 1 — Husky init.** Run `pnpm exec husky init` (this writes `.husky/_/`, `.husky/pre-commit` with a stub comment-and-command body, and adds `"prepare": "husky"` to package.json). Then overwrite the three hook files line-by-line with plain command bodies (husky v9 executes user hook files through the `.husky/_/` shims — no shebang and no exec bit needed; the shims source your file):
      - `.husky/pre-commit` → comment header (preserve husky's `# husky` line if present) followed by executable line `pnpm lint-staged`.
      - `.husky/pre-push` → comment reminding that `astro check` is kept in AGENTS.md gate per D3 (NOT in this hook), then executable `pnpm test && pnpm build`.
      - `.husky/commit-msg` → executable `pnpm commitlint --edit "$1"`. The `$1` expansion is git's hook convention for the path of the message file.

    Also leave `.husky/_/` and `.husky/_/.gitignore` untouched — husky writes them, keeps internal helper shims out of git, and points local `core.hooksPath` at them. `.husky/` itself becomes a regular tracked directory.

    **Step 2 — `src/test/sanity.test.ts`.** Write one Vitest spec. Body: a `describe('toolchain sanity', () => { it('runs vitest', () => { expect(1 + 1).toBe(2); }); });` (single quotes per Task 1 Step 4's convention). Add a single leading comment `ponytail: zero-test config is documented; replace when Phase 1 ships game logic` (JS line comment — the `#` gitignore-style marker is not a JS comment token). This file is the cheapest closing of husky pre-push's `pnpm test` — vitest exits non-zero when zero tests match its include glob.

    **Step 3 — `.opencode/plan/darkfolio-plan.md` (local mirror).** Copy the full content of `.planning/PLAN.md` to `.opencode/plan/darkfolio-plan.md`. This copy is mandated by the committed `.planning/PLAN.md` §"Phase 0: Setup" Agent Instructions ("kept as a copy under `.opencode/plan/` — opencode reads planner state from this path") — that committed mandate is the nod AGENTS.md requires before touching `.opencode/`. The directory is gitignored (Task 1 Step 8) — a runtime mirror for opencode's plug-in, not tracked canonical state. Use a simple `cp` (or read+write). Do NOT modify `.planning/PLAN.md` itself.

    **Avoid:**
    - Wiring `.opencode/` to git (it's gitignored per AGENTS.md; the darkfolio-plan.md mirror inside it is local-only).
    - Adding `astro check` to any hook body — D3 locks the hooks at exactly the three commands above.
    - Running `git commit` from this task — the hooks land ready; the developer's first real commit exercises them (Task 4 probes them dry-run).
  </action>
  <verify>
    <automated>mkdir -p .verify && grep -F 'pnpm lint-staged' .husky/pre-commit >/dev/null && grep -F 'pnpm test && pnpm build' .husky/pre-push >/dev/null && grep -F 'pnpm commitlint --edit "$1"' .husky/commit-msg >/dev/null && grep -F '"prepare": "husky"' package.json >/dev/null && grep -F 'expect(1 + 1).toBe(2)' src/test/sanity.test.ts >/dev/null && pnpm test 2>&1 | tee .verify/test2.log && grep -F "1 passed" .verify/test2.log >/dev/null && test -s .opencode/plan/darkfolio-plan.md && bash -c '[[ "$(git config core.hooksPath)" == *".husky"* ]]' && echo TASK2_OK</automated>
    <fails_when>Any hook body lacks its locked command line; OR package.json lacks the `prepare` husky script (husky init did not run clean); OR vitest reports anything other than 1 passed (sanity spec missing, failing, or not discovered through vitest.config.ts's include glob); OR the mirror file is missing/empty; OR `git config core.hooksPath` does not contain `.husky` — husky 9 sets it to `.husky/_`; if it prints nothing or a foreign value, husky init did not wire git to the hooks directory (check LOCAL config, not global).</fails_when>
  </verify>
  <acceptance_criteria>
    - `.husky/pre-commit` executable line is exactly `pnpm lint-staged` (comment lines allowed above)
    - `.husky/pre-push` executable line is exactly `pnpm test && pnpm build` (comment lines explaining D3 allowed above)
    - `.husky/commit-msg` executable line is exactly `pnpm commitlint --edit "$1"`
    - All three hook files carry their locked command lines; `package.json` scripts block now also contains `"prepare": "husky"` (added by husky init)
    - Local git `core.hooksPath` contains `.husky` (husky v9 sets `.husky/_`) — husky init wired the hook directory into git
    - `src/test/sanity.test.ts` contains `expect(1 + 1).toBe(2)` and the ponytail comment; `pnpm test` exits 0 with output showing `1 passed`
    - `.opencode/plan/darkfolio-plan.md` exists and is non-empty (mandated by .planning/PLAN.md §Phase 0)
  </acceptance_criteria>
  <done>
    - Husky pre-commit/pre-push/commit-msg contain their locked bodies (lint-staged, test+build, commitlint --edit $1) and are executable
    - `pnpm test` exits 0 with `1 passed` (sanity spec from `src/test/sanity.test.ts` discovered via Task 1's vitest.config.ts)
    - `.opencode/plan/darkfolio-plan.md` exists as a local copy of `.planning/PLAN.md`
    - Local git `core.hooksPath` is set to `.husky` by husky init
  </done>
  <reversibility>rating="reversible"</reversibility>
</task>

<task type="auto">
  <name>Task 3: Run the AGENTS.md pre-commit gate end-to-end — the four-command floor (`pnpm format && pnpm test && pnpm exec astro check && pnpm build`) closes green</name>
  <files>
    - /home/jetson/github/darkfolio/src/test/sanity.test.ts (may be touched by formatter if drift exists)
    - /home/jetson/github/darkfolio/biome.json (read-only verification)
    - /home/jetson/github/darkfolio/src/pages/index.astro (CONDITIONAL — edited with at most one minimal fix ONLY if astro check fails on the stub; see step 3 fallback rules)
    - /home/jetson/github/darkfolio/src/content.config.ts (CONDITIONAL — created ONLY if astro check demands a content-collections stub; see step 3 fallback rules)
  </files>
  <read_first>
    - /home/jetson/github/darkfolio/AGENTS.md §"Pre-commit gate" (the four-command floor this task closes)
    - /home/jetson/github/darkfolio/package.json (scripts format/format:check/test/astro:check/build this task runs)
    - /home/jetson/github/darkfolio/src/pages/index.astro (the stub the astro-check leg walks)
  </read_first>
  <precondition>Tasks 1 and 2 closed clean — `pnpm install` succeeded; all nine devDeps (including @astrojs/check) are persisted in package.json; the root configs contain their locked identifiers per Task 1 acceptance; `.husky/` hooks exist with locked bodies; `src/test/sanity.test.ts` exists.</precondition>
  <action>
    Run the four AGENTS.md pre-commit gate commands in declaration order and confirm each exits 0. `astro check` is IN this gate per AGENTS.md (it's OUT of husky hooks per D3) — both are independently true.

    **1. `pnpm format`** — Biome formatter applies. First run may rewrite quote/semicolon drift in any hand-edited config (we wrote each file with spec-locked values, so drift should be zero — but if Biome disagrees with our prose for some reason, this run corrects it). Expected: exit 0 with Biome printing modified files (or empty output if no drift).

    **2. `pnpm test`** — Vitest runs the sanity spec from Task 2. Expected: exit 0 with one passing test; if `pnpm format` somehow broke `src/test/sanity.test.ts` syntax, vitest emits "1 failed" and the gate is open.

    **3. `pnpm exec astro check`** — TypeScript strict + Astro typecheck, now doing REAL work because Task 1 installed @astrojs/check (without it, astro check shows a missing-dependency prompt, exits 0, and checks nothing — that vacuous pass is exactly what this step must not accept: the log MUST contain astro-check's `Result (` summary line and MUST NOT contain the missing-dependency sentinel; Task 3's verify asserts both). Walks the existing `src/pages/index.astro` stub. Expected: exit 0 with `0 errors`. If astro check complains about the stub:
      - If the error is `Cannot find module 'astro:content'` or similar (Astro 7 virtual modules for stub pages with no collections), add `src/content.config.ts` with `export const collections = {};` as the minimal content-collections stub — only as a fall-back, NOT preemptively
      - If the error says something like `Implicit any` or strict-mode complaint in the stub, edit the stub minimally to add an explicit import or type annotation
      - ANY edit must keep seeing `pnpm format` and `pnpm test` green
      - If astro check still fails after a single round of edits and the fix isn't obvious, STOP and surface the failure (no further speculative edits — deep stub surgery is Phase 1's concern)

    **4. `pnpm build`** — Astro produces a `dist/` directory. Expected: exit 0; `dist/index.html` exists (the static-output generation of the existing stub page).

    After all four, run `pnpm format:check` (the `biome format .` dry-run leg — exit 0 means zero files would be reformatted). This is the idempotency proof: `pnpm format` already applied any drift in step 1, so the formatter must now be in steady state and `format:check` must exit 0. Do NOT grep Biome's stdout for "0 files formatted"-style wording — Biome's success phrasing varies by version and a prose grep would fail a clean run; the script's own exit code is the decision. If `pnpm format:check` exits non-zero, run `pnpm build` again to confirm `dist/` rebuilds fresh — and stop the chain so the executor can investigate the churn.

    IMPORTANT D3 reminder: `astro check` lives in THIS AGENTS.md gate, NOT in `.husky/pre-push`. Husky pre-push stays as `pnpm test && pnpm build`. Do not modify the husky hook body — that's already locked in Task 2.
  </action>
  <verify>
    <automated>mkdir -p .verify && \
      pnpm format > .verify/format1.log 2>&1; F1=$? ; \
      pnpm test > .verify/test.log 2>&1; T1=$? ; \
      pnpm exec astro check > .verify/astrocheck.log 2>&1; A1=$? ; \
      pnpm build > .verify/build1.log 2>&1; B1=$? ; \
      pnpm format:check > .verify/formatcheck.log 2>&1; FC=$? ; \
      echo "FORMAT1_EXIT=$F1 TEST_EXIT=$T1 ASTROCHECK_EXIT=$A1 BUILD_EXIT=$B1 FORMATCHECK_EXIT=$FC" && \
      test $F1 -eq 0 -a $T1 -eq 0 -a $A1 -eq 0 -a $B1 -eq 0 -a $FC -eq 0 && \
      test -f dist/index.html && \
      grep -F "1 passed" .verify/test.log >/dev/null && \
      grep -F "Result (" .verify/astrocheck.log >/dev/null && \
      ! grep -qF "requires the following dependency" .verify/astrocheck.log && \
      grep -F 'pnpm test && pnpm build' .husky/pre-push >/dev/null && \
      echo TASK3_OK</automated>
    <fails_when>`pnpm format` exits non-zero (Biome flagged a rule dispute); OR `pnpm test` exits non-zero or its log lacks `1 passed`; OR `pnpm exec astro check` exits non-zero (a real TS/Astro error surfaced by @astrojs/check); OR its log lacks the `Result (` summary line — meaning the check never ran — OR the log contains the missing-dependency sentinel, proving @astrojs/check vanished from node_modules despite Task 1's install; OR `pnpm build` exits non-zero (static build broke — likely base path / output mismatch); OR `dist/index.html` does not exist after build (static output didn't emit); OR `pnpm format:check` exits non-zero after the applied `pnpm format` run (formatter not idempotent — indicates underlying drift or a format/verify disagreement).</fails_when>
  </verify>
  <acceptance_criteria>
    - All five commands exit 0: `pnpm format`, `pnpm test`, `pnpm exec astro check`, `pnpm build`, `pnpm format:check` (the last one is the idempotency leg — exit 0 means Biome would reformat nothing)
    - `dist/index.html` exists after `pnpm build` (Astro static-output emitted)
    - `astrocheck.log` contains the `Result (` summary line (the check genuinely ran) AND does NOT contain the missing-dependency sentinel (astro check silently checking nothing is a FAILURE, not a pass — the old vacuous exit-0 path closed by installing @astrojs/check)
    - `astrocheck.log` shows `0 errors` under the Result summary (astro check exits 0 only when no errors surface; the exit code carries this — no prose grep needed)
    - If `astro check` required minimal edits to `src/pages/index.astro` or `src/content.config.ts` to pass, those edits pass the same four-command gate (no infinite loop) — both files are declared conditional in <files> and frontmatter files_modified
    - Husky pre-push body remains `pnpm test && pnpm build` — D3 preserved (this gate runs in AGENTS.md, not husky)
  </acceptance_criteria>
  <done>
    - All four AGENTS.md pre-commit gate commands exit 0 (`pnpm format`, `pnpm test`, `pnpm exec astro check`, `pnpm build`) and `pnpm format:check` exits 0 on the follow-up run (formatter steady-state, not a buffer-bouncing regression)
    - `dist/index.html` exists after `pnpm build` (Astro static-output emitted)
    - `pnpm exec astro check` log contains the `Result (` summary — proof the leg performed a real typecheck with @astrojs/check installed
    - Husky pre-push body unchanged at `pnpm test && pnpm build` — D3 still respected (astro check kept in this AGENTS.md gate, not the hook)
  </done>
  <reversibility>rating="reversible"</reversibility>
</task>

<task type="auto">
  <name>Task 4: Probe the hook chain (dry run) — commitlint accepts every class of the locked emoji table and rejects bad messages; husky config is mechanically wired</name>
  <files>
    - /home/jetson/github/darkfolio/commitlint.config.js (read-only verification, dry-run inputs in `/tmp/hookprobe/`)
    - /home/jetson/github/darkfolio/.husky/pre-commit (read-only)
    - /home/jetson/github/darkfolio/.husky/pre-push (read-only)
    - /home/jetson/github/darkfolio/.husky/commit-msg (read-only)
  </files>
  <read_first>
    - /home/jetson/github/darkfolio/commitlint.config.js (Task 1 output — the headerPattern this task probes through the real commitlint CLI)
    - /home/jetson/github/darkfolio/.planning/PLAN.md §"Commit Format" (the locked emoji table the fixture set must cover)
  </read_first>
  <precondition>Tasks 1–3 closed clean. The four AGENTS.md gate commands are green. `pnpm test` exits 0 (sanity spec passes).</precondition>
  <action>
    Dry-run the commitlint regex by calling `pnpm commitlint` against fixture message files and confirm the integrated hook configPath is correct. Do NOT run `git commit` — a real commit is the developer's action in Phase 1+, not the executor's.

    **1. Build six fixture messages in `/tmp/hookprobe/`.** Create the directory if missing. Write FOUR valid messages, chosen so the emoji prefix covers every class of the PLAN.md §"Commit Format" locked table — BMP-range emoji, astral emoji via literal surrogate pairs, the VS-16 (FE0F) form, and the 🚀 deploy-class entry — plus TWO rejects:
      - `good1.txt`: `✨ feat(game): add player movement` (BMP ✨ + feat)
      - `good2.txt`: `🐛 fix(pages): guard null params` (astral 🐛 + fix — per the checker, the BMP class alone was measured to reject this)
      - `good3.txt`: `♻️ refactor(game): tidy loop` (VS-16 form — the exact string the old property-escape pattern rejected with the u flag)
      - `good4.txt`: `🚀 chore(config): point build at pages` (astral 🚀 deploy-class emoji mapped onto the chore type — the table pairs 🚀 with deploy but AGENTS.md's type list has no `deploy` type, so the mechanical enforcement accepts it with any locked type)
      - `bad.txt`: `bad message` (no leading emoji, no conventional type, no scope — headerPattern breaks first)
      - `noemoji.txt`: `feat(game): missing emoji` (valid conventional-commit message that lacks the gitmoji prefix — this is the WIRING probe: if `headerPattern` sat at top level instead of inside `parserPreset.parserOpts`, the CLI would ignore it and exit 0 on this message while a regex-only probe still green-lights the config. It must exit non-zero through the real commitlint CLI)
    Every fixture subject is code-only per AGENTS.md (paths/symbols, no tool names) — these are message-FORMAT probes, and a probe fixture that itself violates the house rules would be embarrassing at best.

    **2. Run commitlint against all four good messages.** Invoke `pnpm commitlint /tmp/hookprobe/goodN.txt` (N=1..4), capturing each exit code and log. Expected: exit 0 each. If commitlint prints any output at all (it usually is silent on success), that's fine — no errors means the regex accepted the message. If ANY good fixture is rejected, the headerPattern emoji prefix is wrong for its class — fix the pattern per Task 1 Step 5's flag-independence rules; do NOT delete the fixture.

    **3. Run commitlint against both reject fixtures.** Invoke `pnpm commitlint /tmp/hookprobe/bad.txt` and `pnpm commitlint /tmp/hookprobe/noemoji.txt`, capturing stderr for each. Expected: both exit non-zero AND each log contains at least one of the literal commitlint error phrases: `✖`, `header must match`, `subject may not be empty`, `subject-empty`, `type may not be empty`, `type-empty`, OR a phrase that begins with `✖` followed by an error code in brackets. `noemoji.txt` exiting ZERO means the pattern is present in the config file but not wired into commitlint's parser (top-level dead-key defect) — move it under `parserPreset.parserOpts` and re-run. A bare non-zero exit with no stderr is ambiguous (could mean a config parse error rather than a regex rejection) — surface that as a soft failure.

    **4. Confirm git's hook path is wired to `.husky`.** Run `git config core.hooksPath` and verify stdout contains `.husky`. If git prints nothing or prints a non-`.husky` value, husky init did not wire `core.hooksPath` — this is a critical regression. (Husky 9 init runs `git config core.hooksPath .husky` internally; if `~/.gitconfig` already pins a `core.hooksPath`, husky will defer to local-repo config — confirm local config exists, not global.)

    **5. Confirm lint-staged config loads.**
    Run `node -e "import('./lint-staged.config.mjs').then(m => process.exit(m.default ? 0 : 1)).catch(() => process.exit(1))"` and confirm exit 0. The dry run proves the ESM import resolves and the export shape is `{ '<glob>': ['<cmd>'] }`.

    **6. Confirm hook bodies one last time.** `grep -F 'pnpm test && pnpm build' .husky/pre-push`, `grep -F 'pnpm lint-staged' .husky/pre-commit`, and `grep -F 'pnpm commitlint --edit' .husky/commit-msg` all return 1+ matches.

    Cleanup: leave `/tmp/hookprobe/` (it's outside the repo and harmless). Do NOT touch `pnpm-lock.yaml`, `.git/`, or any tracked file. Do NOT commit anything.
  </action>
  <verify>
    <automated>set -u; mkdir -p /tmp/hookprobe .verify && printf '%s\n' '✨ feat(game): add player movement' > /tmp/hookprobe/good1.txt && printf '%s\n' '🐛 fix(pages): guard null params' > /tmp/hookprobe/good2.txt && printf '%s\n' '♻️ refactor(game): tidy loop' > /tmp/hookprobe/good3.txt && printf '%s\n' '🚀 chore(config): point build at pages' > /tmp/hookprobe/good4.txt && printf '%s\n' 'bad message' > /tmp/hookprobe/bad.txt && printf '%s\n' 'feat(game): missing emoji' > /tmp/hookprobe/noemoji.txt && pnpm commitlint /tmp/hookprobe/good1.txt > .verify/good1.log 2>&1; G1=$?; pnpm commitlint /tmp/hookprobe/good2.txt > .verify/good2.log 2>&1; G2=$?; pnpm commitlint /tmp/hookprobe/good3.txt > .verify/good3.log 2>&1; G3=$?; pnpm commitlint /tmp/hookprobe/good4.txt > .verify/good4.log 2>&1; G4=$?; pnpm commitlint /tmp/hookprobe/bad.txt > .verify/bad.log 2>&1; B=$?; pnpm commitlint /tmp/hookprobe/noemoji.txt > .verify/noemoji.log 2>&1; NE=$?; echo "GOOD1=$G1 GOOD2=$G2 GOOD3=$G3 GOOD4=$G4 BAD=$B NOEMOJI=$NE"; test $G1 -eq 0 -a $G2 -eq 0 -a $G3 -eq 0 -a $G4 -eq 0 && test $B -ne 0 && test $NE -ne 0 && grep -E '✖|header must match|subject may not be empty|subject-empty|type may not be empty|type-empty' .verify/bad.log >/dev/null && grep -E '✖|header must match|subject may not be empty|subject-empty|type may not be empty|type-empty' .verify/noemoji.log >/dev/null && grep -F 'pnpm test && pnpm build' .husky/pre-push >/dev/null && grep -F 'pnpm lint-staged' .husky/pre-commit >/dev/null && grep -F 'pnpm commitlint --edit' .husky/commit-msg >/dev/null && node -e 'import("./lint-staged.config.mjs").then(m => process.exit(m.default ? 0 : 1)).catch(() => process.exit(1))' && bash -c '[[ "$(git config core.hooksPath)" == *".husky"* ]]' && echo TASK4_OK</automated>
    <fails_when>Any of the four good fixtures exits non-zero (valid gitmoji + conventional message rejected — the headerPattern emoji prefix is broken for that emoji class; check .verify/goodN.log and fix the pattern, do NOT delete the fixture); OR `pnpm commitlint /tmp/hookprobe/bad.txt` exits ZERO (bad message accepted — headerPattern TOO lax, T-00-01 surfaces); OR `pnpm commitlint /tmp/hookprobe/noemoji.txt` exits ZERO (the regex itself may be fine but commitlint is not reading it — the top-level dead-key defect: `headerPattern` must live under `parserPreset.parserOpts`; this is exactly why the CLI-level fixture exists alongside the regex-only probe); OR either reject log contains no recognizable commitlint error phrase (headerPattern configured but not enforced); OR `git config core.hooksPath` does NOT contain `.husky` (husky init failed silently); OR lint-staged config ESM load fails; OR any of the three hook bodies is missing its locked command line.</fails_when>
  </verify>
  <acceptance_criteria>
    - `pnpm commitlint` exits 0 on ALL four good fixtures — covering BMP ✨ (feat), astral 🐛 (fix), VS-16 ♻️ (refactor), astral 🚀 (chore) — every class of the PLAN.md §"Commit Format" locked table
    - `pnpm commitlint /tmp/hookprobe/bad.txt` exits non-zero AND its log contains at least one commitlint error token (`✖`, `header must match`, `subject-empty`, or `type-empty`)
    - `pnpm commitlint /tmp/hookprobe/noemoji.txt` ("feat(game): missing emoji") exits non-zero with a commitlint error token in its log — proves the pattern is WIRED (read via parserPreset.parserOpts by the real CLI), not just present in the file
    - `git config core.hooksPath` (local) contains the literal `.husky` substring
    - `node -e 'import("./lint-staged.config.mjs")'` exit 0 (ESM config loads cleanly)
    - `.husky/pre-push` contains the literal substring `pnpm test && pnpm build`; `.husky/pre-commit` contains `pnpm lint-staged`; `.husky/commit-msg` contains `pnpm commitlint --edit`
    - No tracked file in the repo was modified (only `/tmp/hookprobe/*.txt` outside the repo were created, plus gitignored `.verify/` for log capture)
  </acceptance_criteria>
  <done>
    - All four good fixtures (✨ feat, 🐛 fix, ♻️ refactor with VS-16, 🚀 chore) exited 0 through the real `pnpm commitlint` CLI — the wired headerPattern accepts every emoji class of the locked table
    - `pnpm commitlint /tmp/hookprobe/bad.txt` exited non-zero with at least one commitlint error token (✖, header must match, subject-empty, or type-empty) in its log
    - `pnpm commitlint /tmp/hookprobe/noemoji.txt` ("feat(game): missing emoji") exited non-zero with a commitlint error token — the CLI-level proof that the emoji requirement is mechanically enforced through parserPreset.parserOpts (a regex-only probe cannot distinguish wired config from dead top-level keys)
    - `git config core.hooksPath | grep .husky` matched — husky 9 init wired the hooks directory into local git config
    - `node -e 'import("./lint-staged.config.mjs")'` exited 0 — config file is syntactically valid ESM
    - All three hook bodies carry their locked command lines
    - No tracked file in repo was modified — `/tmp/hookprobe/*.txt` and `.verify/*.log` are local-only artifacts
  </done>
  <reversibility>rating="one-way"</reversibility>
</task>

</tasks>

<verification>
After all four tasks complete, Phase 0 ROADMAP Success Criteria #1–#5 are independently verifiable:

- **SC#1** (`astro.config.mjs` exists with `base: '/darkfolio'` and static output): `grep -F "/darkfolio" astro.config.mjs` AND `grep -F "output: " astro.config.mjs` AND `grep -F "static" astro.config.mjs` all return ≥1 line (quote-agnostic by design — single- or double-quoted forms both satisfy).

- **SC#2** (`tsconfig.json` declares strict and the path aliases): the file extends `astro/tsconfigs/strict` (which sets strict) AND `grep -F '"@/*": ["src/*"]' tsconfig.json` returns ≥1 line. (All ten aliases verified together via the Task 1 closure check, including `@/components/*`.)

- **SC#3** (Pre-commit hook runs Biome on staged files): `.husky/pre-commit` contains `pnpm lint-staged`; `lint-staged.config.mjs` globs `*.{ts,tsx,js,jsx,mjs,cjs,json}` → `biome check --write`. End-to-end provenance is now wired, ready for Phase 1 commits.

- **SC#4** (Pre-push hook runs Vitest + build): `.husky/pre-push` body contains both `pnpm test` AND `pnpm build`; Task 3 proves both exit 0 today. Per D3, `astro check` is NOT in this hook — it's in the AGENTS.md gate (verified by Task 3 step 3, with @astrojs/check installed so the leg genuinely typechecks).

- **SC#5** (`commit-msg` enforces gitmoji + conventional): Task 4 demonstrates `pnpm commitlint` (the real CLI — the pattern is read only from `parserPreset.parserOpts`, so CLI-level rejection of `feat(game): missing emoji` proves the wiring, not just the regex) rejects unprefixed AND fully-bad messages AND accepts all four emoji classes of the locked table (BMP ✨, astral 🐛, VS-16 ♻️, astral 🚀). The header pattern is flag-independent — correct under both no-flag and u-flag RegExp compilation — and the 72-char cap is enforced via `rules['header-max-length']`.

A single end-to-end probe (developer-facing shorthand):
```
pnpm format && pnpm test && pnpm exec astro check && pnpm build \
  && pnpm commitlint <(echo '✨ chore(deps): add commit hooks in .husky/') \
  && pnpm commitlint <(echo 'bad') \
  ; git config core.hooksPath | grep -F .husky
```
This collapses phases of the gate into one bash expression: the four AGENTS.md commands, the two commitlint probes (acceptance/rejection), and the husky hooks-path probe. Run at the executor's discretion.

Source-Audit map (per planner-source-audit.md):

```
SOURCE    | ID       | Item                                                  | Plan | Status  | Notes
--------- | -------- | ----------------------------------------------------- | ---- | ------- | ------
GOAL      | —        | ROADMAP Phase 0 goal: toolchain gates a commit        | 01   | COVERED | tracer Task 1 wires configs end-to-end; Tasks 2–4 add hooks, close the gate, and probe the chain
REQ       | —        | No phase_req_ids map to Phase 0 (foundation phase)    | —    | COVERED  | IMPLICIT — `requirements: []` and `requirements_addressed: []` are empty
RESEARCH  | —        | No RESEARCH.md (workflow.research disabled)            | —    | COVERED | n/a
CONTEXT   | D-01     | TypeScript ^5 (Astro 7 toolchain compat)              | 01   | COVERED | Task 1 Step 1 (devDeps `@^5`) + Step 3 (tsconfig extends strict)
CONTEXT   | D-02     | `.planning/` committed, not gitignored                | 01   | COVERED | Task 1 Step 8 (.gitignore rules — asserted decisively with `! grep -qF`)
CONTEXT   | D-03     | `astro check` in AGENTS.md gate, not husky hooks       | 01   | COVERED | Task 2 Step 1 (pre-push body is `pnpm test && pnpm build`); Task 3 runs `pnpm exec astro check` in the AGENTS.md gate explicitly, with @astrojs/check installed (Task 1 Step 1) so the leg really typechecks
```
</verification>

<success_criteria>
Phase 0 closes when ALL of:

1. **SC#1 (ROADMAP)** — `pnpm exec astro build` succeeds with `base: '/darkfolio'` set; `dist/index.html` exists post-build.
2. **SC#2 (ROADMAP)** — `pnpm exec astro check` performs a real typecheck (@astrojs/check installed; log carries the `Result (` summary) and exits 0 with `0 errors` against the existing `src/pages/index.astro` stub (or after at most the one declared minimal fallback edit) with `tsconfig.json` extending strict.
3. **SC#3 (ROADMAP)** — An edit to a staged `.ts` file triggers `pnpm lint-staged` (Biome) on every `git commit` — verified via the lint-staged config-load probe in Task 4 and the wired `.husky/pre-commit` body in Task 2.
4. **SC#4 (ROADMAP)** — Husky `pre-push` body is `pnpm test && pnpm build` and BOTH commands exit 0 today (Task 3 closure). `astro check` is in AGENTS.md gate, not the hook (D3).
5. **SC#5 (ROADMAP)** — `pnpm commitlint` rejects `bad message` and `feat(game): missing emoji` (CLI-level proof the parserPreset wiring is live — gitmoji is mandatory) and accepts all four emoji classes of the locked table — `✨ feat(game): add player movement`, `🐛 fix(pages): guard null params`, `♻️ refactor(game): tidy loop`, `🚀 chore(config): point build at pages` — verified empirically in Task 4.
6. **Repo state** — `pnpm install` is reproducible on a fresh machine (`pnpm-lock.yaml` revised and committed). All root-level config files from §Phase 0 exist. `.husky/` directory is committed (except `_/` internals husky writes). `.opencode/plan/darkfolio-plan.md` exists as a local mirror.
7. **Branch** — Phase branch is `phase-0-setup` (the executor/user controls branching per AGENTS.md §"Branches & PRs"); Phase 1+ work must not happen on master until this branch is merged or rebased.
</success_criteria>

<output>
Create `.planning/phases/00-setup-foundation/{padded_phase}-01-SUMMARY.md` (i.e. `.planning/phases/00-setup-foundation/00-01-SUMMARY.md`) when this plan finishes executing. The SUMMARY should briefly record: which devDeps installed (and which versions resolved to, including @astrojs/check), a one-liner per task (which file mutations landed, what the relevant verify output showed), and any pre-edit fixes to `src/pages/index.astro` or `src/content.config.ts` if astro check demanded them in Task 3.
</output>

<artifacts>
The phase produces (under `/home/jetson/github/darkfolio/`) — every path below is rooted in the repo checkout:

**New files (created from scratch):**
- `biome.json` — Biome 1.9 lint + format config (4 rules + LF/single-quote/semicolons-always; canon's 5th rule `noDuplicateImports` omitted per Step 4 deviation note — it does not exist in Biome 1.9.4 and invalidates the config)
- `commitlint.config.js` — ESM module (package type:module) with `parserPreset.parserOpts.headerPattern` regex string + `rules['header-max-length']: [2, 'always', 72]` (top-level `headerPattern`/`headerMaxLength` are dead config in commitlint 19.8.1 — never use them)
- `lint-staged.config.mjs` — ESM module mapping the format glob to `biome check --write`
- `vitest.config.ts` — TypeScript module wiring vitest with happy-dom + `src/**/*.test.ts` discovery
- `.gitignore` — Node/Astro standard ignores PLUS `.opencode/`, `.codegraph/`, `coverage/`, `.verify/` (does NOT exclude `.planning/`)
- `.nvmrc` — single line `22`
- `README.md` — H1 + Commands section + spec pointer
- `.husky/` directory (created by `pnpm exec husky init`) with:
  - `.husky/pre-commit` — executable line `pnpm lint-staged`
  - `.husky/pre-push` — executable line `pnpm test && pnpm build` (with comment noting that `astro check` is in AGENTS.md gate per D3)
  - `.husky/commit-msg` — executable line `pnpm commitlint --edit "$1"`
- `src/test/sanity.test.ts` — one Vitest spec (`expect(1 + 1).toBe(2)`) with a `ponytail:` line comment explaining why
- `.opencode/plan/darkfolio-plan.md` — gitignored mirror of `.planning/PLAN.md` (mandate: §Phase 0 Agent Instructions)

**Modified files (extended):**
- `package.json` — adds 9 devDeps via `pnpm add -D` (locked batch + @astrojs/check per checker gate), adds 8 new scripts, `prepare: "husky"` added by husky init in Task 2
- `pnpm-lock.yaml` — rewritten by `pnpm install` to cover the new devDeps + their transitives
- `astro.config.mjs` — preserves `server.host: true`; adds `base: '/darkfolio'` and `output: 'static'`
- `tsconfig.json` — switches extend base from `astro/tsconfigs/base` → `astro/tsconfigs/strict`; adds `compilerOptions.paths` (ten aliases) and `include` (`src/**`, `tests/**`)

**Files NOT touched (defended by spec):**
- `AGENTS.md` — `Never` list forbids editing without asking
- `.planning/` — D2 commits it, but commit subject rule (AGENTS.md) forbids `.planning/` mentions in commit subjects — content remains canonical
- `pnpm-workspace.yaml` — already permits `esbuild` build; no Phase 0 requirement to add more `allowBuilds`
- `src/pages/index.astro` — existing Astro stub stays (unless astro check demands the one declared minimal fix in Task 3 Step 3; the file is declared conditional in frontmatter files_modified for that fallback)
- `opencode.jsonc` — opencode runtime config; outside Phase 0 scope

**New symbols / config keys (referenced by plan actions):**
- biome.json keys: `formatter.lineEnding`, `javascript.formatter.quoteStyle`, `javascript.formatter.semicolons` (plural — `semicolon` is an unknown key in Biome 1.9.4), `files.include` (singular — Biome 1.9's actual key), `files.ignore`, `linter.rules.suspicious.noConsoleLog`, `linter.rules.correctness.noUnusedImports/Variables/FunctionParameters`
- commitlint headerPattern: flag-independent emoji prefix (BMP code-point class + literal astral emoji + optional VS-16) + ten conventional-commit types + non-capturing-wrapped `(scope)` placed before `:` — exactly 3 capture groups (type, scope, subject) for the default headerCorrespondence; read by commitlint only at `parserPreset.parserOpts.headerPattern`; 72 cap via `rules['header-max-length']`
- lint-staged glob: `*.{ts,tsx,js,jsx,mjs,cjs,json}` → `['biome check --write']`
- vitest config keys: `test.environment: 'happy-dom'`, `test.include: ['src/**/*.test.ts']`
- husky hook command bodies (see `.husky/` above)
- pnpm scripts (8 new, alphabetical): `astro:check`, `check:biome`, `commitlint`, `format`, `format:check`, `lint`, `test`, `test:watch`, `prepare`(added by husky init)
</artifacts>
