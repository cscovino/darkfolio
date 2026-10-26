import { beforeEach, describe, expect, it } from 'vitest';
import {
  incrementVisit,
  resetVisits,
  variantFor,
  visitCount,
} from './variants';

const POOL = ['A', 'B', 'C'];

describe('variantFor', () => {
  it('maps visit 1 to the first pool entry', () => {
    expect(variantFor(1, POOL)).toBe('A');
  });

  it('maps visit 3 to the last pool entry', () => {
    expect(variantFor(3, POOL)).toBe('C');
  });

  it('wraps visit 4 back to the first entry (deterministic cycle, D-16)', () => {
    expect(variantFor(4, POOL)).toBe('A');
    expect(variantFor(7, POOL)).toBe('A');
  });
});

describe('visit counters', () => {
  beforeEach(() => {
    resetVisits();
  });

  it('increments per object id independently (D-18)', () => {
    incrementVisit('computer');
    incrementVisit('computer');
    incrementVisit('tv');
    expect(visitCount('computer')).toBe(2);
    expect(visitCount('tv')).toBe(1);
  });

  it('returns the new count and never auto-increments on read (D-19)', () => {
    expect(incrementVisit('computer')).toBe(1);
    expect(visitCount('computer')).toBe(1);
    expect(visitCount('computer')).toBe(1);
    expect(incrementVisit('computer')).toBe(2);
  });

  it('reports zero for an object never visited', () => {
    expect(visitCount('lamp')).toBe(0);
  });

  it('clears every counter on reset (D-20 in-memory semantics)', () => {
    incrementVisit('computer');
    incrementVisit('tv');
    resetVisits();
    expect(visitCount('computer')).toBe(0);
    expect(visitCount('tv')).toBe(0);
  });
});
