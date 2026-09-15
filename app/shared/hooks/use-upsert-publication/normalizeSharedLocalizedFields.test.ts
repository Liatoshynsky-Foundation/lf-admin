import {
  resolveSharedLocalizedFields,
  syncLocalizedCrop,
  syncLocalizedStringPair
} from './normalizeSharedLocalizedFields';
import type { FetchedPublicationData } from '~/constants/publications';

describe('syncLocalizedStringPair', () => {
  it('prefers uk when present', () => {
    expect(syncLocalizedStringPair({ uk: 'uk-val', en: 'en-val' })).toEqual({
      uk: 'uk-val',
      en: 'uk-val'
    });
  });

  it('falls back to en when uk is empty', () => {
    expect(syncLocalizedStringPair({ uk: '', en: 'en-val' })).toEqual({
      uk: 'en-val',
      en: 'en-val'
    });
  });

  it('returns empty pair when both missing', () => {
    expect(syncLocalizedStringPair(undefined)).toEqual({ uk: '', en: '' });
  });
});

describe('syncLocalizedCrop', () => {
  const ukRect = { x: 1, y: 2, width: 3, height: 4 };
  const enRect = { x: 5, y: 6, width: 7, height: 8 };

  it('returns null for null crop', () => {
    expect(syncLocalizedCrop(null)).toBeNull();
  });

  it('mirrors flat CropRect to both locales', () => {
    expect(syncLocalizedCrop(ukRect)).toEqual({ uk: ukRect, en: ukRect });
  });

  it('prefers uk crop when both localized present', () => {
    expect(syncLocalizedCrop({ uk: ukRect, en: enRect })).toEqual({ uk: ukRect, en: ukRect });
  });

  it('falls back to en when uk is null', () => {
    expect(syncLocalizedCrop({ uk: null, en: enRect })).toEqual({ uk: enRect, en: enRect });
  });
});

describe('resolveSharedLocalizedFields', () => {
  const fetched = {
    coverImage: {
      src: 'img.png',
      alt: { uk: 'Alt UK', en: 'Alt EN' },
      crop: { x: 1, y: 2, width: 3, height: 4 }
    },
    ticketUrl: { uk: 'https://uk.example', en: 'https://en.example' }
  } as FetchedPublicationData;

  it('syncs shared fields for events', () => {
    expect(resolveSharedLocalizedFields('events', fetched)).toEqual({
      altText: { uk: 'Alt UK', en: 'Alt UK' },
      ticketUrl: { uk: 'https://uk.example', en: 'https://uk.example' },
      crop: {
        uk: { x: 1, y: 2, width: 3, height: 4 },
        en: { x: 1, y: 2, width: 3, height: 4 }
      }
    });
  });

  it('keeps per-locale alt for news', () => {
    expect(resolveSharedLocalizedFields('news', fetched).altText).toEqual({
      uk: 'Alt UK',
      en: 'Alt EN'
    });
  });
});
