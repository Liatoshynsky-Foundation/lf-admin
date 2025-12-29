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

// Unescape HTML entities and \uXXXX escapes and double-escaped forms like u0026#x430;
export function unescapeEntities(s: string): string {
  s = s.replaceAll('\u0026', '&');
  s = s.replaceAll('\u0026', '&');

  s = s.replaceAll(new RegExp(String.raw`\u([0-9a-fA-F]{4})`, 'g'), (_, hex) => {
    const code = Number.parseInt(hex, 16);
    if (!Number.isNaN(code)) return String.fromCharCode(code);
    return _;
  });

  s = s.replaceAll(new RegExp(String.raw`&#x([0-9a-fA-F]+);?`, 'g'), (_, hex) =>
    String.fromCodePoint(Number.parseInt(hex, 16))
  );
  s = s.replaceAll(new RegExp(String.raw`&#(\d+);?`, 'g'), (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)));

  const named: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: String.fromCodePoint(0x22), // "
    apos: String.fromCodePoint(0x27), // '
    nbsp: ' '
  };
  s = s.replaceAll(new RegExp(String.raw`&([a-zA-Z]+);`, 'g'), (m, name) => named[name] ?? m);

  return s;
}

export function parseJsonLd(html: string): Record<string, unknown> | null {
  const re = /<script\b[^>]*type=['"]application\/ld\+json['"][^>]*>([\s\S]*?)<\/script>/i;
  const m = re.exec(html);
  if (!m) return null;
  const raw = m[1]
    .trim()
    .replaceAll(/,\s*(?=[}\]])/g, '')
    .replaceAll(String.fromCodePoint(0x27), String.fromCodePoint(0x22));

  try {
    const v = JSON.parse(raw);
    if (Array.isArray(v)) return v.length > 0 && typeof v[0] === 'object' ? v[0] : null;
    if (typeof v === 'object' && v !== null) return v;
  } catch {
    try {
      const firstObj = extractFirstJSONBlock(raw);
      if (firstObj) return JSON.parse(firstObj);
    } catch {
      return null;
    }
  }
  return null;
}

function extractFirstJSONBlock(s: string): string | null {
  const start = s.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let stringChar = '';
  let escaped = false;

  for (let i = start; i < s.length; i++) {
    const ch = s[i];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === stringChar) {
        inString = false;
        stringChar = '';
      }
      continue;
    }

    switch (ch) {
    case String.fromCodePoint(0x22):
    case String.fromCodePoint(0x27):
      inString = true;
        stringChar = ch;
      break;
    case '{':
      depth++;
      break;
    case '}':
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
        break;
    default:
      break;
    }
  }
  return null;
}

export function parseDateFlexible(input: string): Date | null {
  if (!input) return null;
  input = input.trim();
  const d1 = new Date(input);
  if (!Number.isNaN(d1.getTime())) return d1;

  // try dd.MM.yyyy HH:mm or dd.MM.yyyy
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:[ T](\d{1,2}):(\d{2}))?/.exec(input);

  if (m) {
    const day = Number.parseInt(m[1], 10);
    const month = Number.parseInt(m[2], 10) - 1;
    const year = Number.parseInt(m[3], 10);
    const hour = m[4] ? Number.parseInt(m[4], 10) : 0;
    const min = m[5] ? Number.parseInt(m[5], 10) : 0;
    const dt = new Date(Date.UTC(year, month, day, hour, min, 0));
    return dt;
  }

  return null;
}
