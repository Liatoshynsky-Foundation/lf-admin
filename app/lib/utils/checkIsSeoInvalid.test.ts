import { checkIsSeoInvalid } from './checkIsSeoInvalid';
import { PublicationsItemType } from '~/constants/publications';

describe('checkIsSeoInvalid', () => {
  const validUkMeta = {
    title: 'UK Title',
    description: 'UK Description',
    canonicalUrl: 'https://site.ua',
    keywords: ''
  };

  const validEnMeta = {
    title: 'EN Title',
    description: 'EN Description',
    canonicalUrl: 'https://site.com',
    keywords: ''
  };
  const validTicketUrl = { uk: 'https://ticket.ua', en: 'https://ticket.com' };

  describe('it fails (return true)', () => {
    it.each([['uk'], ['en']] as const)('if title for %s is missing', (locale) => {
      const result = checkIsSeoInvalid(
        locale === 'uk' ? { ...validUkMeta, title: '' } : validUkMeta,
        locale === 'en' ? { ...validEnMeta, title: '' } : validEnMeta,
        'media',
        validTicketUrl
      );
      expect(result).toBe(true);
    });

    it.each([['uk'], ['en']] as const)('if description for %s is missing', (locale) => {
      const result = checkIsSeoInvalid(
        locale === 'uk' ? { ...validUkMeta, description: '' } : validUkMeta,
        locale === 'en' ? { ...validEnMeta, description: '' } : validEnMeta,
        'media',
        validTicketUrl
      );
      expect(result).toBe(true);
    });

    it('if type is "media" and uk canonicalUrl is invalid', () => {
      const result = checkIsSeoInvalid(
        { ...validUkMeta, canonicalUrl: 'not-a-url' },
        validEnMeta,
        'media',
        validTicketUrl
      );
      expect(result).toBe(true);
    });

    it('if type is "media" and en canonicalUrl is invalid', () => {
      const result = checkIsSeoInvalid(
        validUkMeta,
        { ...validEnMeta, canonicalUrl: 'not-a-url' },
        'media',
        validTicketUrl
      );
      expect(result).toBe(true);
    });

    it('if type is "events" and ticketUrl is missing', () => {
      const result = checkIsSeoInvalid(validUkMeta, validEnMeta, 'events', undefined);
      expect(result).toBe(true);
    });

    it.each(['uk', 'en'] as const)('if preview image is uploaded and %s alt text is missing', (emptyLocale) => {
      const altText = { uk: 'Alt UK', en: 'Alt EN' };
      const result = checkIsSeoInvalid(
        { ...validUkMeta, altText: { ...altText, [emptyLocale]: '' } },
        { ...validEnMeta, altText: { ...altText, [emptyLocale]: '' } },
        'events',
        validTicketUrl,
        'https://example.com/image.jpg'
      );
      expect(result).toBe(true);
    });
  });

  describe('it successes (return false)', () => {
    it.each([
      ['generic type (news)', 'news'],
      ['type "media"', 'media'],
      ['type "events"', 'events']
    ])('if %s and both uk & en urls are correct & valid', (_, type) => {
      const result = checkIsSeoInvalid(validUkMeta, validEnMeta, type as PublicationsItemType, validTicketUrl);
      expect(result).toBe(false);
    });

    it('if preview image is uploaded and both locale alt texts are provided', () => {
      const result = checkIsSeoInvalid(
        { ...validUkMeta, altText: { uk: 'Alt UK', en: 'Alt EN' } },
        { ...validEnMeta, altText: { uk: 'Alt UK', en: 'Alt EN' } },
        'events',
        validTicketUrl,
        'https://example.com/image.jpg'
      );
      expect(result).toBe(false);
    });

    it('if preview image is missing, alt text is not required', () => {
      const result = checkIsSeoInvalid(
        { ...validUkMeta, altText: { uk: '', en: '' } },
        { ...validEnMeta, altText: { uk: '', en: '' } },
        'events',
        validTicketUrl,
        null
      );
      expect(result).toBe(false);
    });
  });

  describe('edge cases', () => {
    describe('canonicalUrl edge cases', () => {
      it.each([
        ['media', 'uk', undefined],
        ['media', 'uk', ''],
        ['media', 'uk', '   '],
        ['media', 'uk', 'not-a-url'],
        ['media', 'en', undefined],
        ['media', 'en', ''],
        ['media', 'en', '   '],
        ['media', 'en', 'not-a-url'],
        ['news', 'uk', undefined],
        ['news', 'uk', ''],
        ['news', 'uk', '   '],
        ['news', 'uk', 'not-a-url'],
        ['news', 'en', undefined],
        ['news', 'en', ''],
        ['news', 'en', '   '],
        ['news', 'en', 'not-a-url'],
        ['events', 'uk', undefined],
        ['events', 'uk', ''],
        ['events', 'uk', '   '],
        ['events', 'uk', 'not-a-url'],
        ['events', 'en', undefined],
        ['events', 'en', ''],
        ['events', 'en', '   '],
        ['events', 'en', 'not-a-url']
      ] as const)(
        'should return expected validity status for type "%s" when %s canonicalUrl is %p',
        (type, locale, value) => {
          const result = checkIsSeoInvalid(
            locale === 'uk' ? { ...validUkMeta, canonicalUrl: value } : validUkMeta,
            locale === 'en' ? { ...validEnMeta, canonicalUrl: value } : validEnMeta,
            type as PublicationsItemType,
            validTicketUrl
          );
          expect(result).toBe(type === 'media');
        }
      );
    });
  });
});
