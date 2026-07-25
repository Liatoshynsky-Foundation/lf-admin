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
      const s = 'Fish &amp Chips &#x26; \\u0041 &#65;';
      const out = unescapeEntities(s);
      expect(out).toContain('Fish & Chips');
      expect(out).toContain('A');
    });

    it('should normalize double-escaped JSON forms', () => {
      const s = '\\u0026amp;';
      expect(unescapeEntities(s)).toContain('&');
    });

    it('should bypass unknown named HTML entities', () => {
      const s = 'Value with &invalid; entity';
      expect(unescapeEntities(s)).toBe('Value with &invalid; entity');
    });
  });

  describe('parseJsonLd', () => {
    it('should parse a standard ld+json script block', () => {
      const html = '<script type="application/ld+json">{"@type":"Thing","name":"X"}</script>';
      const v = parseJsonLd(html);
      expect(v).toBeTruthy();
      expect((v as Record<string, unknown>).name).toBe('X');
    });

    it('should successfully parse a valid JSON-LD array and return its first object element', () => {
      const html = '<script type="application/ld+json">[{"@type":"Thing","name":"ArrayItem"}]</script>';
      const v = parseJsonLd(html);
      expect(v).toBeTruthy();
      expect((v as Record<string, unknown>).name).toBe('ArrayItem');
    });

    it.each([
      { html: '<script type="application/ld+json">[]</script>', description: 'JSON-LD is an empty array' },
      { html: '<script type="application/ld+json">["simple-string"]</script>', description: 'JSON-LD array contains a non-object first element' },
      { html: '<script type="application/ld+json">123</script>', description: 'parsed JSON-LD is not an object or array' },
      { html: '<div>No jsonld</div>', description: 'no valid JSON-LD present' },
      { html: '<script type="application/ld+json">{"missing-quotes: value}</script>', description: 'script block contains invalid JSON' }
    ])('should return null if $description', ({ html }) => {
      expect(parseJsonLd(html)).toBeNull();
    });
  });

  describe('parseDateFlexible', () => {
    it.each([
      { input: '2020-01-02T03:04:05Z', expectedIso: '2020-01-02T03:04:05.000Z', description: 'ISO date string' },
      { input: '15.01.2020 05:06', expectedIso: '2020-01-15T05:06:00.000Z', description: 'dd.MM.yyyy HH:mm as UTC' },
      { input: '15.01.2020', expectedIso: '2020-01-15T00:00:00.000Z', description: 'dd.MM.yyyy and fallback hours and minutes to 0 as UTC' }
    ])('should parse $description', ({ input, expectedIso }) => {
      const d = parseDateFlexible(input);
      expect(d).toBeInstanceOf(Date);
      expect(d!.toISOString()).toBe(expectedIso);
    });

    it('should return null for invalid input', () => {
      expect(parseDateFlexible('not a date')).toBeNull();
    });

    it('should return null for falsy, empty, or whitespace-only strings', () => {
      expect(parseDateFlexible(null)).toBeNull();
      expect(parseDateFlexible('')).toBeNull();
      expect(parseDateFlexible('   ')).toBeNull();
    });
  });
});