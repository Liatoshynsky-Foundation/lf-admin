import { act, renderHook, waitFor } from '@testing-library/react';

import { useFiles } from './useFiles';

type MockResponse = {
  json: jest.Mock<Promise<unknown>>;
  ok: boolean;
};

describe('useFiles', () => {
  let fetchSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  const mockFetchResponse = (data: unknown, ok = true): MockResponse => ({
    ok,
    json: jest.fn().mockResolvedValue(data)
  });

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    if (!globalThis.fetch) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      globalThis.fetch = jest.fn() as any;
    }

    fetchSpy = jest.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('fetches files automatically when autoFetch is true', async () => {
    const fileItems = [{ id: 'file-1', name: 'doc.pdf' }];
    fetchSpy.mockResolvedValueOnce(mockFetchResponse({ success: true, data: fileItems }));

    const { result } = renderHook(() => useFiles());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(fetchSpy).toHaveBeenCalledWith('/api/uploads');
    expect(result.current.files).toEqual(fileItems);
    expect(result.current.error).toBeNull();
  });

  it('fetches files automatically using the provided default folder', async () => {
    const fileItems = [{ id: 'file-3', name: 'report.docx' }];
    fetchSpy.mockResolvedValueOnce(mockFetchResponse({ success: true, data: fileItems }));

    const { result } = renderHook(() => useFiles({ folder: 'docs' }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(fetchSpy).toHaveBeenCalledWith('/api/uploads?folder=docs');
    expect(result.current.files).toEqual(fileItems);
    expect(result.current.error).toBeNull();
  });

  it('sets an error when autoFetch response returns success: false', async () => {
    fetchSpy.mockResolvedValueOnce(mockFetchResponse({ success: false, error: 'Auto fetch failed' }));

    const { result } = renderHook(() => useFiles({ folder: 'docs' }));

    await waitFor(() => expect(result.current.error).toBe('Auto fetch failed'));

    expect(fetchSpy).toHaveBeenCalledWith('/api/uploads?folder=docs');
    expect(result.current.files).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('does not auto-fetch when autoFetch is false, but refetch still works', async () => {
    const fileItems = [{ id: 'file-2', name: 'image.png' }];
    fetchSpy.mockResolvedValueOnce(mockFetchResponse({ success: true, data: fileItems }));

    const { result } = renderHook(() => useFiles({ autoFetch: false }));

    expect(fetchSpy).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.refetch('photos');
    });

    expect(fetchSpy).toHaveBeenCalledWith('/api/uploads?folder=photos');
    expect(result.current.files).toEqual(fileItems);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('sets an error when the response returns success: false', async () => {
    fetchSpy.mockResolvedValueOnce(mockFetchResponse({ success: false, error: 'Server problem' }));

    const { result } = renderHook(() => useFiles({ autoFetch: false }));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.files).toEqual([]);
    expect(result.current.error).toBe('Server problem');
    expect(result.current.loading).toBe(false);
  });

  it('sets an error when fetch throws', async () => {
    fetchSpy.mockRejectedValueOnce(new Error('Network failed'));

    const { result } = renderHook(() => useFiles({ autoFetch: false }));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.files).toEqual([]);
    expect(result.current.error).toBe('Network failed');
    expect(result.current.loading).toBe(false);
  });

  it('sets unknown error when thrown value is not an Error', async () => {
    fetchSpy.mockRejectedValueOnce('unexpected failure');

    const { result } = renderHook(() => useFiles({ autoFetch: false }));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.files).toEqual([]);
    expect(result.current.error).toBe('Unknown error occurred');
    expect(result.current.loading).toBe(false);
  });

  it('sets default error message when response ok is false and error field is missing', async () => {
    fetchSpy.mockResolvedValueOnce(mockFetchResponse({ success: false }, false));

    const { result } = renderHook(() => useFiles({ autoFetch: false }));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.files).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch files');
    expect(result.current.loading).toBe(false);
  });

  it('uses fallback error message when data.error is missing on success false', async () => {
    fetchSpy.mockResolvedValueOnce(mockFetchResponse({ success: false }));

    const { result } = renderHook(() => useFiles({ autoFetch: false }));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.files).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch files');
    expect(result.current.loading).toBe(false);
  });
});
