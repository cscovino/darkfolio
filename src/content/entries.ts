// Single source for the CRT overlay slots and the standalone stub pages.
export type Entry = { title: string; description: string; href?: string };

export const projects: Entry[] = [
  {
    title: 'Darkfolio',
    description: 'This house. You are inside the portfolio.',
  },
  {
    title: 'CRT Terminal Kit',
    description: 'A fake terminal that boots faster than most real ones.',
  },
  {
    title: 'Pixel Weather',
    description: '16-bit forecasts for cities that may not exist.',
  },
];

export const skills: Entry[] = [
  { title: 'Phaser', description: 'arcade physics, tweens, scenes' },
  { title: 'TypeScript', description: 'strict types, no any' },
  { title: 'Astro', description: 'static sites, content collections' },
  { title: 'Game Design', description: 'loops, doors, pacing' },
  { title: 'Pixel Art', description: '16-bit sprites, 32x32 heroes' },
  { title: 'UI Contracts', description: 'tokens, spacing, copy' },
  { title: 'CSS', description: 'dark themes, no frameworks' },
  { title: 'Accessibility', description: 'keyboard first, contrast checked' },
  { title: 'Writing', description: 'docs that survive humans' },
  { title: 'Git', description: 'small commits, no force-pushes' },
];

export const contacts: Entry[] = [
  {
    title: 'Email',
    description: 'hello@example.com',
    href: 'mailto:hello@example.com',
  },
  {
    title: 'GitHub',
    description: 'github.com/example',
    href: 'https://github.com/example',
  },
  {
    title: 'LinkedIn',
    description: 'linkedin.com/in/example',
    href: 'https://linkedin.com/in/example',
  },
];

export const CONTACT_NOTE =
  'No newsletter. No blog. No tracker. Just these three.';
