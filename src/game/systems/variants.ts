// Per-object visit counters (D-20: in-memory only — resets on reload, no storage).
let counts: Record<string, number> = {};

export function incrementVisit(id: string): number {
  counts[id] = (counts[id] ?? 0) + 1;
  return counts[id];
}

export function visitCount(id: string): number {
  return counts[id] ?? 0;
}

export function resetVisits(): void {
  counts = {};
}

// Visit N shows pool[(N-1) % pool.length] — deterministic cycle, no randomness (D-16).
export function variantFor(count: number, pool: string[]): string {
  return pool[(count - 1) % pool.length];
}
