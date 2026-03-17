import { createBaseRepository } from '../baseRepository/baseRepository';
import { AssetRepository } from './assetRepository';

jest.mock('../baseRepository/baseRepository', () => ({
  createBaseRepository: jest.fn((config) => config)
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
