import { parseMaybeInt, pickFirst } from './parserUtils';
import { MediaMentionEntityRaw } from '~/domain/entities/MediaMentions';

export async function parseMediaMention(url: string): Promise<Omit<MediaMentionEntityRaw, 'status' | 'slug'>> {
  const resp = await fetch(url, {
    method: 'GET',
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MediaMentionsParser/1.0)' }
  });
  if (!resp.ok) {
    throw new Error(`Failed to fetch URL: ${resp.status} ${resp.statusText}`);
  }
  const html = await resp.text();
  const parsed = Parser(html);

  return {
    url,
    title: parsed.title,
    description: parsed.description,
    coverImage: {
      src: parsed.image.src,
      alt: parsed.image.alt,
      width: parsed.image.width,
      height: parsed.image.height
    },
    publishedAt: parsed.published_time ? new Date(parsed.published_time) : new Date(),
    meta: {
      views: 0
    }
  };
}

export interface ImageData {
  src: string;
  alt: string;
  width: number | null;
  height: number | null;
}

export interface ParsedData {
  type: string;
  title: string;
  description: string;
  image: ImageData;
  site_name: string;
  author: string;
  published_time: string | null;
}

const UNKNOWN = 'unknown';

type MetaTag = {
  attrName: string;
  attrValue: string;
  content: string;
};

function parseAttributes(attrStr: string): Record<string, string> {
  const out: Record<string, string> = {};
  let i = 0;
  const len = attrStr.length;

  const isNameChar = (ch: string) => /[A-Za-z0-9:_-]/.test(ch);
  const isSpace = (ch: string) => /\s/.test(ch);

  while (i < len) {
    // skip whitespace
    while (i < len && isSpace(attrStr[i])) i++;
    if (i >= len) break;

    // read name
    const nameStart = i;
    while (i < len && isNameChar(attrStr[i])) i++;
    if (i === nameStart) {
      // skip a char to avoid infinite loop on unexpected input
      i++;
      continue;
    }
    const name = attrStr.slice(nameStart, i).toLowerCase();

    // skip whitespace
    while (i < len && isSpace(attrStr[i])) i++;

    let value = '';
    if (i < len && attrStr[i] === '=') {
      i++; // skip '='
      while (i < len && isSpace(attrStr[i])) i++;
      // 0x22 = ", 0x27 = '
      if (i < len && (attrStr[i] === String(0x22) || attrStr[i] === String(0x27))) {
        const quote = attrStr[i++];
        const valStart = i;
        let escaped = false;
        while (i < len) {
          const ch = attrStr[i];
          if (escaped) {
            escaped = false;
            i++;
            continue;
          }
          if (ch === '\\') {
            escaped = true;
            i++;
            continue;
          }
          if (ch === quote) break;
          i++;
        }
        value = attrStr.slice(valStart, i);
        if (i < len && attrStr[i] === quote) i++; // skip closing quote
      } else {
        const valStart = i;
        while (i < len && !isSpace(attrStr[i]) && attrStr[i] !== '>') i++;
        value = attrStr.slice(valStart, i);
      }
    }

    out[name] = value;
  }

  return out;
}

function parseMetaTags(html: string): MetaTag[] {
  const metaTagRe = /<meta\b([^>]*)>/gi;

  const tags: MetaTag[] = [];
  let m: RegExpExecArray | null;
  while ((m = metaTagRe.exec(html)) !== null) {
    const attrStr = m[1];
    const attrs = parseAttributes(attrStr);
    const key = attrs['property'] || attrs['name'] || '';
    const content = attrs['content'] || '';
    if (key && content) {
      tags.push({ attrName: attrs['property'] ? 'property' : 'name', attrValue: key, content });
    }
  }
  return tags;
}

// Unescape HTML entities and \uXXXX escapes and double-escaped forms like u0026#x430;
function unescapeEntities(s: string): string {
  // normalize double-escaped JSON forms"
  s = s.replaceAll(/\\u0026/g, '&');
  s = s.replaceAll(/u0026/g, '&');

  // decode \uXXXX escapes
  s = s.replaceAll(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
    const code = Number.parseInt(hex, 16);
    if (!Number.isNaN(code)) return String.fromCharCode(code);
    return _;
  });

  // decode numeric entities like &#x430
  s = s.replaceAll(/&#x([0-9a-fA-F]+);?/g, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)));
  s = s.replaceAll(/&#(\d+);?/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)));

  // decode named entities
  const named: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: String(0x22), // "
    apos: String(0x27), // '
    nbsp: ' '
  };
  s = s.replaceAll(/&([a-zA-Z]+);/g, (m, name) => named[name] ?? m);

  return s;
}

function extractFirstJSONBlock(s: string): string | null {
  const start = s.indexOf('{');
  if (start === -1) return null;

  let i = start;
  let depth = 0;
  let inString = false;
  let stringChar = '';
  let escaped = false;

  for (; i < s.length; i++) {
    const ch = s[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === stringChar) {
        inString = false;
        stringChar = '';
      }
      continue;
    }

    if (ch === String(0x22) || ch === String(0x27)) {
      inString = true;
      stringChar = ch;
      continue;
    }

    if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return s.slice(start, i + 1);
      }
    }
  }
  return null;
}

