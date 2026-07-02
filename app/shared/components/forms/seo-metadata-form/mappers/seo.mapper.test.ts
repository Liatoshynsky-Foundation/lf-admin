import { mapSeoBase, SeoData } from './seo.mapper';

const buildSeoData = (overrides?: Partial<SeoData>): SeoData => ({
  meta: {
    uk: {
      title: 'Заголовок UK',
      description: 'Опис UK',
      keywords: 'ключ1, ключ2',
      canonicalUrl: 'https://example.com/uk',
      altText: { uk: 'альт UK', en: 'alt EN' }
    },
    en: {
      title: 'Title EN',
      description: 'Description EN',
      keywords: 'key1, key2',
      canonicalUrl: 'https://example.com/en',
      altText: { uk: 'альт UK 2', en: 'alt EN 2' }
    }
  },
  allowIndexing: {
    uk: true,
    en: false
  },
  ogImage: 'https://example.com/cover.jpg',
  ...overrides
});

describe('mapSeoBase', () => {
  it('maps a fully populated SeoData object correctly', () => {
    const data = buildSeoData();

    const result = mapSeoBase(data);

    expect(result).toEqual({
      description: {
        uk: 'Опис UK',
        en: 'Description EN',
        meta: {
          description: { uk: 'Опис UK', en: 'Description EN' },
          canonicalUrl: { uk: 'https://example.com/uk', en: 'https://example.com/en' },
          metaTitle: { uk: 'Заголовок UK', en: 'Title EN' }
        }
      },
      keywords: { uk: 'ключ1, ключ2', en: 'key1, key2' },
      allowIndexation: { uk: true, en: false },
      coverImage: {
        src: 'https://example.com/cover.jpg',
        alt: { uk: 'альт UK', en: 'alt EN 2' }
      }
    });
  });

  it('falls back canonicalUrl to null when missing for both locales', () => {
    const data = buildSeoData({
      meta: {
        uk: { title: 'T', description: 'D', keywords: 'K', canonicalUrl: undefined },
        en: { title: 'T', description: 'D', keywords: 'K', canonicalUrl: undefined }
      }
    });

    const result = mapSeoBase(data);

    expect(result.description.meta.canonicalUrl).toEqual({ uk: null, en: null });
  });

  it('falls back altText to empty strings when altText is missing', () => {
    const data = buildSeoData({
      meta: {
        uk: { title: 'T', description: 'D', keywords: 'K' },
        en: { title: 'T', description: 'D', keywords: 'K' }
      }
    });

    const result = mapSeoBase(data);

    expect(result.coverImage.alt).toEqual({ uk: '', en: '' });
  });

  it('falls back altText to empty string per locale when only one language is provided', () => {
    const data = buildSeoData({
      meta: {
        uk: { title: 'T', description: 'D', keywords: 'K', altText: { uk: 'тільки укр', en: '' } },
        en: { title: 'T', description: 'D', keywords: 'K' }
      }
    });

    const result = mapSeoBase(data);

    expect(result.coverImage.alt).toEqual({ uk: 'тільки укр', en: '' });
  });

  it('preserves ogImage as null when explicitly null', () => {
    const data = buildSeoData({ ogImage: null });

    const result = mapSeoBase(data);

    expect(result.coverImage.src).toBeNull();
  });

  it('correctly maps allowIndexing flags independently per locale', () => {
    const data = buildSeoData({ allowIndexing: { uk: false, en: true } });

    const result = mapSeoBase(data);

    expect(result.allowIndexation).toEqual({ uk: false, en: true });
  });

  it('does not mutate the input object', () => {
    const data = buildSeoData();
    const clone = JSON.parse(JSON.stringify(data));

    mapSeoBase(data);

    expect(data).toEqual(clone);
  });
});
