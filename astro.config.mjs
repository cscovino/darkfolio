import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  base: '/darkfolio',
  output: 'static',
  server: { host: true },
});