function parseJsonLd(html: string): Record<string, unknown> | null {
  const re = /<script\b[^>]*type=['"]application\/ld\+json['"][^>]*>([\s\S]*?)<\/script>/i;
  const m = re.exec(html);
  if (!m) return null;
  const raw = m[1].trim();
  try {
    const v = JSON.parse(raw);
    if (Array.isArray(v)) return v.length > 0 && typeof v[0] === 'object' ? v[0] : null;
    if (typeof v === 'object' && v !== null) return v;
  } catch {
    // try to repair by trimming surrounding junk
    try {
      // sometimes sites put multiple objects; try to find first {...}
      const firstObj = extractFirstJSONBlock(raw);
      if (firstObj) return JSON.parse(firstObj);
    } catch {
      return null;
    }
  }
  return null;
}

function parseDateFlexible(input: string): Date | null {
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

export function Parser(html_content: string): ParsedData {
  const content = unescapeEntities(html_content);

  const data: ParsedData = {
    type: UNKNOWN,
    title: UNKNOWN,
    description: UNKNOWN,
    image: { src: UNKNOWN, alt: UNKNOWN, width: null, height: null },
    site_name: UNKNOWN,
    author: UNKNOWN,
    published_time: null
  };

  const metaTags = parseMetaTags(content);
  const metaMap = new Map<string, string>();
  for (const t of metaTags) {
    const key = t.attrValue.toLowerCase().trim();
    if (!key) continue;
    if (!metaMap.has(key) || (metaMap.get(key) || '').trim() === '') {
      metaMap.set(key, (t.content || '').trim());
    }
  }

  const jsonld = parseJsonLd(content);

  // Title
  const title = pickFirst(metaMap, ['og:title', 'twitter:title', 'title', 'name']);
  if (title) data.title = title;
  else if (jsonld) {
    if (typeof jsonld['headline'] === 'string' && jsonld['headline']) data.title = jsonld['headline'];
    else if (typeof jsonld['name'] === 'string' && jsonld['name']) data.title = jsonld['name'];
  }
  if (data.title === UNKNOWN) {
    const t = (/<title>([\s\S]*?)<\/title>/i.exec(content) || [])[1];
    if (t) data.title = unescapeEntities(t.trim());
  }
  if (data.title === UNKNOWN) {
    const t = (/<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(content) || [])[1];
    if (t) data.title = unescapeEntities(t.trim());
  }

  // Description
  const desc = pickFirst(metaMap, ['og:description', 'twitter:description', 'description']);
  if (desc) data.description = desc;
  else if (jsonld && typeof jsonld['description'] === 'string') data.description = jsonld['description'];

  // Site name and type
  const sname = pickFirst(metaMap, ['og:site_name', 'application-name']);
  if (sname) data.site_name = sname;
  const ttype = pickFirst(metaMap, ['og:type']);
  if (ttype) data.type = ttype;

  // Author
  const author = pickFirst(metaMap, ['author', 'article:author', 'dc.creator', 'byline']);
  if (author) data.author = author;
  else if (jsonld?.['author']) {
    const a = jsonld['author'];
    if (typeof a === 'string') data.author = a;
    else if (a && typeof a === 'object') {
      const ao = a as Record<string, unknown>;
      if (typeof ao['name'] === 'string') data.author = ao['name'];
    }
  }

  // Published time
  const pub = pickFirst(metaMap, ['article:published_time', 'article:published', 'pubdate', 'datepublished', 'date']);
  if (pub) {
    const d = parseDateFlexible(pub);
    if (d) data.published_time = d.toISOString();
  } else if (jsonld?.['datePublished'] && typeof jsonld['datePublished'] === 'string') {
    const d = parseDateFlexible(jsonld['datePublished']);
    if (d) data.published_time = d.toISOString();
  }

  // Image
  const img = pickFirst(metaMap, ['og:image', 'twitter:image', 'image']);
  if (img) data.image.src = img;
  else if (jsonld?.['image']) {
    const im = jsonld['image'];
    if (typeof im === 'string') data.image.src = im;
    else if (Array.isArray(im) && im.length > 0 && typeof im[0] === 'string') data.image.src = im[0];
    else if (im && typeof im === 'object') {
      const imObj = im as Record<string, unknown>;
      if (typeof imObj['url'] === 'string') data.image.src = imObj['url'];
    }
  }

  const imgAlt = pickFirst(metaMap, ['og:image:alt', 'twitter:image:alt']);
  if (imgAlt) data.image.alt = imgAlt;
  const imgW = pickFirst(metaMap, ['og:image:width', 'twitter:image:width']);
  const imgH = pickFirst(metaMap, ['og:image:height', 'twitter:image:height']);
  const wi = parseMaybeInt(imgW);
  const hi = parseMaybeInt(imgH);
  data.image.width = wi;
  data.image.height = hi;

  // Canonical link fallback for site_name
  const canon = (/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i.exec(content) || [])[1];
  if (canon && data.site_name === UNKNOWN) data.site_name = canon.trim();

  // Time tag fallback
  if (!data.published_time) {
    const td = (/<time\b[^>]*\bdatetime\s*=\s*["']([^"']+)["'][^>]*>/i.exec(content) || [])[1];
    if (td) {
      const d = parseDateFlexible(td.trim());
      if (d) data.published_time = d.toISOString();
    }
  }
  if (!data.published_time) {
    const tt = (/<time\b[^>]*>([\s\S]*?)<\/time>/i.exec(content) || [])[1];
    if (tt) {
      const txt = unescapeEntities(tt.trim());
      const d = parseDateFlexible(txt);
      if (d) data.published_time = d.toISOString();
    }
  }

  return data;
}
