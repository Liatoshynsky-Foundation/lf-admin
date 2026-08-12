import { act, render, renderHook } from '@testing-library/react';
import { createElement, Fragment } from 'react';
import { toast } from 'react-hot-toast';

import { usePageSeo } from './usePageSeo';
import { initialSeoValue } from '~/constants/publications';
import type { SeoBlockValue } from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';
import type { LocalizedMeta } from '~/shared/components/forms/seo-metadata-form/SeoMetadataForm';

const mockUpdatePageSeo = jest.fn();
const mockUseGetPageSeoQuery = jest.fn();

type CanonicalUrlFieldProps = {
  value: string;
  onChange: (val: string) => void;
  onBlur?: () => void;
};

let canonicalUrlFieldProps: CanonicalUrlFieldProps | null = null;

jest.mock('~/types/graphql/generated/graphql', () => ({
  useGetPageSeoQuery: (...args: unknown[]) => mockUseGetPageSeoQuery(...args),
  useUpdatePageSeoMutation: () => [mockUpdatePageSeo]
}));

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('~/shared/components/forms/seo-metadata-form/seo-canonicalurl-field/SeoCanonicalUrlField', () => ({
  SeoCanonicalUrlField: (props: CanonicalUrlFieldProps) => {
    canonicalUrlFieldProps = props;
    return null;
  }
}));

const pageSeoData = {
  slug: 'about-us',
  title: { uk: 'Про нас', en: 'About us' },
  description: { uk: 'Опис', en: 'Description' },
  keywords: { uk: 'ключові слова', en: 'keywords' },
  canonicalUrl: { uk: 'https://example.com/uk', en: 'https://example.com/en' },
  coverImage: { src: '/cover.png', alt: { uk: 'Зображення', en: 'Image' } },
  allowIndexation: { uk: false, en: true },
  updatedAt: '2024-01-01T00:00:00.000Z'
};

describe('usePageSeo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    canonicalUrlFieldProps = null;
    mockUseGetPageSeoQuery.mockReturnValue({ data: undefined, loading: false });
    mockUpdatePageSeo.mockResolvedValue({ data: { updatePageSeo: { id: '1' } } });
  });

  it('should initialize with default SEO value', () => {
    const { result } = renderHook(() => usePageSeo('about-us'));

    expect(mockUseGetPageSeoQuery).toHaveBeenCalledWith({ variables: { slug: 'about-us' } });
    expect(result.current.seoValue).toEqual(initialSeoValue);
    expect(result.current.loading).toBe(false);
  });

  it('should populate seoValue from query data', async () => {
    mockUseGetPageSeoQuery.mockReturnValue({
      data: { pageBlocks: pageSeoData },
      loading: false
    });

    const { result } = renderHook(() => usePageSeo('about-us'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.seoValue.meta).toEqual(
      expect.objectContaining({
        uk: expect.objectContaining({ title: 'Про нас' }),
        en: expect.objectContaining({ title: 'About us' })
      })
    );

    expect(result.current.seoValue.ogImage).toBe('/cover.png');
    expect(result.current.seoValue.allowIndexing).toEqual({ uk: false, en: true });
  });

  it('should save SEO data successfully', async () => {
    const seoValue: SeoBlockValue = {
      meta: {
        uk: {
          title: 'UK Title',
          description: 'UK Desc',
          keywords: 'uk keywords',
          canonicalUrl: 'https://example.com/uk'
        },
        en: {
          title: 'EN Title',
          description: 'EN Desc',
          keywords: 'en keywords',
          canonicalUrl: 'https://example.com/en'
        }
      },
      ogImage: '/cover.png',
      allowIndexing: { uk: false, en: true }
    };

    const { result } = renderHook(() => usePageSeo('about-us'));

    act(() => {
      result.current.setSeoValue(seoValue);
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockUpdatePageSeo).toHaveBeenCalledWith({
      variables: {
        input: {
          slug: 'about-us',
          title: { uk: 'UK Title', en: 'EN Title' },
          description: { uk: 'UK Desc', en: 'EN Desc' },
          keywords: { uk: 'uk keywords', en: 'en keywords' },
          canonicalUrl: { uk: 'https://example.com/uk', en: 'https://example.com/en' },
          allowIndexation: { uk: false, en: true }
        }
      },
      refetchQueries: ['GetPageSeo']
    });
    expect(toast.success).toHaveBeenCalledWith('SEO збережено успішно');
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('should show error toast when save fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockUpdatePageSeo.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => usePageSeo('about-us'));

    await act(async () => {
      await result.current.handleSave();
    });

    expect(toast.error).toHaveBeenCalledWith('Щось пішло не так, спробуйте знову');
    expect(toast.success).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should render pageExtraFields with canonical url value', () => {
    const { result } = renderHook(() => usePageSeo('about-us'));
    const onChange = jest.fn();
    const value: LocalizedMeta = {
      title: 'Title',
      description: 'Description',
      keywords: 'keywords',
      canonicalUrl: 'https://example.com/page'
    };

    render(createElement(Fragment, null, result.current.pageExtraFields('uk', value, onChange)));

    expect(canonicalUrlFieldProps?.value).toBe('https://example.com/page');
  });

  it('should default canonical url to empty string when it is missing', () => {
    const { result } = renderHook(() => usePageSeo('about-us'));
    const onChange = jest.fn();
    const value: LocalizedMeta = {
      title: 'Title',
      description: 'Description',
      keywords: 'keywords'
    };

    render(createElement(Fragment, null, result.current.pageExtraFields('en', value, onChange)));

    expect(canonicalUrlFieldProps?.value).toBe('');
  });

  it('should update localized meta when canonical url changes', () => {
    const { result } = renderHook(() => usePageSeo('about-us'));
    const onChange = jest.fn();
    const value: LocalizedMeta = {
      title: 'Title',
      description: 'Description',
      keywords: 'keywords',
      canonicalUrl: 'https://example.com/page'
    };

    render(createElement(Fragment, null, result.current.pageExtraFields('uk', value, onChange)));

    act(() => {
      canonicalUrlFieldProps?.onChange('https://example.com/updated');
      canonicalUrlFieldProps?.onBlur?.();
    });

    expect(onChange).toHaveBeenCalledWith({
      ...value,
      canonicalUrl: 'https://example.com/updated'
    });
  });
});
