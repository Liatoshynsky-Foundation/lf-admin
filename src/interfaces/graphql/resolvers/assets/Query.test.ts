import { createMockContext } from '../testUtils';
import { AllAssetsArgs, AssetsMutation, AssetsQuery } from './Query';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { SortOrder } from '~/types/enums/common.enums';
import { AssetType } from '~/types/graphql/generated/graphql';

jest.mock('mongoose');
jest.mock('~/infrastructure/models/imageCrop.model');

const MOCK_COMPOSITION_ID = 'composition-id';
const MOCK_COMPOSITION_NAME_UK = 'Соната';
const MOCK_COMPOSITION_NAME_EN = 'Sonata';
const MOCK_COMPOSITION = {
  id: MOCK_COMPOSITION_ID,
  name: { uk: MOCK_COMPOSITION_NAME_UK, en: MOCK_COMPOSITION_NAME_EN }
};
const MOCK_LEGACY_COMPOSITION_ID = '507f1f77bcf86cd799439011';
const MOCK_LEGACY_COMPOSITION_NAME_EN = 'English title';
const MOCK_LEGACY_COMPOSITION = {
  id: MOCK_LEGACY_COMPOSITION_ID,
  name: { uk: '', en: MOCK_LEGACY_COMPOSITION_NAME_EN }
};
const MOCK_NAMELESS_COMPOSITION_ID = '507f1f77bcf86cd799439012';
const MOCK_NAMELESS_COMPOSITION = {
  id: MOCK_NAMELESS_COMPOSITION_ID,
  name: { uk: '', en: '' }
};
const MOCK_PAGE_ID = 'files-page';

const MOCK_ASSET = {
  id: 'asset-id',
  tags: [],
  sizeBytes: 1,
  isStarred: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
};

const MOCK_PDF_ASSET = {
  ...MOCK_ASSET,
  usageRefs: [{ compositionId: MOCK_COMPOSITION_ID }],
  filename: 'asset.pdf',
  type: 'pdf',
  url: 'https://example.com/asset.pdf',
  mimeType: 'application/pdf'
};

const MOCK_AUDIO_ASSET = {
  ...MOCK_ASSET,
  usageRefs: [{ compositionId: MOCK_COMPOSITION_ID }],
  filename: 'asset.mp3',
  type: 'audio',
  mimeType: 'audio/mpeg',
  url: 'https://example.com/asset.mp3'
};

const MOCK_IMAGE_ASSET = {
  ...MOCK_ASSET,
  filename: 'file.jpg',
  mimeType: 'image/jpeg',
  url: 'https://example.com/file.jpg',
  type: AssetType.Image
};

const MOCK_PAGE_ASSET = {
  ...MOCK_IMAGE_ASSET,
  usageRefs: [{ pageId: MOCK_PAGE_ID }]
};

const MOCK_LEGACY_ASSET = {
  ...MOCK_PDF_ASSET,
  usageRefs: [
    { pageId: MOCK_LEGACY_COMPOSITION_ID },
    { pageId: MOCK_NAMELESS_COMPOSITION_ID },
    { pageId: MOCK_PAGE_ID }
  ]
};

