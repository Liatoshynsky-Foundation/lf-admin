import { renderHook } from '@testing-library/react';

import { toCreateAssetInput, useHybridFiles } from './useHybridFiles';
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
});
