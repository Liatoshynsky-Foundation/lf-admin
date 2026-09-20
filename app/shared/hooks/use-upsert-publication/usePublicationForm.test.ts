import { act, renderHook } from '@testing-library/react';
import dayjs from 'dayjs';

import {
  getDateIsoString,
  isValidDate,
  parseDate,
  PublicationFormState,
  usePublicationForm,
  validatePublicationSeo
} from './usePublicationForm';
import { ImageCropData, initialSeoValue } from '~/constants/publications';
import type { SeoBlockValue } from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';

const createMockSeoValue = (overrides?: Partial<SeoBlockValue>): SeoBlockValue => ({
  ...initialSeoValue,
  meta: {
    uk: { title: 'Заголовок укр', description: 'Опис укр', keywords: 'новини' },
    en: { title: 'Title en', description: 'Description en', keywords: 'news' }
  },
  ogImage: 'https://liatoshynsky.org/cover.jpg',
  allowIndexing: { uk: true, en: true },
  ...overrides
});

const createMockFormState = (overrides?: Partial<PublicationFormState>): PublicationFormState => ({
  adminTitle: 'Тестовий заголовок',
  publishDate: '2025-01-01T00:00:00.000Z',
  seoValue: createMockSeoValue(),
  crop: null,
  ...overrides
});

