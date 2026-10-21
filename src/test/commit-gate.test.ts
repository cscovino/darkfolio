import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import config from '../../commitlint.config.js';

// Pins the commit-format gate: a future edit that moves headerPattern back to
// top level (dead config in commitlint 19) or drops a gitmoji class must fail
// `pnpm test` — which every pre-push runs — instead of silently un-enforcing
// the format.
const parserOpts = config.parserPreset?.parserOpts as {
  headerPattern?: string;
};
const pattern = parserOpts.headerPattern as string;
const RE = new RegExp(pattern);
const RE_U = new RegExp(pattern, 'u');

// Every emoji class the pattern must accept: BMP ✨, astral 🐛,
// VS-16 ♻️, bare ♻, astral 🚀.
const good = [
  '✨ feat(game): add player movement',
  '🐛 fix(pages): guard null params',
  '♻️ refactor(game): tidy loop',
  '♻ refactor(game): tidy loop',
  '🚀 chore(config): point build at pages',
];
const bad = [
  'bad message',
  'feat(game): missing emoji',
  '✨ nope(deps): bad type',
];

describe('commit-msg gate', () => {
  it('wires headerPattern under parserPreset.parserOpts, not top level', () => {
    expect((config as Record<string, unknown>).headerPattern).toBeUndefined();
  });

  it('pins the 72-char header cap', () => {
    expect(config.rules['header-max-length']).toEqual([2, 'always', 72]);
  });

  it('accepts every emoji class of the locked gitmoji table in both flag modes', () => {
    for (const header of good) {
      expect(RE.test(header)).toBe(true);
      expect(RE_U.test(header)).toBe(true);
    }
  });

  it('rejects no-emoji, bad-type, and garbage headers in both flag modes', () => {
    for (const header of bad) {
      expect(RE.test(header)).toBe(false);
      expect(RE_U.test(header)).toBe(false);
    }
  });

  it('yields type/scope/subject as capture groups 1-3', () => {
    const m = RE.exec('✨ feat(game): add player movement');
    expect(m).not.toBeNull();
    expect([m?.[1], m?.[2], m?.[3]]).toEqual([
      'feat',
      'game',
      'add player movement',
    ]);
  });

  // `pnpm commitlint --edit "$1"` appends the hook's args to
  // the package script; a script that already carries --edit composes a second
  // one, and commitlint 19 then validates COMMIT_EDITMSG instead of $1 — a
  // silent gate bypass on merge commits. Pin the composition.
  it('composes hook body and commitlint script into exactly one --edit', () => {
    const pkg = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
    );
    expect(pkg.scripts.commitlint.trim()).toBe('commitlint');
    const hook = readFileSync(join(process.cwd(), '.husky/commit-msg'), 'utf8');
    expect(hook).toContain('pnpm commitlint --edit "$1"');
    const composed = `${(pkg.scripts.commitlint as string).trim()} --edit "$1"`;
    expect(composed.match(/--edit/g)).toHaveLength(1);
  });
});
