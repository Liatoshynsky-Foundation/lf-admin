import {
  ParseAuthor,
  ParseDescription,
  ParseImage,
  ParsePublishedDate,
  ParseSiteName,
  ParseTitle,
  ParseType
} from './parserRoutines';
import { parseJsonLd, unescapeEntities } from './parserUtils';
import { MediaMentionEntityRaw } from '~/domain/entities/MediaMentions';

export async function parseMediaMention(url: string): Promise<Omit<MediaMentionEntityRaw, 'status' | 'slug' | 'meta'>> {
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
    publishedAt: parsed.published_time ? new Date(parsed.published_time) : new Date()
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
  published_time?: string;
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

export function Parser(html_content: string): ParsedData {
  const content = unescapeEntities(html_content);

  const metaTags = parseMetaTags(content);
  const metaMap = new Map<string, string>();
  for (const t of metaTags) {
    const key = t.attrValue.toLowerCase().trim();
    if (!key) continue;
    if (!metaMap.has(key) || (metaMap.get(key) || '').trim() === '') {
      metaMap.set(key, (t.content || '').trim());
    }
  }

  const jsonld = parseJsonLd(content) ?? {};

  return {
    type: ParseType(metaMap, jsonld) || UNKNOWN,
    title: ParseTitle(metaMap, jsonld, content) || UNKNOWN,
    description: ParseDescription(metaMap, jsonld) || UNKNOWN,
    image: ParseImage(metaMap, jsonld),
    site_name: ParseSiteName(metaMap, jsonld) || UNKNOWN,
    author: ParseAuthor(metaMap, jsonld) || UNKNOWN,
    published_time: ParsePublishedDate(metaMap, jsonld, content)
  } as ParsedData;
}
