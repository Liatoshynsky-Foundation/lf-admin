const SINGLE_QUOTE = String.fromCodePoint(0x27);
const DOUBLE_QUOTE = String.fromCodePoint(0x22);

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

export function unescapeEntities(s: string): string {
  s = s.replaceAll('\u0026', '&');

  s = s.replaceAll(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
    const code = Number.parseInt(hex, 16);
    return String.fromCodePoint(code);
  });

  s = s.replaceAll(/&#x([0-9a-fA-F]+);?/g, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)));
  s = s.replaceAll(/&#(\d+);?/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)));

  const named: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: DOUBLE_QUOTE,
    apos: SINGLE_QUOTE,
    nbsp: ' '
  };
  s = s.replaceAll(/&([a-zA-Z]+)/g, (m, name) => named[name] ?? m);

  return s;
}

export function parseJsonLd(html: string): Record<string, unknown> | null {
  const re = /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i;
  const m = re.exec(html);
  if (!m) return null;
  const raw = m[1]
    .trim()
    .replaceAll(/,\s*(?=[}\]])/g, '')
    .replaceAll(SINGLE_QUOTE, DOUBLE_QUOTE);

  try {
    const v = JSON.parse(raw);
    if (Array.isArray(v)) return v.length > 0 && typeof v[0] === 'object' ? (v[0] as Record<string, unknown>) : null;
    if (typeof v === 'object' && v !== null) return v as Record<string, unknown>;
  } catch {
    return null;
  }
  return null;
}

export function parseDateFlexible(input: string | null): Date | null {
  if (!input) return null;
  const trimmed = input.trim();
  const d1 = new Date(trimmed);
  if (!Number.isNaN(d1.getTime())) return d1;

  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:[ T](\d{1,2}):(\d{2}))?/.exec(trimmed);

  if (m) {
    const day = Number.parseInt(m[1], 10);
    const month = Number.parseInt(m[2], 10) - 1;
    const year = Number.parseInt(m[3], 10);
    const hour = m[4] ? Number.parseInt(m[4], 10) : 0;
    const min = m[5] ? Number.parseInt(m[5], 10) : 0;
    const dt = new Date(year, month, day, hour, min);
    return dt;
  }

  return null;
}
