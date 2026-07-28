import {
  ParseAuthor,
  ParseCanonical,
  ParseDescription,
  ParseImage,
  ParsePublishedDate,
  ParseSiteName,
  ParseTitle,
  ParseType
} from './parserRoutines';

describe('parserRoutines', () => {
  describe('ParseTitle', () => {
    it('should prefer meta map values', () => {
      const m = new Map<string, string>([['og:title', 'OG']]);
      const res = ParseTitle(m, {}, '<title>HTML</title>');
      expect(res).toBe('OG');
    });

    it('should fall back to <title> and <h1>', () => {
      const m = new Map<string, string>();
      expect(ParseTitle(m, {}, '<title>HTML Title</title>')).toBe('HTML Title');
      expect(ParseTitle(m, {}, '<h1>Heading</h1>')).toBe('Heading');
    });

    it('should use jsonld headline when metaMap empty', () => {
      const json = { headline: 'JSON-LD Title' };
      expect(ParseTitle(new Map(), json, '<title>ignored</title>')).toBe('JSON-LD Title');
    });

    it('should use jsonld name property when headline is missing in ParseTitle', () => {
      const json = { name: 'JSON-LD Name Title' };
      expect(ParseTitle(new Map(), json, '<title>ignored</title>')).toBe('JSON-LD Name Title');
    });

    it('should return undefined when no title is found', () => {
      expect(ParseTitle(new Map(), {}, '<div>no title</div>')).toBeUndefined();
    });
  });

  describe('ParseDescription', () => {
    it('should read from metaMap', () => {
      const m = new Map<string, string>([['description', 'desc']]);
      expect(ParseDescription(m, {})).toBe('desc');
    });

    it('should read from jsonld description or return undefined', () => {
      const json = { description: 'JSON-LD description' };
      expect(ParseDescription(new Map(), json)).toBe('JSON-LD description');
      expect(ParseDescription(new Map(), {})).toBeUndefined();
    });
  });

  describe('ParseSiteName', () => {
    it('should read from metaMap', () => {
      const m = new Map<string, string>([['og:site_name', 'MySite']]);
      expect(ParseSiteName(m, {})).toBe('MySite');
    });

    it('should handle null jsonld, jsonld name or return undefined', () => {
      expect(ParseSiteName(new Map(), null as unknown as Record<string, unknown>)).toBeUndefined();
      expect(ParseSiteName(new Map(), { name: 'JSON-LD Site' })).toBe('JSON-LD Site');
      expect(ParseSiteName(new Map(), {})).toBeUndefined();
    });
  });

  describe('ParseType', () => {
    it('should read from metaMap', () => {
      const m = new Map<string, string>([['og:type', 'article']]);
      expect(ParseType(m, {})).toBe('article');
    });

    it('should read from jsonld type or return undefined', () => {
      expect(ParseType(new Map(), { type: 'article' })).toBe('article');
      expect(ParseType(new Map(), {})).toBeUndefined();
    });
  });

  describe('ParseAuthor', () => {
    it('should read from metaMap', () => {
      const m = new Map<string, string>([['author', 'Bob']]);
      expect(ParseAuthor(m, {})).toBe('Bob');
    });

    it('should read from jsonld object author', () => {
      const json = { author: { name: 'Alice' } };
      expect(ParseAuthor(new Map(), json)).toBe('Alice');
    });

    it('should parse string author, handle objects without name, or return undefined', () => {
      expect(ParseAuthor(new Map(), { author: 'John Doe' })).toBe('John Doe');
      expect(ParseAuthor(new Map(), { author: { name: 123 } })).toBeUndefined();
      expect(ParseAuthor(new Map(), {})).toBeUndefined();
    });
  });

  describe('ParsePublishedDate', () => {
    it('should parse metaMap article:published_time', () => {
      const m = new Map<string, string>([['article:published_time', '2020-01-02T03:04:05Z']]);
      const res = ParsePublishedDate(m, {}, '');
      expect(res).toBe('2020-01-02T03:04:05.000Z');
    });

    it('should parse jsonld datePublished', () => {
      const json = { datePublished: '2021-02-03T00:00:00Z' };
      const res = ParsePublishedDate(new Map(), json, '');
      expect(res).toBe('2021-02-03T00:00:00.000Z');
    });

    it('should parse <time datetime=...>', () => {
      const html = '<time datetime="2019-05-06T07:08:09Z">May</time>';
      const res = ParsePublishedDate(new Map(), {}, html);
      expect(res).toBe('2019-05-06T07:08:09.000Z');
    });

    it('should parse date from <time> tag inner text when datetime attribute is absent', () => {
      const html = '<time>2026-05-12T10:00:00Z</time>';
      const res = ParsePublishedDate(new Map(), {}, html);
      expect(res).toBe('2026-05-12T10:00:00.000Z');
    });

    it('should return undefined when no time tag or published date is present in ParsePublishedDate', () => {
      expect(ParsePublishedDate(new Map(), {}, '<div>no time tag</div>')).toBeUndefined();
    });
  });

  describe('ParseImage', () => {
    it('should read image src/alt/width/height from metaMap', () => {
      const m = new Map<string, string>([
        ['og:image', 'https://ex.com/i.jpg'],
        ['og:image:alt', 'alt text'],
        ['og:image:width', '320'],
        ['og:image:height', '180']
      ]);
      const img = ParseImage(m, {});
      expect(img.src).toBe('https://ex.com/i.jpg');
      expect(img.alt).toBe('alt text');
      expect(img.width).toBe(320);
      expect(img.height).toBe(180);
    });

    it('should read image from jsonld structures', () => {
      const json = { image: { url: 'https://ex.com/ld.jpg' } };
      const img = ParseImage(new Map(), json);
      expect(img.src).toBe('https://ex.com/ld.jpg');
    });

    it('should parse image from jsonld plain string', () => {
      const json = { image: 'https://ex.com/plain-string-image.jpg' };
      const img = ParseImage(new Map(), json);
      expect(img.src).toBe('https://ex.com/plain-string-image.jpg');
    });

    it('should parse image from jsonld array of strings', () => {
      const json = { image: ['https://ex.com/array-img.jpg'] };
      const img = ParseImage(new Map(), json);
      expect(img.src).toBe('https://ex.com/array-img.jpg');
    });

    it('should parse image from jsonld object with src property', () => {
      const json = { image: { src: 'https://ex.com/src.jpg', height: 100 } };
      const img = ParseImage(new Map(), json);
      expect(img.src).toBe('https://ex.com/src.jpg');
      expect(img.height).toBe(100);
    });

    it('should evaluate nullish coalescing for width and height when they are explicitly null in jsonld image', () => {
      const jsonObj = { image: { url: 'https://b/object.jpg', width: null, height: null } };
      const img = ParseImage(new Map(), jsonObj);
      expect(img.src).toBe('https://b/object.jpg');
      expect(img.width).toBeNull();
      expect(img.height).toBeNull();
    });

    it('should cover nullish coalescing right-hand branch for width and height on lines 139-140', () => {
      let widthCount = 0;
      let heightCount = 0;

      const dynamicImage = {
        src: 'https://ex.com/dynamic.jpg',
        get width() {
          widthCount++;
          return widthCount === 1 ? 100 : null;
        },
        get height() {
          heightCount++;
          return heightCount === 1 ? 200 : null;
        }
      };

      const img = ParseImage(new Map(), { image: dynamicImage });

      expect(img.src).toBe('https://ex.com/dynamic.jpg');
      expect(img.width).toBeNull();
      expect(img.height).toBeNull();
    });
  });

  describe('ParseCanonical', () => {
    it('should extract canonical link', () => {
      const html = '<link rel="canonical" href="https://site.example/page" />';
      expect(ParseCanonical(html)).toBe('https://site.example/page');
    });

    it('should return undefined when no canonical present', () => {
      expect(ParseCanonical('<html></html>')).toBeUndefined();
    });
  });
});
