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

    it('should return null if JSON-LD is an empty array', () => {
      const html = '<script type="application/ld+json">[]</script>';
      expect(parseJsonLd(html)).toBeNull();
    });

    it('should return null if JSON-LD array contains a non-object first element', () => {
      const html = '<script type="application/ld+json">["simple-string"]</script>';
      expect(parseJsonLd(html)).toBeNull();
    });

    it('should return null if parsed JSON-LD is not an object or array', () => {
      const html = '<script type="application/ld+json">123</script>';
      expect(parseJsonLd(html)).toBeNull();
    });

    it('should return null if no valid JSON-LD present', () => {
      const html = '<div>No jsonld</div>';
      expect(parseJsonLd(html)).toBeNull();
    });

    it('should return null if script block contains invalid JSON', () => {
      const html = '<script type="application/ld+json">{"missing-quotes: value}</script>';
      expect(parseJsonLd(html)).toBeNull();
    });
  });

  describe('parseDateFlexible', () => {
    it('should parse ISO date string', () => {
      const d = parseDateFlexible('2020-01-02T03:04:05Z');
      expect(d).toBeInstanceOf(Date);
      expect(d!.toISOString()).toBe('2020-01-02T03:04:05.000Z');
    });

    it('should parse dd.MM.yyyy HH:mm', () => {
      const d = parseDateFlexible('15.01.2020 05:06');
      expect(d).toBeInstanceOf(Date);
      expect(d!.getDate()).toBe(15);
      expect(d!.getMonth()).toBe(0);
      expect(d!.getFullYear()).toBe(2020);
      expect(d!.getHours()).toBe(5);
      expect(d!.getMinutes()).toBe(6);
    });

    it('should parse dd.MM.yyyy and fallback hours and minutes to 0', () => {
      const d = parseDateFlexible('15.01.2020');
      expect(d).toBeInstanceOf(Date);
      expect(d!.getDate()).toBe(15);
      expect(d!.getMonth()).toBe(0);
      expect(d!.getFullYear()).toBe(2020);
      expect(d!.getHours()).toBe(0);
      expect(d!.getMinutes()).toBe(0);
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
