import { act, renderHook } from '@testing-library/react';

import { useUpload } from './useUpload';

describe('useUpload', () => {
  const mockFile = new File(['content'], 'test.png', { type: 'image/png' });

  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    globalThis.fetch ??= jest.fn();

    fetchSpy = jest.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  const mockFetchResponse = (data: unknown, ok = true) =>
    ({
      json: jest.fn().mockResolvedValue(data),
      ok
    }) as unknown as Response;

  it('should successfully upload a file without additional options', async () => {
    const mockResponse = {
      success: true,
      data: {
        url: 'https://example.com/test.png',
        filename: 'test.png',
        originalName: 'test.png',
        mimeType: 'image/png',
        size: 1024
      }
    };

    fetchSpy.mockResolvedValueOnce(mockFetchResponse(mockResponse));

    const { result } = renderHook(() => useUpload());

    let uploadResult;
    await act(async () => {
      uploadResult = await result.current.uploadFile(mockFile);
    });

    expect(uploadResult).toEqual(mockResponse.data);
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/uploads/single',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData)
      })
    );

    const formData = fetchSpy.mock.calls[0][1].body as FormData;
    expect(formData.get('file')).toBe(mockFile);
  });

  it('should include the directory in FormData when provided in options', async () => {
    fetchSpy.mockResolvedValueOnce(mockFetchResponse({ success: true, data: {} }));

    const { result } = renderHook(() => useUpload());

    await act(async () => {
      await result.current.uploadFile(mockFile, { directory: 'uploads/avatars' });
    });

    const formData = fetchSpy.mock.calls[0][1].body as FormData;
    expect(formData.get('directory')).toBe('uploads/avatars');
  });

  it('should include the fileType in FormData when provided in options', async () => {
    fetchSpy.mockResolvedValueOnce(mockFetchResponse({ success: true, data: {} }));

    const { result } = renderHook(() => useUpload());

    await act(async () => {
      await result.current.uploadFile(mockFile, { fileType: 'image' });
    });

    const formData = fetchSpy.mock.calls[0][1].body as FormData;
    expect(formData.get('fileType')).toBe('image');
  });

  it('should include the validationRules in FormData when provided in options', async () => {
    fetchSpy.mockResolvedValueOnce(mockFetchResponse({ success: true, data: {} }));

    const { result } = renderHook(() => useUpload());

    await act(async () => {
      await result.current.uploadFile(mockFile, { validationRules: 'maxSize:5MB' });
    });

    const formData = fetchSpy.mock.calls[0][1].body as FormData;
    expect(formData.get('validationRules')).toBe('maxSize:5MB');
  });

  it('should throw an error joining message strings from data.errors array', async () => {
    fetchSpy.mockResolvedValueOnce(
      mockFetchResponse({
        success: false,
        errors: ['File too large', 'Invalid format']
      })
    );

    const { result } = renderHook(() => useUpload());

    await act(async () => {
      await expect(result.current.uploadFile(mockFile)).rejects.toThrow('File too large, Invalid format');
    });
  });

  it('should throw an error from data.error field if errors array is missing', async () => {
    fetchSpy.mockResolvedValueOnce(
      mockFetchResponse({
        success: false,
        error: 'Single error message'
      })
    );

    const { result } = renderHook(() => useUpload());

    await act(async () => {
      await expect(result.current.uploadFile(mockFile)).rejects.toThrow('Single error message');
    });
  });

  it('should throw a default error message when server returns success: false without details', async () => {
    fetchSpy.mockResolvedValueOnce(mockFetchResponse({ success: false }));

    const { result } = renderHook(() => useUpload());

    await act(async () => {
      await expect(result.current.uploadFile(mockFile)).rejects.toThrow('Upload failed');
    });
  });

  it('should propagate a network error when fetch fails', async () => {
    fetchSpy.mockRejectedValueOnce(new Error('Network failure'));

    const { result } = renderHook(() => useUpload());

    await act(async () => {
      await expect(result.current.uploadFile(mockFile)).rejects.toThrow('Network failure');
    });
  });
});
