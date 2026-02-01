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
  });

  describe('ParseDescription, ParseSiteName, ParseType', () => {
    it('should read from metaMap or jsonld', () => {
      const m = new Map<string, string>([
        ['description', 'desc'],
        ['og:site_name', 'MySite'],
        ['og:type', 'article']
      ]);
      expect(ParseDescription(m, {})).toBe('desc');
      expect(ParseSiteName(m, {})).toBe('MySite');
      expect(ParseType(m, {})).toBe('article');
    });
  });

  describe('ParseAuthor', () => {
    it('should read from metaMap', () => {
      const m = new Map<string, string>([['author', 'Bob']]);
      expect(ParseAuthor(m, {})).toBe('Bob');
    });

    it('should read from jsonld object author', () => {
      const json = { author: { name: 'Alice' } };
      expect(ParseAuthor(new Map(), json as any)).toBe('Alice');
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
      const res = ParsePublishedDate(new Map(), json as any, '');
      expect(res).toBe('2021-02-03T00:00:00.000Z');
    });

    it('should parse <time datetime=...>', () => {
      const html = '<time datetime="2019-05-06T07:08:09Z">May</time>';
      const res = ParsePublishedDate(new Map(), {}, html);
      expect(res).toBe('2019-05-06T07:08:09.000Z');
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
      const img = ParseImage(m, {} as any);
      expect(img.src).toBe('https://ex.com/i.jpg');
      expect(img.alt).toBe('alt text');
      expect(img.width).toBe(320);
      expect(img.height).toBe(180);
    });

    it('should read image from jsonld structures', () => {
      const json = { image: { url: 'https://ex.com/ld.jpg' } };
      const img = ParseImage(new Map(), json as any);
      expect(img.src).toBe('https://ex.com/ld.jpg');
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

  describe('additional ParseTitle & ParseImage jsonld shapes', () => {
    it('should use jsonld headline when metaMap empty', () => {
      const json = { headline: 'JSON-LD Title' };
      expect(ParseTitle(new Map(), json as any, '<title>ignored</title>')).toBe('JSON-LD Title');
    });

    it('should parse image from jsonld array and set width/height when present', () => {
      const json = { image: ['https://a/one.jpg'] };
      const img = ParseImage(new Map(), json);
      expect(img.src).toBe('https://a/one.jpg');

      const jsonObj = { image: { url: 'https://b/object.jpg', width: 10, height: 20 } };
      const img2 = ParseImage(new Map(), jsonObj);
      expect(img2.src).toBe('https://b/object.jpg');
      expect(img2.width).toBe(10);
      expect(img2.height).toBe(20);
    });
  });
});
