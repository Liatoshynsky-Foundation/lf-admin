import { renderHook, waitFor } from '@testing-library/react';

import { useGalleryFiles } from './useGallery';

const mockFetch = jest.fn();
globalThis.fetch = mockFetch;

const makeResponse = (body: unknown) => Promise.resolve({ json: () => Promise.resolve(body) } as Response);

describe('useGalleryFiles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should start with isLoading=true, empty files and null error', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useGalleryFiles());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.files).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should fetch from /api/uploads?folder=photos', async () => {
    mockFetch.mockReturnValue(makeResponse({ success: true, data: [] }));

    renderHook(() => useGalleryFiles());

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/uploads?folder=photos');
    });
  });

  it('should map files and set isLoading=false on success', async () => {
    const rawFile = {
      filename: 'photo.jpg',
      originalName: 'photo.jpg',
      mimeType: 'image/jpeg',
      size: 1024,
      uploadedAt: '2024-01-15T10:00:00.000Z',
      url: 'https://r2.example.com/photo.jpg',
      path: 'photos/photo.jpg'
    };

    mockFetch.mockReturnValue(makeResponse({ success: true, data: [rawFile] }));

    const { result } = renderHook(() => useGalleryFiles());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.files).toHaveLength(1);
    expect(result.current.files[0]).toMatchObject({
      filename: 'photo.jpg',
      mimeType: 'image/jpeg',
      createdAt: '2024-01-15T10:00:00.000Z'
    });
    expect(result.current.error).toBeNull();
  });

  it('should convert uploadedAt Date instance to ISO string', async () => {
    const date = new Date('2024-03-01T12:00:00.000Z');
    const rawFile = {
      filename: 'audio.mp3',
      originalName: 'audio.mp3',
      mimeType: 'audio/mpeg',
      size: 512,
      uploadedAt: date
    };

    mockFetch.mockReturnValue(makeResponse({ success: true, data: [rawFile] }));

    const { result } = renderHook(() => useGalleryFiles());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.files[0].createdAt).toBe(date.toISOString());
  });

  it('should convert uploadedAt string via String()', async () => {
    const rawFile = {
      filename: 'doc.pdf',
      originalName: 'doc.pdf',
      mimeType: 'application/pdf',
      size: 2048,
      uploadedAt: '2024-06-10'
    };

    mockFetch.mockReturnValue(makeResponse({ success: true, data: [rawFile] }));

    const { result } = renderHook(() => useGalleryFiles());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.files[0].createdAt).toBe('2024-06-10');
  });

  it('should set error when data.success is false', async () => {
    mockFetch.mockReturnValue(makeResponse({ success: false }));

    const { result } = renderHook(() => useGalleryFiles());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Upload files failed');
    expect(result.current.files).toEqual([]);
  });

  it('should set error when fetch throws', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useGalleryFiles());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Upload files failed');
    expect(result.current.files).toEqual([]);
  });
});