describe('AssetsQuery', () => {
  const mockRepo = {
    findAll: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should pass filters to assets repository', async () => {
    const expectedAssets = [{ ...MOCK_PDF_ASSET, usageRefs: [] }];
    mockRepo.findAll.mockResolvedValue(expectedAssets);

    const ctx = createMockContext(true, 'assetsRepository', mockRepo);

    const filters = {
      type: AssetType.Pdf,
      isStarred: true,
      sortBy: 'createdAt' as const,
      sortOrder: SortOrder.Desc,
      limit: 20,
      skip: 0
    };

    const res = await AssetsQuery.allAssets({}, { filters }, ctx);

    expect(res).toEqual(expectedAssets);
    expect(mockRepo.findAll).toHaveBeenCalledWith(filters);
  });

  it('should enrich composition usage references with composition names', async () => {
    const compositionsRepository = {
      findByIds: jest.fn().mockResolvedValue([MOCK_COMPOSITION])
    };
    mockRepo.findAll.mockResolvedValue([MOCK_AUDIO_ASSET]);
    const context = {
      admin: true,
      requestContainer: { cradle: { assetsRepository: mockRepo, compositionsRepository } }
    } as unknown as GraphQLContext;

    await expect(AssetsQuery.allAssets({}, { filters: {} }, context)).resolves.toEqual([
      expect.objectContaining({
        usageRefs: [{ compositionId: MOCK_COMPOSITION_ID, compositionName: MOCK_COMPOSITION_NAME_UK }]
      })
    ]);
    expect(compositionsRepository.findByIds).toHaveBeenCalledWith([MOCK_COMPOSITION_ID]);
  });

  it('should resolve legacy composition references and fall back to English names or IDs', async () => {
    const compositionsRepository = {
      findByIds: jest.fn().mockResolvedValue([MOCK_LEGACY_COMPOSITION, MOCK_NAMELESS_COMPOSITION])
    };
    mockRepo.findAll.mockResolvedValue([MOCK_LEGACY_ASSET]);
    const context = {
      admin: true,
      requestContainer: { cradle: { assetsRepository: mockRepo, compositionsRepository } }
    } as unknown as GraphQLContext;

    await expect(AssetsQuery.allAssets({}, { filters: {} }, context)).resolves.toEqual([
      expect.objectContaining({
        usageRefs: [
          { pageId: MOCK_LEGACY_COMPOSITION_ID, compositionName: MOCK_LEGACY_COMPOSITION_NAME_EN },
          { pageId: MOCK_NAMELESS_COMPOSITION_ID, compositionName: MOCK_NAMELESS_COMPOSITION_ID },
          { pageId: MOCK_PAGE_ID }
        ]
      })
    ]);
    expect(compositionsRepository.findByIds).toHaveBeenCalledWith([
      MOCK_LEGACY_COMPOSITION_ID,
      MOCK_NAMELESS_COMPOSITION_ID
    ]);
  });

  it('should not load compositions when asset usage has no composition references', async () => {
    const compositionsRepository = { findByIds: jest.fn() };
    const assets = [MOCK_PAGE_ASSET];
    mockRepo.findAll.mockResolvedValue(assets);
    const context = {
      admin: true,
      requestContainer: { cradle: { assetsRepository: mockRepo, compositionsRepository } }
    } as unknown as GraphQLContext;

    await expect(AssetsQuery.allAssets({}, { filters: {} }, context)).resolves.toEqual(assets);
    expect(compositionsRepository.findByIds).not.toHaveBeenCalled();
  });

  it('should throw when admin is missing', async () => {
    const invalidCtx = createMockContext(false, 'assetsRepository', mockRepo);

    const args = {
      filters: {}
    } as unknown as { filters: AllAssetsArgs['filters'] };

    await expect(AssetsQuery.allAssets({}, args as never, invalidCtx)).rejects.toThrow();
  });

  describe('AssetsMutation', () => {
    const mockRepo = {
      findAll: jest.fn(),
      updateAsset: jest.fn(),
      createAsset: jest.fn(),
      deleteAsset: jest.fn()
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('updateAsset: should update asset', async () => {
      const expected = { id: '1', isStarred: true };
      mockRepo.updateAsset.mockResolvedValue(expected);
      const ctx = createMockContext(true, 'assetsRepository', mockRepo);

      const input = { isStarred: true };
      const res = await AssetsMutation.updateAsset({}, { id: '1', input }, ctx);

      expect(res).toEqual(expected);
      expect(mockRepo.updateAsset).toHaveBeenCalledWith('1', input);
    });

    it('createAsset: should create asset', async () => {
      const expected = { id: '2', filename: 'file.jpg' };
      mockRepo.createAsset.mockResolvedValue(expected);
      const ctx = createMockContext(true, 'assetsRepository', mockRepo);

      const res = await AssetsMutation.createAsset({}, { input: MOCK_IMAGE_ASSET }, ctx);

      expect(res).toEqual(expected);
      expect(mockRepo.createAsset).toHaveBeenCalledWith(MOCK_IMAGE_ASSET);
    });

    it('deleteAsset: should delete asset', async () => {
      mockRepo.deleteAsset.mockResolvedValue(true);
      const ctx = createMockContext(true, 'assetsRepository', mockRepo);

      const res = await AssetsMutation.deleteAsset({}, { id: '1' }, ctx);

      expect(res).toBe(true);
      expect(mockRepo.deleteAsset).toHaveBeenCalledWith('1');
    });
  });
});
