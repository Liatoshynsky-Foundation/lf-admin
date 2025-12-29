import { parseDateFlexible, parseJsonLd, parseMaybeInt, pickFirst, unescapeEntities } from './parserUtils';

describe('parserUtils', () => {
  describe('pickFirst', () => {
    it('should return first non-empty trimmed value', () => {
      const m = new Map<string, string>([
        ['a', '   '],
        ['b', 'first'],
        ['c', 'second']
      ]);
      expect(pickFirst(m, ['a', 'b', 'c'])).toBe('first');
    });

    it('should return null when nothing found', () => {
      const m = new Map<string, string>([['x', '   ']]);
      expect(pickFirst(m, ['x', 'y'])).toBeNull();
    });
  });

  describe('parseMaybeInt', () => {
    it('should parse integer strings', () => {
      expect(parseMaybeInt('42')).toBe(42);
    });

    it('should return null for non-numeric and empty', () => {
      expect(parseMaybeInt('abc')).toBeNull();
      expect(parseMaybeInt(null)).toBeNull();
      expect(parseMaybeInt('')).toBeNull();
    });
  });

  describe('unescapeEntities', () => {
    it('should decode common named and numeric entities and \\u escapes', () => {
      const s = 'Fish &amp; Chips &#x26; \\u0041';
      const out = unescapeEntities(s);
      expect(out).toContain('Fish & Chips');
      expect(out).toContain('A');
    });

    it('should normalize double-escaped JSON forms', () => {
      const s = '\\u0026amp;';
      expect(unescapeEntities(s)).toContain('&');
    });
  });

  describe('parseJsonLd', () => {
    it('should parse a standard ld+json script block', () => {
      const html = '<script type="application/ld+json">{"@type":"Thing","name":"X"}</script>';
      const v = parseJsonLd(html);
      expect(v).toBeTruthy();
      expect((v as any).name).toBe('X');
    });

    it('should repair and parse when extra junk surrounds object', () => {
      const raw = 'junk {"name":"Y"} trailing';
      const html = `<script type="application/ld+json">${raw}</script>`;
      const v = parseJsonLd(html);
      expect(v).toBeTruthy();
      expect((v as any).name).toBe('Y');
    });

    it('should return null if no valid JSON-LD present', () => {
      const html = '<div>No jsonld</div>';
      expect(parseJsonLd(html)).toBeNull();
    });
  });

  describe('parseDateFlexible', () => {
    it('should parse ISO date string', () => {
      const d = parseDateFlexible('2020-01-02T03:04:05Z');
      expect(d).toBeInstanceOf(Date);
      expect(d!.toISOString()).toBe('2020-01-02T03:04:05.000Z');
    });

    it('should parse dd.MM.yyyy and dd.MM.yyyy HH:mm', () => {
      const d = parseDateFlexible('02.01.2020 05:06');
      expect(d).toBeInstanceOf(Date);
      expect(Number.isNaN(d!.getTime())).toBe(false);
    });

    it('should return null for invalid input', () => {
      expect(parseDateFlexible('not a date')).toBeNull();
    });
  });

  describe('extractFirstJSONBlock & parseJsonLd repairs', () => {
    it('should repair and parse JSON-LD with trailing commas and single quotes', () => {
      const html = '<script type="application/ld+json">{ \'name\': \'Z\', \'a\': 1, }</script>';
      const v = parseJsonLd(html);
      expect(v).toBeTruthy();
      expect((v as { name: string }).name).toBe('Z');
    });

    it('should extract first JSON block from surrounding junk', () => {
      const raw = 'prefix {"ok":true} suffix {"other":false}';
      const html = `<script type="application/ld+json">${raw}</script>`;
      const v = parseJsonLd(html);
      expect(v).toBeTruthy();
      expect((v as { ok: boolean }).ok).toBe(true);
    });
  });
});
