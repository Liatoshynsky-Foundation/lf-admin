import { parseDateFlexible, parseMaybeInt, pickFirst, unescapeEntities } from './parserUtils';

export function ParseTitle(
  metaMap: Map<string, string>,
  jsonld: Record<string, unknown>,
  content: string
): string | undefined {
  const title = pickFirst(metaMap, ['og:title', 'twitter:title', 'title', 'name']);
  if (title) {
    return title;
  }

  if (jsonld) {
    if (typeof jsonld['headline'] === 'string' && jsonld['headline']) return jsonld['headline'];
    else if (typeof jsonld['name'] === 'string' && jsonld['name']) return jsonld['name'];
  }

  let t = (/<title>([\s\S]*?)<\/title>/i.exec(content) || [])[1];
  if (t) return unescapeEntities(t.trim());

  t = (/<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(content) || [])[1];
  if (t) return unescapeEntities(t.trim());

  return undefined;
}

export function ParseDescription(metaMap: Map<string, string>, jsonld: Record<string, unknown>): string | undefined {
  const desc = pickFirst(metaMap, ['og:description', 'twitter:description', 'description']);
  if (desc) return desc;
  else if (jsonld && typeof jsonld['description'] === 'string') return jsonld['description'];

  return undefined;
}

export function ParseSiteName(metaMap: Map<string, string>, jsonld: Record<string, unknown>): string | undefined {
  const sname = pickFirst(metaMap, ['og:site_name', 'application-name']);
  if (sname) return sname;

  if (!jsonld) return undefined;
  if (typeof jsonld['name'] === 'string') return jsonld['name'];

  return undefined;
}

export function ParseType(metaMap: Map<string, string>, jsonld: Record<string, unknown>): string | undefined {
  const ttype = pickFirst(metaMap, ['og:type']);
  if (ttype) return ttype;
  else if (jsonld && typeof jsonld['type'] === 'string') return jsonld['type'];
  return undefined;
}

export function ParseAuthor(metaMap: Map<string, string>, jsonld: Record<string, unknown>): string | undefined {
  const author = pickFirst(metaMap, ['author', 'article:author', 'dc.creator', 'byline']);
  if (author) return author;
  else if (jsonld?.['author']) {
    const a = jsonld['author'];
    if (typeof a === 'string') return a;
    else if (a && typeof a === 'object') {
      const ao = a as Record<string, unknown>;
      if (typeof ao['name'] === 'string') return ao['name'];
    }
  }
  return undefined;
}

export function ParsePublishedDate(
  metaMap: Map<string, string>,
  jsonld: Record<string, unknown>,
  content: string
): string | undefined {
  const pub = pickFirst(metaMap, ['article:published_time', 'article:published', 'pubdate', 'datepublished', 'date']);
  if (pub) {
    const d = parseDateFlexible(pub);
    if (d) return d.toISOString();
  } else if (jsonld?.['datePublished'] && typeof jsonld['datePublished'] === 'string') {
    const d = parseDateFlexible(jsonld['datePublished']);
    if (d) return d.toISOString();
  }

  const td = (/<time\b[^>]*\bdatetime\s*=\s*["']([^"']+)["'][^>]*>/i.exec(content) || [])[1];
  if (td) {
    const d = parseDateFlexible(td.trim());
    if (d) return d.toISOString();
  }

  const tt = (/<time\b[^>]*>([\s\S]*?)<\/time>/i.exec(content) || [])[1];
  if (tt) {
    const txt = unescapeEntities(tt.trim());
    const d = parseDateFlexible(txt);
    if (d) return d.toISOString();
  }
}

export function ParseImage(metaMap: Map<string, string>, jsonld: Record<string, unknown>) {
  const image = {
    src: 'unknown',
    alt: 'unknown',
    width: null as number | null,
    height: null as number | null
  };

  const img = pickFirst(metaMap, ['og:image', 'twitter:image', 'image']);
  if (img) {
    image.src = img;
  } else if (jsonld?.['image']) {
    const im = jsonld['image'];

    const parseJsonImage = (val: unknown) => {
      const out: { src?: string; width?: number | null; height?: number | null } = {};
      if (typeof val === 'string') {
        out.src = val;
        return out;
      }
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string') {
        out.src = val[0];
        return out;
      }
      if (val && typeof val === 'object') {
        const o = val as Record<string, unknown>;
        if (typeof o['url'] === 'string') out.src = o['url'];
        else if (typeof o['src'] === 'string') out.src = o['src'];
        if (typeof o['width'] === 'number') out.width = o['width'];
        if (typeof o['height'] === 'number') out.height = o['height'];
      }
      return out;
    };

    const parsed = parseJsonImage(im);
    if (parsed.src) image.src = parsed.src;
    if (parsed.width !== undefined) image.width = parsed.width ?? null;
    if (parsed.height !== undefined) image.height = parsed.height ?? null;
  }

  const imgAlt = pickFirst(metaMap, ['og:image:alt', 'twitter:image:alt']);
  if (imgAlt) image.alt = imgAlt;
  const imgW = pickFirst(metaMap, ['og:image:width', 'twitter:image:width']);
  const imgH = pickFirst(metaMap, ['og:image:height', 'twitter:image:height']);
  const wi = parseMaybeInt(imgW);
  const hi = parseMaybeInt(imgH);
  image.width = wi;
  image.height = hi;

  return image;
}

export function ParseCanonical(content: string) {
  const canon = (/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i.exec(content) || [])[1];
  if (canon) return canon.trim();
  return undefined;
}
