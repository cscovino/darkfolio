export default {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      // commitlint 19 reads parser options only via parserPreset.parserOpts —
      // a top-level headerPattern is dead config. Pattern must compile identically
      // under `new RegExp(p)` and `new RegExp(p, 'u')`: BMP code-point class +
      // literal astral emoji + optional VS-16. Exactly 3 capture groups: type, scope, subject.
      headerPattern:
        '^(?:[\\u2190-\\u2BFF\\u3030\\u303D]|🐛|📝|🎨|🔧|🚀|💡|🔥|🌱|🔒|👷|🔖|🚨|🎯|🚑|💬|📦|🔄|🚧)(?:\\uFE0F)?\\s+(feat|fix|refactor|perf|test|docs|style|chore|build|ci)(?:\\(([a-z0-9-]+)\\))?!?:\\s(.+)',
    },
  },
  rules: {
    'header-max-length': [2, 'always', 72],
  },
};
