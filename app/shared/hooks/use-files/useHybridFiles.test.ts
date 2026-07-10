import { act, renderHook, waitFor } from '@testing-library/react';

import { toCreateAssetInput, useHybridFiles, useR2Files } from './useHybridFiles';
import { type AllAssetsQuery, AssetType } from '~/types/graphql/generated/graphql';

type AssetItem = AllAssetsQuery['allAssets'][number];

const mongoAsset: AssetItem = {
  __typename: 'Asset',
  id: 'asset-1',
  type: AssetType.Image,
  tags: ['page'],
  filename: 'generated-photo.jpg',
  originalname: 'original-photo.jpg',
  mimeType: 'image/jpeg',
  sizeBytes: 2048,
  url: 'https://r2.example.com/photos/generated-photo.jpg',
  createdBy: 'Admin',
  description: 'Mongo description',
  isStarred: true,
  createdAt: '2026-07-08T10:00:00.000Z',
  updatedAt: '2026-07-08T10:00:00.000Z',
  usageRefs: [{ __typename: 'AssetUsageRef', pageId: 'about-us', blockId: 'IntroSection', locale: 'uk' }]
};

const r2File = {
  filename: 'generated-photo.jpg',
  originalName: 'R2 original name.jpg',
  mimeType: 'image/jpeg',
  size: 4096,
  createdAt: '2026-07-08T12:00:00.000Z',
  url: 'https://r2.example.com/photos/generated-photo.jpg',
  path: 'photos/generated-photo.jpg'
};

const orphanR2File = {
  filename: 'direct-upload.pdf',
  originalName: 'direct-upload.pdf',
  mimeType: 'application/pdf',
  size: 1024,
  createdAt: '2026-07-08T13:00:00.000Z',
  url: 'https://r2.example.com/uploads/direct-upload.pdf',
  path: 'uploads/direct-upload.pdf'
};

