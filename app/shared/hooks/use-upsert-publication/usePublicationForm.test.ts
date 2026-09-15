import { act,renderHook } from '@testing-library/react';
import dayjs from 'dayjs';

import {
  getDateIsoString,
  isValidDate,
  parseDate,
  PublicationFormState,
  usePublicationForm,
  validatePublicationSeo} from './usePublicationForm';
import type { ImageCropData } from '~/constants/publications';
import { initialSeoValue } from '~/constants/publications';
import type { SeoBlockValue } from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';

const MOCK_URLS = {
  coverImage: 'https://liatoshynsky.org/cover.jpg',
  ogImage: 'https://liatoshynsky.org/og.png',
  updatedImage: 'https://liatoshynsky.org/updated.jpg',
  canonicalUrl: 'https://liatoshynsky.org',
  invalidUrl: 'invalid-url',
  ticketUrl: {
    uk: 'https://liatoshynsky.org/tickets',
    en: 'https://liatoshynsky.org/en/tickets'
  }
} as const;

const MOCK_DATES = {
  dateString: '2025-01-01',
  iso: '2025-01-01T00:00:00.000Z',
  isoWithTime: '2025-01-01T12:00:00.000Z',
  buildInputIso: '2025-03-15T10:00:00.000Z',
  startDateTime: '2025-06-01T10:00:00Z',
  endDateTime: '2025-06-01T18:00:00Z',
  timestampString: '1735689600000',
  invalidDateString: 'invalid-date-string'
} as const;

const MOCK_TITLES = {
  admin: 'Тестовий заголовок',
  initialAdmin: 'Початкова назва',
  newAdmin: 'Нова назва',
  updatedAdmin: 'Змінена назва',
  newsDay: 'Новина дня',
  fallback: 'Фолбек Заголовок'
} as const;

const MOCK_LOCALIZED_META = {
  uk: { title: 'Заголовок укр', description: 'Опис укр', keywords: 'новини' },
  en: { title: 'Title en', description: 'Description en', keywords: 'news' }
} as const;

const MOCK_ALT_TEXT = {
  uk: 'Alt UK',
  en: 'Alt EN'
} as const;

const createMockSeoValue = (overrides?: Partial<SeoBlockValue>): SeoBlockValue => ({
  ...initialSeoValue,
  meta: MOCK_LOCALIZED_META,
  ogImage: MOCK_URLS.coverImage,
  allowIndexing: { uk: true, en: true },
  ...overrides
});

const createMockFormState = (overrides?: Partial<PublicationFormState>): PublicationFormState => ({
  adminTitle: MOCK_TITLES.admin,
  publishDate: MOCK_DATES.iso,
  seoValue: createMockSeoValue(),
  crop: null,
  ...overrides
});

