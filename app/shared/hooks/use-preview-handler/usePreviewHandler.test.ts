import { renderHook } from '@testing-library/react';
import toast from 'react-hot-toast';

import { usePreviewHandler } from './usePreviewHandler';
import { fetchPreview } from '~/lib/utils/fetchPreview';

jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
  success: jest.fn()
}));

jest.mock('~/lib/utils/fetchPreview', () => ({
  fetchPreview: jest.fn()
}));

const MOCK_PREVIEW = {
  id: 'preview-123',
  slug: 'test-slug',
  baseRoute: 'news'
} as const;

describe('usePreviewHandler', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should do nothing if savePromise is undefined', async () => {
    const { result } = renderHook(() => usePreviewHandler());

    await result.current.handlePreview(undefined, MOCK_PREVIEW.baseRoute);

    expect(fetchPreview).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it.each([
    ['null', Promise.resolve(null)],
    ['missing id', Promise.resolve({ id: '', slug: MOCK_PREVIEW.slug })],
    ['missing slug', Promise.resolve({ id: MOCK_PREVIEW.id, slug: '' })]
  ])('should return early when savePromise resolves to %s', async (_, savePromise) => {
    const { result } = renderHook(() => usePreviewHandler());

    await result.current.handlePreview(savePromise, MOCK_PREVIEW.baseRoute);

    expect(fetchPreview).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('should call fetchPreview with formatted slug and draftId when savePromise succeeds', async () => {
    (fetchPreview as jest.Mock).mockResolvedValue(undefined);
    const savePromise = Promise.resolve({ id: MOCK_PREVIEW.id, slug: MOCK_PREVIEW.slug });
    const { result } = renderHook(() => usePreviewHandler());

    await result.current.handlePreview(savePromise, MOCK_PREVIEW.baseRoute);

    expect(fetchPreview).toHaveBeenCalledTimes(1);
    expect(fetchPreview).toHaveBeenCalledWith({
      slug: `${MOCK_PREVIEW.baseRoute}/${MOCK_PREVIEW.slug}`,
      lang: 'uk',
      draftId: MOCK_PREVIEW.id
    });
  });

  it('should catch error when savePromise rejects and display toast error', async () => {
    const mockError = new Error('Save failed');
    const savePromise = Promise.reject(mockError);
    const { result } = renderHook(() => usePreviewHandler());

    await result.current.handlePreview(savePromise, MOCK_PREVIEW.baseRoute);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to prepare preview:', mockError);
    expect(toast.error).toHaveBeenCalledWith('Не вдалося відкрити попередній перегляд.');
    expect(fetchPreview).not.toHaveBeenCalled();
  });

  it('should catch error when fetchPreview rejects and display toast error', async () => {
    const mockFetchError = new Error('Network error');
    (fetchPreview as jest.Mock).mockRejectedValue(mockFetchError);
    const savePromise = Promise.resolve({ id: MOCK_PREVIEW.id, slug: MOCK_PREVIEW.slug });
    const { result } = renderHook(() => usePreviewHandler());

    await result.current.handlePreview(savePromise, MOCK_PREVIEW.baseRoute);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to prepare preview:', mockFetchError);
    expect(toast.error).toHaveBeenCalledWith('Не вдалося відкрити попередній перегляд.');
  });
});
