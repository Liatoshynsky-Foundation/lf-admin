export function pickFirst(map: Map<string, string>, keys: string[]): string | null {
  for (const k of keys) {
    const v = map.get(k);
    if (v && v.trim() !== '') return v.trim();
  }
  return null;
}

export function parseMaybeInt(v: string | null): number | null {
  if (!v) return null;
  const n = Number.parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
}