describe('usePublicationForm', () => {
  describe('isValidDate', () => {
    it('should return true for valid Dayjs date', () => {
      const validDate = dayjs(MOCK_DATES.dateString);

      const result = isValidDate(validDate);

      expect(result).toBe(true);
    });

    it('should return false for invalid Dayjs date', () => {
      const invalidDate = dayjs(MOCK_DATES.invalidDateString);

      const result = isValidDate(invalidDate);

      expect(result).toBe(false);
    });

    it('should return false for null', () => {
      const result = isValidDate(null);

      expect(result).toBe(false);
    });

    it('should return false for undefined', () => {
      const result = isValidDate(undefined);

      expect(result).toBe(false);
    });
  });

  describe('parseDate', () => {
    it('should return null for null or undefined', () => {
      expect(parseDate(null)).toBeNull();
      expect(parseDate(undefined)).toBeNull();
    });

    it('should return null for empty string or whitespace', () => {
      expect(parseDate('')).toBeNull();
      expect(parseDate('   ')).toBeNull();
    });

    it('should return same Dayjs instance for valid Dayjs input', () => {
      const targetDate = dayjs(MOCK_DATES.dateString);

      const result = parseDate(targetDate);

      expect(result).toBe(targetDate);
    });

    it('should return null for invalid Dayjs input', () => {
      const invalidDate = dayjs(MOCK_DATES.invalidDateString);

      const result = parseDate(invalidDate);

      expect(result).toBeNull();
    });

    it('should return Dayjs instance for valid ISO date string', () => {
      const result = parseDate(MOCK_DATES.isoWithTime);

      expect(result?.isValid()).toBe(true);
      expect(result?.toISOString()).toBe(MOCK_DATES.isoWithTime);
    });

    it('should return Dayjs instance for valid numeric timestamp string', () => {
      const result = parseDate(MOCK_DATES.timestampString);

      expect(result?.isValid()).toBe(true);
    });

    it('should return null for invalid date string', () => {
      const result = parseDate(MOCK_DATES.invalidDateString);

      expect(result).toBeNull();
    });
  });

  describe('getDateIsoString', () => {
    it('should return ISO string for valid Dayjs date', () => {
      const targetDate = dayjs(MOCK_DATES.iso);

      const result = getDateIsoString(targetDate);

      expect(result).toBe(MOCK_DATES.iso);
    });

    it('should return undefined for invalid Dayjs date', () => {
      const invalidDate = dayjs(MOCK_DATES.invalidDateString);

      const result = getDateIsoString(invalidDate);

      expect(result).toBeUndefined();
    });

    it('should return undefined for null or undefined', () => {
      expect(getDateIsoString(null)).toBeUndefined();
      expect(getDateIsoString(undefined)).toBeUndefined();
    });
  });

  describe('validatePublicationSeo', () => {
    it('should return no errors for valid news SEO data', () => {
      const seoValue = createMockSeoValue();

      const result = validatePublicationSeo(seoValue, 'news');

      expect(result.hasMetaErrors).toBe(false);
      expect(result.hasUrlErrors).toBe(false);
    });

    it('should return meta errors when required UK title is missing', () => {
      const seoValue = createMockSeoValue({
        meta: {
          uk: { title: '', description: MOCK_LOCALIZED_META.uk.description, keywords: '' },
          en: { title: MOCK_LOCALIZED_META.en.title, description: MOCK_LOCALIZED_META.en.description, keywords: '' }
        }
      });

      const result = validatePublicationSeo(seoValue, 'news');

      expect(result.hasMetaErrors).toBe(true);
      expect(result.seoErrors.meta.uk.title).not.toBe('');
    });

    it('should validate ticketUrl when publication type is events', () => {
      const seoValue = createMockSeoValue({
        ticketUrl: MOCK_URLS.ticketUrl
      });

      const result = validatePublicationSeo(seoValue, 'events');

      expect(result.hasUrlErrors).toBe(false);
      expect(result.seoErrors.ticketUrl).toBeUndefined();
    });

    it('should report url errors when ticketUrl is invalid for events', () => {
      const seoValue = createMockSeoValue({
        ticketUrl: { uk: MOCK_URLS.invalidUrl, en: MOCK_URLS.ticketUrl.uk }
      });

      const result = validatePublicationSeo(seoValue, 'events');

      expect(result.hasUrlErrors).toBe(true);
      expect(result.seoErrors.ticketUrl?.uk).not.toBe('');
    });

    it('should report url errors when canonicalUrl is missing or invalid for media', () => {
      const seoValue = createMockSeoValue({
        meta: {
          uk: { ...MOCK_LOCALIZED_META.uk, canonicalUrl: MOCK_URLS.invalidUrl },
          en: { ...MOCK_LOCALIZED_META.en, canonicalUrl: MOCK_URLS.canonicalUrl }
        }
      });

      const result = validatePublicationSeo(seoValue, 'media');

      expect(result.hasUrlErrors).toBe(true);
    });
  });

  describe('usePublicationForm hook', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => usePublicationForm());

      expect(result.current.adminTitle).toBe('');
      expect(result.current.adminTitleError).toBe('');
      expect(result.current.canonicalUrlError).toBe('');
      expect(result.current.publishDate).toBeNull();
      expect(result.current.seoValue).toEqual(initialSeoValue);
      expect(result.current.crop).toBeNull();
      expect(result.current.initialState).toBeNull();
      expect(result.current.forceShowErrors).toBe(false);
      expect(result.current.seoErrors).toBeUndefined();
      expect(result.current.hasUnsavedChanges).toBe(false);
    });

    it('should update adminTitle state and latestDataRef', () => {
      const { result } = renderHook(() => usePublicationForm());

      act(() => {
        result.current.setAdminTitle(MOCK_TITLES.newAdmin);
      });

      expect(result.current.adminTitle).toBe(MOCK_TITLES.newAdmin);
      expect(result.current.latestDataRef.current.adminTitle).toBe(MOCK_TITLES.newAdmin);
    });

    it('should update adminTitleError and canonicalUrlError states', () => {
      const { result } = renderHook(() => usePublicationForm());
      const adminTitleErrorMessage = 'Помилка заголовку';
      const canonicalUrlErrorMessage = 'Помилка URL';

      act(() => {
        result.current.setAdminTitleError(adminTitleErrorMessage);
        result.current.setCanonicalUrlError(canonicalUrlErrorMessage);
      });

      expect(result.current.adminTitleError).toBe(adminTitleErrorMessage);
      expect(result.current.canonicalUrlError).toBe(canonicalUrlErrorMessage);
    });

    it('should update forceShowErrors state', () => {
      const { result } = renderHook(() => usePublicationForm());

      act(() => {
        result.current.setForceShowErrors(true);
      });

      expect(result.current.forceShowErrors).toBe(true);
    });

    it('should update publishDate state and latestDataRef', () => {
      const { result } = renderHook(() => usePublicationForm());
      const testDate = dayjs('2025-05-10');

      act(() => {
        result.current.setPublishDate(testDate);
      });

      expect(result.current.publishDate).toEqual(testDate);
      expect(result.current.latestDataRef.current.publishDate).toEqual(testDate);
    });

    it('should update crop state and latestDataRef', () => {
      const { result } = renderHook(() => usePublicationForm());
      const cropData: ImageCropData = {
        uk: { x: 0, y: 0, width: 100, height: 100 },
        en: { x: 0, y: 0, width: 100, height: 100 }
      };

      act(() => {
        result.current.setCrop(cropData);
      });

      expect(result.current.crop).toEqual(cropData);
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
      expect(result.current.latestDataRef.current.seoValue).toEqual(newSeo);

      act(() => {
        result.current.setSeoValue((prev) => ({
          ...prev,
          ogImage: MOCK_URLS.updatedImage
        }));
      });

      expect(result.current.seoValue.ogImage).toBe(MOCK_URLS.updatedImage);
    });

    it('should update startDateTime and endDateTime via handleDateTimeChange', () => {
      const { result } = renderHook(() => usePublicationForm());

      act(() => {
        result.current.handleDateTimeChange(MOCK_DATES.startDateTime, MOCK_DATES.endDateTime);
      });

      expect(result.current.seoValue.meta.uk.startDateTime).toBe(MOCK_DATES.startDateTime);
      expect(result.current.seoValue.meta.uk.endDateTime).toBe(MOCK_DATES.endDateTime);
      expect(result.current.seoValue.meta.en.startDateTime).toBe(MOCK_DATES.startDateTime);
      expect(result.current.seoValue.meta.en.endDateTime).toBe(MOCK_DATES.endDateTime);
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
        result.current.setAdminTitle(MOCK_TITLES.updatedAdmin);
      });

      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it('should build common input using latest form data', () => {
      const { result } = renderHook(() => usePublicationForm());
      const testDate = dayjs(MOCK_DATES.buildInputIso);
      const seoValue = createMockSeoValue({
        ogImage: MOCK_URLS.ogImage,
        meta: {
          uk: { ...MOCK_LOCALIZED_META.uk, altText: MOCK_ALT_TEXT },
          en: { ...MOCK_LOCALIZED_META.en, altText: MOCK_ALT_TEXT }
        }
      });

      act(() => {
        result.current.setAdminTitle(MOCK_TITLES.newsDay);
        result.current.setPublishDate(testDate);
        result.current.setSeoValue(seoValue);
      });

      const payload = result.current.buildCommonInput();

      expect(payload).toEqual({
        adminTitle: MOCK_TITLES.newsDay,
        title: { uk: MOCK_LOCALIZED_META.uk.title, en: MOCK_LOCALIZED_META.en.title },
        description: { uk: MOCK_LOCALIZED_META.uk.description, en: MOCK_LOCALIZED_META.en.description },
        keywords: { uk: MOCK_LOCALIZED_META.uk.keywords, en: MOCK_LOCALIZED_META.en.keywords },
        allowIndexation: { uk: true, en: true },
        publishedAt: MOCK_DATES.buildInputIso,
        coverImage: {
          src: MOCK_URLS.ogImage,
          alt: MOCK_ALT_TEXT,
          caption: { uk: MOCK_TITLES.newsDay, en: MOCK_TITLES.newsDay }
        }
      });
    });

    it('should fall back to adminTitle in buildCommonInput when meta values are empty', () => {
      const { result } = renderHook(() => usePublicationForm());

      act(() => {
        result.current.setAdminTitle(MOCK_TITLES.fallback);
      });

      const payload = result.current.buildCommonInput();

      expect(payload.title).toEqual({ uk: MOCK_TITLES.fallback, en: MOCK_TITLES.fallback });
      expect(payload.coverImage.src).toBe(MOCK_TITLES.fallback);
      expect(payload.coverImage.alt).toEqual({ uk: MOCK_TITLES.fallback, en: MOCK_TITLES.fallback });
    });
  });
});
