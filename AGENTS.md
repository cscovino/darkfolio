# AGENTS.md — Darkfolio

> 16-bit Darkwood-inspired portfolio. Astro 7.3.5 + Phaser 4.2.1 + TypeScript ^5.
> Operational rules for the coding agent. Source of truth for project philosophy: `.planning/PROJECT.md`, `.planning/PLAN.md`, `.planning/ROADMAP.md`.

## Project

Darkfolio is a 16-bit RPG-style portfolio: visitors explore a 3-room dark house and discover content (projects, skills, contact) via CRT-overlay screens triggered by interactable objects. Astro 7.3.5 pages host a Phaser 4 game; Astro content pages also render inside the in-game CRT overlay.

## Repo layout

```
.planning/                 # project canon (committed) — PROJECT.md · config.json ·
                           # REQUIREMENTS.md · ROADMAP.md · STATE.md · PLAN.md
src/
  components/              # GameCanvas, GameOverlay, LoadingScreen, MobileWarning
  layouts/
  pages/                   # index.astro, projects.astro, skills.astro, contact.astro
  styles/
  content/                 # Markdown projects / skills / contact
  game/
    main.ts, config.ts
    scenes/                # Boot, Preload, Title, LivingRoom, Office, Bedroom
    objects/               # Player, Interactable, Computer, Bookshelf, Phone, ...
    systems/               # Dialog, Overlay, Lighting, Audio, Save
    data/                  # dialog content
public/
  assets/                  # sprites/, tilesets/, audio/, maps/  (PNG + OGG)
.github/
  PULL_REQUEST_TEMPLATE.md
astro.config.mjs · biome.json · tsconfig.json · package.json
.opencode/                 # harness state — gitignored
```

## Working directories

- Source under `src/`. Assets under `public/`. Vitest tests co-located as `*.test.ts`.
- `.planning/` is the canonical project state — committed; do not hand-edit, use `/gsd-*` commands.
- `.opencode/`, `.astro/`, `dist/`, `node_modules/`, `coverage/` — gitignored.
- Do not commit `pnpm-lock.yaml` deletions or `.codegraph/` edits without approval.

## Commits

Format: `<emoji> <type>(<scope>): <subject>` — emoji table in `.planning/PLAN.md` §"Commit Format".

- One line. ≤72 chars. No body.
- Subject references code only — file path, directory, or symbol.
  Never mention `.planning/`, `.gsd/`, `.opencode/`, `.codegraph/`, `AGENTS.md`, plans, phases, or any plugin/integration (ponytail, biome, husky, vitest, GSD, …).
- No `Co-Authored-By:` trailers. No AI sign-off.
- Types: feat · fix · refactor · perf · test · docs · style · chore · build · ci.
- Scope = top-level source dir the diff touches. Standard set: `game`, `pages`, `layouts`, `components`, `styles`, `content`, `config`, `deps`, `tests`, `hooks`, `ci`, `planning`. Single-file change: file's directory.

Examples:
- `✨ feat(game): add player movement in src/game/objects/Player.ts`
- `🔧 chore(config): write .planning/config.json`
- `📝 docs(plan): replace phase 0 detail in .planning/PLAN.md`

## Squash discipline

After every feature or fix lands, the agent checks: can the recent commits be one commit and still be reviewable? Squash toward minimum count without losing reviewability.

**Squash when:**
- Multiple commits touch the same directory/scope and form one logical change — e.g. three small edits inside `game/Player.ts`.
- A commit only reverts or fixes the previous one — use `git commit --fixup=<sha>` so rebase auto-folds.
- The branch is not yet pushed, so no reviewer depends on the granular history.

**Keep separate when:**
- Distinct subsystems (e.g. `game/player` vs `game/audio`) — each deserves an isolated review.
- A commit deliberately bisects a bug — preserve for `git bisect`.
- A commit is already reviewed individually via PR comments — don't lose that trail.
- Conflicting build states (a commit in the middle doesn't compile; don't fold it).

**Practical:** `git log --oneline -10` to inspect, then `git rebase -i HEAD~N` (interactive) or `git reset --soft HEAD~N && git commit` for a clean re-squash. The rewritten message keeps the conventional+gitmoji+code-only rule.

When in doubt: keep separate. Over-fragmented is cheaper than under-fragmented.

## Branches & PRs

- Trunk: `master`. Work on a dedicated branch.
- Phase branches: `phase-N-<slug>` (e.g. `phase-1-core-loop`).
- Ad-hoc branches: `fix-<slug>` or `chore-<slug>`.
- Open a PR to master. PR title = commit subject. Squash-merge.
- PR uses `.github/PULL_REQUEST_TEMPLATE.md`.

## Pre-commit gate

Every commit must satisfy all four before it lands:

1. `pnpm format` — Biome formatter clean.
2. `pnpm test` — Vitest passes.
3. `pnpm exec astro check` — typecheck passes.
4. `pnpm build` — production build succeeds.

For pure logic (= systems, data, helpers): **TDD-lite** — write the failing vitest case first, then implement until it passes. For Phaser scenes, Astro pages, and assets: test internals where separable, verify visually via `pnpm dev`.

## Post-fix hook (always)

After every feature OR fix passes the gate, run the **ponytail audit** on the diff and apply its simplifications before declaring done.

## Always

- Reference code directly in commit subjects.
- Use path aliases (`@/game/...`) per `.planning/PLAN.md` §"Path Aliases".
- Add new deps from §"Tech Stack" only — surface anything new to the user first.

## Never

- Add features not in `.planning/REQUIREMENTS.md` §"Out of Scope" — re-read before each phase plan.
- Add deps not in `.planning/PLAN.md` §"Tech Stack".
- Write "what"-comments. Comments only when the *why* is non-obvious.
- Abstract single-use code.
- Add error handling for impossible scenarios.
- Write tests for trivial functions (pure getters, type re-exports). Tag with `ponytail:` if skipping.
- Add configuration for things that cannot change at runtime.
- Edit `AGENTS.md`, `.planning/`, `.opencode/`, `.codegraph/`, `pnpm-lock.yaml` without asking.

## GSD workflow

This repo runs the GSD (Get-Shit-Done) workflow on top of the operational rules above.

- `/gsd-progress` — start here to read state.
- `/gsd-discuss-phase N` — clarify approach for phase N before planning.
- `/gsd-plan-phase N` — decompose a phase into executable plans.
- `/gsd-execute-phase` — run plans in parallel waves.
- `/gsd-verify-work` — validate after execution.
- `/gsd-transition` — update PROJECT / REQUIREMENTS state after each phase.
- `/gsd-complete-milestone` — archive and reset at milestone boundaries.

Quick reference lives in `.opencode/skills/gsd-*`. Always read `.planning/STATE.md` first to recover session context.

<!-- CODEGRAPH_START -->
## CodeGraph

In repositories indexed by CodeGraph (a `.codegraph/` directory exists at the repo root), reach for it BEFORE grep/find or reading files when you need to understand or locate code:

- **MCP tool** (when available): `codegraph_explore` answers most code questions in one call — the relevant symbols' verbatim source plus the call paths between them, including dynamic-dispatch hops grep can't follow. Name a file or symbol in the query to read its current line-numbered source. If it's listed but deferred, load it by name via tool search.
- **Shell** (always works): `codegraph explore "<symbol names or question>"` prints the same output.

If there is no `.codegraph/` directory, skip CodeGraph entirely — indexing is the user's decision.
<!-- CODEGRAPH_END -->