describe('useHybridFiles', () => {
  it('uses Mongo asset data when Mongo and R2 contain the same URL', () => {
    const { result } = renderHook(() => useHybridFiles([mongoAsset], [r2File]));

    expect(result.current).toHaveLength(1);
    expect(result.current[0]).toMatchObject({
      id: 'asset-1',
      name: 'original-photo.jpg',
      description: 'Mongo description',
      isStarred: true,
      usageLinks: 1,
      isOrphan: false
    });
  });

  it('adds R2-only files as orphan items', () => {
    const { result } = renderHook(() => useHybridFiles([mongoAsset], [r2File, orphanR2File]));

    expect(result.current).toHaveLength(2);
    expect(result.current[1]).toMatchObject({
      id: 'https://r2.example.com/uploads/direct-upload.pdf',
      name: 'direct-upload.pdf',
      type: 'pdf',
      isStarred: false,
      usageLinks: 0,
      isOrphan: true
    });
  });

  it('builds create asset input from an orphan file item', () => {
    const { result } = renderHook(() => useHybridFiles([], [orphanR2File]));

    expect(toCreateAssetInput(result.current[0])).toEqual({
      filename: 'direct-upload.pdf',
      originalname: 'direct-upload.pdf',
      url: 'https://r2.example.com/uploads/direct-upload.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1024,
      type: AssetType.Pdf
    });
  });

  it('uses display name as originalname when orphan original name is missing', () => {
    const fileWithoutOriginalName = { ...orphanR2File };
    delete (fileWithoutOriginalName as Partial<typeof orphanR2File>).originalName;

    const { result } = renderHook(() =>
      useHybridFiles([], [fileWithoutOriginalName as typeof orphanR2File])
    );

    expect(toCreateAssetInput(result.current[0])).toMatchObject({
      originalname: 'direct-upload.pdf'
    });
  });

  it('returns an empty list when no sources are provided', () => {
    const { result } = renderHook(() => useHybridFiles());

    expect(result.current).toEqual([]);
  });

  it('formats invalid dates, byte and megabyte file sizes, and missing usage links', () => {
    const assets: AssetItem[] = [
      {
        ...mongoAsset,
        id: 'asset-bytes',
        originalname: null,
        filename: 'bytes.jpeg',
        mimeType: 'image/jpeg',
        sizeBytes: 500,
        createdAt: 'not-a-date',
        usageRefs: [{ __typename: 'AssetUsageRef', pageId: null, blockId: null, locale: null }]
      },
      {
        ...mongoAsset,
        id: 'asset-megabytes',
        filename: 'large-file.bin',
        originalname: null,
        mimeType: 'application/octet-stream',
        sizeBytes: 2 * 1024 * 1024,
        url: 'https://r2.example.com/files/large-file.bin',
        usageRefs: []
      }
    ];

    const { result } = renderHook(() => useHybridFiles(assets, []));

    expect(result.current[0]).toMatchObject({
      name: 'bytes.jpeg',
      dateAdded: 'not-a-date',
      format: 'jpg',
      size: '500 B',
      usage: [{ href: undefined }]
    });
    expect(result.current[1]).toMatchObject({
      name: 'large-file.bin',
      format: 'bin',
      size: '2.0 MB'
    });
  });

  it('keeps absolute usage links and handles non-image Mongo assets', () => {
    const pdfAsset: AssetItem = {
      ...mongoAsset,
      id: 'asset-pdf',
      type: AssetType.Pdf,
      filename: 'document.pdf',
      originalname: null,
      mimeType: 'application/pdf',
      url: 'https://r2.example.com/files/document.pdf',
      createdBy: null,
      description: null,
      usageRefs: [{ __typename: 'AssetUsageRef', pageId: '/already-absolute', blockId: null, locale: null }]
    };

    const { result } = renderHook(() => useHybridFiles([pdfAsset], []));

    expect(result.current[0]).toMatchObject({
      type: 'pdf',
      imageSrc: undefined,
      previewUrl: undefined,
      addedBy: undefined,
      description: undefined,
      usage: [{ href: '/already-absolute' }]
    });
  });

  it.each([
    ['spreadsheet', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx'],
    ['document', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx'],
    ['archive zip', 'application/zip', 'zip'],
    ['archive rar', 'application/vnd.rar', 'rar'],
    ['svg', 'image/svg+xml', 'svg'],
    ['jpeg', 'image/jpeg', 'jpg'],
    ['wave', 'audio/wave', 'wav'],
    ['x-wav', 'audio/x-wav', 'wav'],
    ['unknown mime', 'application/custom', 'custom']
  ])('formats extension from mime type for %s', (label, mimeType, expectedFormat) => {
    const { result } = renderHook(() =>
      useHybridFiles([], [
        {
          ...orphanR2File,
          filename: '',
          originalName: '',
          mimeType,
          url: `https://r2.example.com/files/${label}`
        }
      ])
    );

    expect(result.current[0].format).toBe(expectedFormat);
  });

  it('returns undefined format when filename and mime subtype are missing', () => {
    const { result } = renderHook(() =>
      useHybridFiles([], [
        {
          ...orphanR2File,
          filename: '',
          originalName: '',
          mimeType: '',
          url: 'https://r2.example.com/files/no-format'
        }
      ])
    );

    expect(result.current[0].format).toBeUndefined();
  });

  it.each([
    ['image by extension', '', 'picture.webp', AssetType.Image, 'image'],
    ['audio by extension', '', 'song.mp3', AssetType.Audio, 'audio'],
    ['pdf by extension', '', 'file.pdf', AssetType.Pdf, 'pdf'],
    ['spreadsheet by extension', '', 'table.csv', AssetType.Spreadsheet, 'spreadsheet'],
    ['video by extension', '', 'movie.mp4', AssetType.Video, 'video'],
    ['archive by extension', '', 'archive.7z', AssetType.Archive, 'archive'],
    ['document fallback', '', 'notes.txt', AssetType.Document, 'document']
  ])('detects R2 asset type for %s', (_label, mimeType, filename, expectedAssetType, expectedCardType) => {
    const { result } = renderHook(() =>
      useHybridFiles([], [
        {
          ...orphanR2File,
          filename,
          originalName: '',
          mimeType,
          url: `https://r2.example.com/files/${filename}`
        }
      ])
    );

    expect(result.current[0]).toMatchObject({
      assetType: expectedAssetType,
      type: expectedCardType
    });
  });
});

describe('useR2Files', () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    mockFetch.mockReset();
    globalThis.fetch = mockFetch;
  });

  it('removes a file by url from the local R2 files list', async () => {
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: true,
          data: [
            {
              ...r2File,
              uploadedAt: new Date('2026-07-08T12:00:00.000Z')
            },
            {
              ...orphanR2File,
              uploadedAt: '2026-07-08T13:00:00.000Z'
            }
          ]
        })
    });

    const { result } = renderHook(() => useR2Files());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.files).toHaveLength(2);
    });

    expect(result.current.files[0].createdAt).toBe('2026-07-08T12:00:00.000Z');

    act(() => {
      result.current.removeFileByUrl(orphanR2File.url);
    });

    expect(result.current.files).toHaveLength(1);
    expect(result.current.files[0].url).toBe(r2File.url);
  });

  it('sets an error when R2 API returns unsuccessful response', async () => {
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: false,
          error: 'R2 failed'
        })
    });

    const { result } = renderHook(() => useR2Files());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toEqual(new Error('R2 failed'));
    });
  });

  it('uses default message when R2 API returns unsuccessful response without error text', async () => {
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: false
        })
    });

    const { result } = renderHook(() => useR2Files());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toEqual(new Error('Failed to fetch R2 files'));
    });
  });

  it('keeps Error instances from failed R2 fetches', async () => {
    mockFetch.mockRejectedValue(new Error('Network failed'));

    const { result } = renderHook(() => useR2Files());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toEqual(new Error('Network failed'));
    });
  });

  it('sets fallback error when R2 fetch rejects with non-Error value', async () => {
    mockFetch.mockRejectedValue('network failed');

    const { result } = renderHook(() => useR2Files());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toEqual(new Error('Failed to fetch R2 files'));
    });
  });
});