describe('usePublicationForm', () => {
  describe('isValidDate', () => {
    it.each([
      [dayjs('2025-01-01'), true],
      [dayjs('invalid-date'), false],
      [null, false],
      [undefined, false]
    ])('should return %p for %p', (input, expected) => {
      expect(isValidDate(input)).toBe(expected);
    });
  });

  describe('parseDate', () => {
    it.each([
      [null, null],
      [undefined, null],
      ['', null],
      ['   ', null],
      ['invalid-date-string', null],
    ])('should return null for invalid input %p', (input, expected) => {
      expect(parseDate(input)).toBe(expected);
    });

    it('should return same Dayjs instance for valid Dayjs input', () => {
      const targetDate = dayjs('2025-01-01');
      expect(parseDate(targetDate)).toBe(targetDate);
    });

    it('should return Dayjs instance for valid ISO or timestamp string', () => {
      const isoResult = parseDate('2025-01-01T12:00:00.000Z');
      expect(isoResult?.toISOString()).toBe('2025-01-01T12:00:00.000Z');

      const timestampResult = parseDate('1735689600000');
      expect(timestampResult?.isValid()).toBe(true);
    });
  });

  describe('getDateIsoString', () => {
    it.each([
      [dayjs('2025-01-01T00:00:00.000Z'), '2025-01-01T00:00:00.000Z'],
      [dayjs('invalid'), undefined],
      [null, undefined],
      [undefined, undefined]
    ])('should return %p for %p', (input, expected) => {
      expect(getDateIsoString(input)).toBe(expected);
    });
  });

  describe('validatePublicationSeo', () => {
    it('should return no errors for valid news SEO data', () => {
      const result = validatePublicationSeo(createMockSeoValue(), 'news');
      expect(result.hasMetaErrors).toBe(false);
      expect(result.hasUrlErrors).toBe(false);
    });

    it('should return meta errors when required UK title is missing', () => {
      const seoValue = createMockSeoValue({
        meta: {
          uk: { title: '', description: 'Опис', keywords: '' },
          en: { title: 'Title', description: 'Desc', keywords: '' }
        }
      });
      const result = validatePublicationSeo(seoValue, 'news');
      expect(result.hasMetaErrors).toBe(true);
      expect(result.seoErrors.meta.uk.title).not.toBe('');
    });

    it.each([
      [{ ticketUrl: { uk: 'https://tickets.com', en: 'https://tickets.com/en' } }, 'events', false],
      [{ ticketUrl: { uk: 'invalid-url', en: 'https://tickets.com' } }, 'events', true],
      [{ meta: { uk: { title: 'T', description: 'D', keywords: '', canonicalUrl: 'invalid' }, en: { title: 'T', description: 'D', keywords: '', canonicalUrl: 'https://url.com' } } }, 'media', true]
    ])('should validate url fields for %s', (overrides, type, expectedHasUrlErrors) => {
      const seoValue = createMockSeoValue(overrides as Partial<SeoBlockValue>);
      const result = validatePublicationSeo(seoValue, type as 'events' | 'media');
      expect(result.hasUrlErrors).toBe(expectedHasUrlErrors);
    });
  });

  describe('usePublicationForm hook', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => usePublicationForm());
      expect(result.current.adminTitle).toBe('');
      expect(result.current.publishDate).toBeNull();
      expect(result.current.seoValue).toEqual(initialSeoValue);
      expect(result.current.hasUnsavedChanges).toBe(false);
    });

    it('should update state and latestDataRef for field setters', () => {
      const { result } = renderHook(() => usePublicationForm());
      const testDate = dayjs('2025-05-10');
      const cropData: ImageCropData = {
        uk: { x: 0, y: 0, width: 100, height: 100 },
        en: { x: 0, y: 0, width: 100, height: 100 }
      };

      act(() => {
        result.current.setAdminTitle('Нова назва');
        result.current.setAdminTitleError('Помилка');
        result.current.setCanonicalUrlError('URL помилка');
        result.current.setForceShowErrors(true);
        result.current.setPublishDate(testDate);
        result.current.setCrop(cropData);
      });

      expect(result.current.adminTitle).toBe('Нова назва');
      expect(result.current.adminTitleError).toBe('Помилка');
      expect(result.current.canonicalUrlError).toBe('URL помилка');
      expect(result.current.forceShowErrors).toBe(true);
      expect(result.current.publishDate).toEqual(testDate);
      expect(result.current.crop).toEqual(cropData);
      expect(result.current.latestDataRef.current.adminTitle).toBe('Нова назва');
      expect(result.current.latestDataRef.current.publishDate).toEqual(testDate);
      expect(result.current.latestDataRef.current.crop).toEqual(cropData);
    });

    it('should update seoValue, reset seoErrors, and support functional state updater', () => {
      const { result } = renderHook(() => usePublicationForm());
      const newSeo = createMockSeoValue();

      act(() => {
        result.current.setSeoErrors({ meta: { uk: {}, en: {} } });
      });
      expect(result.current.seoErrors).toBeDefined();

      act(() => {
        result.current.setSeoValue(newSeo);
      });
      expect(result.current.seoValue).toEqual(newSeo);
      expect(result.current.seoErrors).toBeUndefined();

      act(() => {
        result.current.setSeoValue((prev) => ({ ...prev, ogImage: 'https://updated.png' }));
      });
      expect(result.current.seoValue.ogImage).toBe('https://updated.png');
    });

    it('should update startDateTime and endDateTime via handleDateTimeChange', () => {
      const { result } = renderHook(() => usePublicationForm());

      act(() => {
        result.current.handleDateTimeChange('2025-06-01T10:00:00Z', '2025-06-01T18:00:00Z');
      });

      expect(result.current.seoValue.meta.uk.startDateTime).toBe('2025-06-01T10:00:00Z');
      expect(result.current.seoValue.meta.en.endDateTime).toBe('2025-06-01T18:00:00Z');
    });

    it('should correctly evaluate hasUnsavedChanges', () => {
      const { result } = renderHook(() => usePublicationForm());
      const initialFormState = createMockFormState({
        adminTitle: '',
        publishDate: null,
        seoValue: initialSeoValue,
        crop: null
      });

      expect(result.current.hasUnsavedChanges).toBe(false);

      act(() => {
        result.current.setInitialState(initialFormState);
      });
      expect(result.current.hasUnsavedChanges).toBe(false);

      act(() => {
        result.current.setAdminTitle('Змінена назва');
      });
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it('should build common input using latest form data', () => {
      const { result } = renderHook(() => usePublicationForm());
      const testDate = dayjs('2025-03-15T10:00:00.000Z');
      const altText = { uk: 'Alt UK', en: 'Alt EN' };
      const seoValue = createMockSeoValue({
        ogImage: 'https://liatoshynsky.org/og.png',
        meta: {
          uk: { title: 'Заголовок укр', description: 'Опис укр', keywords: 'новини', altText },
          en: { title: 'Title en', description: 'Description en', keywords: 'news', altText }
        }
      });

      act(() => {
        result.current.setAdminTitle('Новина дня');
        result.current.setPublishDate(testDate);
        result.current.setSeoValue(seoValue);
      });

      const payload = result.current.buildCommonInput();

      expect(payload).toEqual({
        adminTitle: 'Новина дня',
        title: { uk: 'Заголовок укр', en: 'Title en' },
        description: { uk: 'Опис укр', en: 'Description en' },
        keywords: { uk: 'новини', en: 'news' },
        allowIndexation: { uk: true, en: true },
        publishedAt: '2025-03-15T10:00:00.000Z',
        coverImage: {
          src: 'https://liatoshynsky.org/og.png',
          alt: altText,
          caption: { uk: 'Новина дня', en: 'Новина дня' }
        }
      });
    });

    it('should fall back to adminTitle in buildCommonInput when meta values are empty', () => {
      const { result } = renderHook(() => usePublicationForm());

      act(() => {
        result.current.setAdminTitle('Фолбек Заголовок');
      });

      const payload = result.current.buildCommonInput();

      expect(payload.title).toEqual({ uk: 'Фолбек Заголовок', en: 'Фолбек Заголовок' });
      expect(payload.coverImage.src).toBe('Фолбек Заголовок');
      expect(payload.coverImage.alt).toEqual({ uk: 'Фолбек Заголовок', en: 'Фолбек Заголовок' });
    });
  });
});
