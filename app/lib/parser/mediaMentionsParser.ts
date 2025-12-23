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

function parseMetaTags(html: string): MetaTag[] {
  const metaTagRe = /<meta\b([^>]*)>/gi;
  const attrRe = /([A-Za-z0-9:_-]+)\s*=\s*['"]([^'"`]*)['"]/gi;
  const tags: MetaTag[] = [];
  let m: RegExpExecArray | null;
  while ((m = metaTagRe.exec(html)) !== null) {
    const attrStr = m[1];
    let attrMatch: RegExpExecArray | null;
    const attrs: Record<string, string> = {};
    attrRe.lastIndex = 0;
    while ((attrMatch = attrRe.exec(attrStr)) !== null) {
      const k = attrMatch[1].toLowerCase();
      const v = attrMatch[2];
      attrs[k] = v;
    }

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
  s = s.replace(/\\u0026/g, '&');
  s = s.replace(/u0026/g, '&');

  // decode \uXXXX escapes
  s = s.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
    const code = parseInt(hex, 16);
    if (!Number.isNaN(code)) return String.fromCharCode(code);
    return _;
  });

  // decode numeric entities like &#x430
  s = s.replace(/&#x([0-9a-fA-F]+);?/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  s = s.replace(/&#(\d+);?/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));

  // decode named entities
  const named: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'", // eslint-disable-line quotes
    nbsp: ' '
  };
  s = s.replace(/&([a-zA-Z]+);/g, (m, name) => (named[name] !== undefined ? named[name] : m));

  return s;
}

function parseJsonLd(html: string): Record<string, any> | null {
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
      const firstObj = raw.match(/\{[\s\S]*\}/);
      if (firstObj) return JSON.parse(firstObj[0]);
    } catch {
      return null;
    }
  }
  return null;
}

function pickFirst(map: Map<string, string>, keys: string[]): string | null {
  for (const k of keys) {
    const v = map.get(k);
    if (v && v.trim() !== '') return v.trim();
  }
  return null;
}

function parseMaybeInt(v: string | null): number | null {
  if (!v) return null;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
}

function parseDateFlexible(input: string): Date | null {
  if (!input) return null;
  input = input.trim();
  const d1 = new Date(input);
  if (!isNaN(d1.getTime())) return d1;

  // try dd.MM.yyyy HH:mm or dd.MM.yyyy
  const m = input.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:[ T](\d{1,2}):(\d{2}))?/);
  if (m) {
    const day = parseInt(m[1], 10);
    const month = parseInt(m[2], 10) - 1;
    const year = parseInt(m[3], 10);
    const hour = m[4] ? parseInt(m[4], 10) : 0;
    const min = m[5] ? parseInt(m[5], 10) : 0;
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
    const t = (content.match(/<title>([\s\S]*?)<\/title>/i) || [])[1];
    if (t) data.title = unescapeEntities(t.trim());
  }
  if (data.title === UNKNOWN) {
    const t = (content.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || [])[1];
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
  else if (jsonld && jsonld['author']) {
    const a = jsonld['author'];
    if (typeof a === 'string') data.author = a;
    else if (typeof a === 'object' && a && typeof a['name'] === 'string') data.author = a['name'];
  }

  // Published time
  const pub = pickFirst(metaMap, ['article:published_time', 'article:published', 'pubdate', 'datepublished', 'date']);
  if (pub) {
    const d = parseDateFlexible(pub);
    if (d) data.published_time = d.toISOString();
  } else if (jsonld && typeof jsonld['datePublished'] === 'string') {
    const d = parseDateFlexible(jsonld['datePublished']);
    if (d) data.published_time = d.toISOString();
  }

  // Image
  const img = pickFirst(metaMap, ['og:image', 'twitter:image', 'image']);
  if (img) data.image.src = img;
  else if (jsonld && jsonld['image']) {
    const im = jsonld['image'];
    if (typeof im === 'string') data.image.src = im;
    else if (Array.isArray(im) && im.length > 0 && typeof im[0] === 'string') data.image.src = im[0];
    else if (typeof im === 'object' && im && typeof im['url'] === 'string') data.image.src = im['url'];
  }

  const imgAlt = pickFirst(metaMap, ['og:image:alt', 'twitter:image:alt']);
  if (imgAlt) data.image.alt = imgAlt;
  const imgW = pickFirst(metaMap, ['og:image:width', 'twitter:image:width']);
  const imgH = pickFirst(metaMap, ['og:image:height', 'twitter:image:height']);
  const wi = parseMaybeInt(imgW);
  const hi = parseMaybeInt(imgH);
  if (wi !== null) data.image.width = wi;
  if (hi !== null) data.image.height = hi;

  // Canonical link fallback for site_name
  const canon = (content.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i) || [])[1];
  if (canon && data.site_name === UNKNOWN) data.site_name = canon.trim();

  // Time tag fallback
  if (!data.published_time) {
    const td = (content.match(/<time\b[^>]*\bdatetime\s*=\s*["']([^"']+)["'][^>]*>/i) || [])[1];
    if (td) {
      const d = parseDateFlexible(td.trim());
      if (d) data.published_time = d.toISOString();
    }
  }
  if (!data.published_time) {
    const tt = (content.match(/<time\b[^>]*>([\s\S]*?)<\/time>/i) || [])[1];
    if (tt) {
      const txt = unescapeEntities(tt.trim());
      const d = parseDateFlexible(txt);
      if (d) data.published_time = d.toISOString();
    }
  }

  return data;
}
