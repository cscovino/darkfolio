const biomeIgnored = (f) => /(^|\/)\.(planning|opencode)\//.test(f);

export default {
  '*.{ts,tsx,js,jsx,mjs,cjs,json}': (files) => {
    const checked = files.filter((f) => !biomeIgnored(f));
    return checked.length
      ? [`biome check --write ${checked.map((f) => `"${f}"`).join(' ')}`]
      : [];
  },
};
