import { describe, expect, it } from 'vitest';
import { INTERACTABLES } from './interactables';

describe('INTERACTABLES route map', () => {
  it('maps host objects to their overlay routes', () => {
    const hostRoutes = Object.fromEntries(
      INTERACTABLES.filter((o) => o.overlay !== undefined).map((o) => [
        o.id,
        o.overlay,
      ]),
    );

    expect(hostRoutes).toEqual({
      computer: '/projects',
      bookshelf: '/skills',
      phone: '/contact',
    });
  });

  it('keeps TV and lamp as dialog-only objects with no overlay', () => {
    const dialogOnlyIds = INTERACTABLES.filter((o) => o.overlay === undefined)
      .map((o) => o.id)
      .toSorted();

    expect(dialogOnlyIds).toEqual(['lamp', 'tv']);
  });
});

describe('INTERACTABLES dialog pools', () => {
  it('gives every interactable at least one dialog variant', () => {
    const emptyPoolIds = INTERACTABLES.filter((o) => o.dialogPool.length === 0)
      .map((o) => o.id)
      .toSorted();

    expect(emptyPoolIds).toEqual([]);
  });
});
