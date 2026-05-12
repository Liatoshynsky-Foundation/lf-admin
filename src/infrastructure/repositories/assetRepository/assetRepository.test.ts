import { createBaseRepository } from '../baseRepository/baseRepository';
import { AssetRepository } from './assetRepository';

jest.mock('~/src/middleware/logger/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('../baseRepository/baseRepository', () => ({
  createBaseRepository: jest.fn((config) => config)
}));

jest.mock('../../../config', () => ({
  config: { uploads: { storage: { type: 'local' } } }
}));
jest.mock('../../../uploads/storage', () => ({
  createStorageAdapter: jest.fn(() => ({
    delete: jest.fn().mockResolvedValue({ success: true })
  }))
}));

describe('AssetRepository', () => {
  const mockedCreateBaseRepository = createBaseRepository as jest.Mock;

  beforeEach(() => {
    mockedCreateBaseRepository.mockClear();
  });

  it('should pass model and handlers into base repository factory', () => {
    const model = {};

    AssetRepository({ AssetModel: model as never });

    const config = mockedCreateBaseRepository.mock.calls[0][0] as Record<string, unknown>;

    expect(mockedCreateBaseRepository).toHaveBeenCalledTimes(1);
    expect(config.model).toBe(model);
    expect(typeof config.toEntity).toBe('function');
    expect(typeof config.buildQuery).toBe('function');
    expect(typeof config.getDefaultSort).toBe('function');
  });

  it('should map document to entity and safely convert dates', () => {
    AssetRepository({ AssetModel: {} as never });

    const config = mockedCreateBaseRepository.mock.calls[0][0] as {
      toEntity: (doc: Record<string, unknown>) => Record<string, unknown>;
    };

    const doc = {
      _id: { toString: () => 'asset-id-1' },
      type: 'image',
      tags: ['archive'],
      usageRefs: [{ pageId: 'about-us', blockId: 'hero' }],
      filename: 'piano.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 2048,
      url: '/uploads/piano.jpg',
      createdBy: { toString: () => 'admin-id-1' },
      description: 'desc',
      isStarred: true,
      createdAt: new Date('2026-03-10T10:00:00.000Z'),
      updatedAt: null
    };

    const entity = config.toEntity(doc);

    expect(entity.id).toBe('asset-id-1');
    expect(entity.createdBy).toBe('admin-id-1');
    expect(entity.createdAt).toBe('2026-03-10T10:00:00.000Z');
    expect(entity.updatedAt).toBe(new Date(0).toISOString());
  });

  it('should build query and sort based on filters', () => {
    AssetRepository({ AssetModel: {} as never });

    const config = mockedCreateBaseRepository.mock.calls[0][0] as {
      buildQuery: (filters?: Record<string, unknown>) => Record<string, unknown>;
      getDefaultSort: (filters?: Record<string, unknown>) => Record<string, 1 | -1>;
    };

    expect(config.buildQuery()).toEqual({});

    const query = config.buildQuery({
      type: 'pdf',
      isStarred: false,
      tag: 'archive',
      search: '  press  '
    });

    expect(query.type).toBe('pdf');
    expect(query.isStarred).toBe(false);
    expect(query.tags).toBe('archive');
    expect(query.filename).toBeInstanceOf(RegExp);
    expect((query.filename as RegExp).test('press-kit.pdf')).toBe(true);

    expect(config.getDefaultSort()).toEqual({ createdAt: -1 });
    expect(config.getDefaultSort({ sortBy: 'filename', sortOrder: 'asc' })).toEqual({ filename: 1 });
  });
});

describe('deleteAsset', () => {
  const mockAssetModel = {
    findById: jest.fn(),
    findByIdAndDelete: jest.fn()
  };

  const repository = AssetRepository({ AssetModel: mockAssetModel as never });

  it('should throw an error if the asset is not found', async () => {
    mockAssetModel.findById.mockResolvedValueOnce(null);

    await expect(repository.deleteAsset('fake-id')).rejects.toThrow('Файл не знайдено');
  });

  it('should throw an error if the asset is used on the site', async () => {
    mockAssetModel.findById.mockResolvedValueOnce({
      _id: 'fake-id',
      usageRefs: [{ pageId: 'some-page-id' }]
    });

    await expect(repository.deleteAsset('fake-id')).rejects.toThrow('Cannot delete: file is in use on the site.');
    expect(mockAssetModel.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it('should successfully delete asset from storage and DB if not in use', async () => {
    mockAssetModel.findById.mockResolvedValueOnce({
      _id: 'fake-id',
      filename: 'test-image.png',
      type: 'image',
      usageRefs: []
    });
    mockAssetModel.findByIdAndDelete.mockResolvedValueOnce({});

    const result = await repository.deleteAsset('fake-id');

    expect(result).toBe(true);
    expect(mockAssetModel.findByIdAndDelete).toHaveBeenCalledWith('fake-id');
  });
});
