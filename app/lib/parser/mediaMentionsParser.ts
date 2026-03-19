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
import { LocalizedString } from '~/types/common';

const toLocalized = (value: string): LocalizedString => ({
  uk: value,
  en: value,
});

export default async function parseMediaMention(
  url: string
): Promise<Omit<MediaMentionEntityRaw, 'status' | 'slug' | 'meta'>> {
  const resp = await fetch(url, {
    method: 'GET',
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MediaMentionsParser/1.0)' }
  });

  if (!resp.ok) {
    throw new Error(`Failed to fetch URL: ${resp.status} ${resp.statusText}`);
  }

  const html = await resp.text();
  const parsed = Parser(html);

  const now = new Date().toISOString();

  return {
    url,
    adminTitle: parsed.title,
    title: toLocalized(parsed.title),
    description: toLocalized(parsed.description),
    keywords: toLocalized(''),
    allowIndexation: { uk: true, en: true },
    coverImage: {
      src: parsed.image.src,
      alt: toLocalized(parsed.image.alt),
      width: parsed.image.width,
      height: parsed.image.height
    },
    publishedAt: parsed.published_time
      ? new Date(parsed.published_time).toISOString()
      : now,
    createdAt: now,
    updatedAt: now,
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

export function parseAttributes(attrStr: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /([A-Za-z0-9:_-]+)\s*(?:=\s*(?:"((?:\\.|[^"\\])*)"|([^\s"'>]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(attrStr)) !== null) {
    const name = m[1].toLowerCase();
    const raw = m[2] ?? m[3] ?? m[4] ?? '';
    const value = raw.replaceAll(/\\(["'\\])/g, '$1');
    out[name] = value;
  }
  return out;
}

export function parseMetaTags(html: string): MetaTag[] {
  const metaTagRe = /<meta\s+\b([^>]*)\/?>/gi;

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

  const jsonld = (parseJsonLd(content) as Record<string, unknown>) ?? {};

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