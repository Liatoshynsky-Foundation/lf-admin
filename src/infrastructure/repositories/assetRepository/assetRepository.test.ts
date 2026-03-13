import { Types } from 'mongoose';

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

    const result = AssetRepository({ AssetModel: model as never }) as Record<string, unknown>;

    expect(mockedCreateBaseRepository).toHaveBeenCalledTimes(1);
    expect(result.model).toBe(model);
    expect(typeof result.toEntity).toBe('function');
    expect(typeof result.buildQuery).toBe('function');
    expect(typeof result.getDefaultSort).toBe('function');
  });

  it('should map document to entity and safely convert dates', () => {
    const result = AssetRepository({ AssetModel: {} as never }) as {
      toEntity: (doc: Record<string, unknown>) => Record<string, unknown>;
    };

    const doc = {
      _id: new Types.ObjectId(),
      type: 'image',
      tags: ['archive'],
      usageRefs: [{ pageId: 'about-us', blockId: 'hero' }],
      filename: 'piano.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 2048,
      url: '/tmp/piano.jpg',
      createdBy: new Types.ObjectId(),
      description: 'desc',
      isStarred: true,
      createdAt: new Date('2026-03-10T10:00:00.000Z'),
      updatedAt: null
    };

    const entity = result.toEntity(doc);

    expect(entity.id).toBe(String(doc._id));
    expect(entity.createdBy).toBe(String(doc.createdBy));
    expect(entity.createdAt).toBe('2026-03-10T10:00:00.000Z');
    expect(entity.updatedAt).toBe(new Date(0).toISOString());
  });

  it('should build query and sort based on filters', () => {
    const result = AssetRepository({ AssetModel: {} as never }) as {
      buildQuery: (filters?: Record<string, unknown>) => Record<string, unknown>;
      getDefaultSort: (filters?: Record<string, unknown>) => Record<string, 1 | -1>;
    };

    expect(result.buildQuery()).toEqual({});

    const query = result.buildQuery({
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

    expect(result.getDefaultSort()).toEqual({ createdAt: -1 });
    expect(result.getDefaultSort({ sortBy: 'filename', sortOrder: 'asc' })).toEqual({ filename: 1 });
  });
});
