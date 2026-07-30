import { Model } from 'mongoose';

import { DbMediaMention, MediaMentionsRepository } from './mediaMentionRepository';
import { CreateMediaMentionInput, MediaMentionFilters } from '~/domain/repositories/mediaMentionsRepository';
import { MediaStatus } from '~/types/enums/common.enums';

jest.mock('mongoose', () => ({
  Schema: jest.fn(),
  model: jest.fn(),
  Types: {
    ObjectId: {
      isValid: (id: string) => /^[0-9a-fA-F]{24}$/.test(id)
    }
  }
}));

jest.mock('~/infrastructure/db/connect', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined)
}));

interface MockQuery {
  sort: jest.Mock;
  skip: jest.Mock;
  limit: jest.Mock;
  lean: jest.Mock;
}

describe('MediaMentionsRepository - Advanced Filtering & Sorting Logic', () => {
  const mockDbMentions: DbMediaMention[] = [
    {
      _id: { toString: () => '1' },
      adminTitle: 'C Mention',
      status: MediaStatus.Published,
      slug: 'slug-1',
      createdAt: '2024-01-01',
      meta: { views: 100 }
    } as DbMediaMention,
    {
      _id: { toString: () => '2' },
      adminTitle: 'A Mention',
      status: MediaStatus.Draft,
      slug: 'slug-2',
      createdAt: '2024-01-05',
      meta: { views: 50 }
    } as DbMediaMention,
    {
      _id: { toString: () => '3' },
      adminTitle: 'B Mention',
      status: MediaStatus.Published,
      slug: 'slug-3',
      createdAt: '2024-01-03',
      meta: { views: 200 }
    } as DbMediaMention
  ];

  const findMock = jest.fn();
  const MockModel = { find: findMock } as unknown as Model<DbMediaMention>;

  const setupQueryMock = (data: DbMediaMention[]) => {
    const queryBuilder = {
      state: {
        data: [...data],
        sort: {} as Record<string, number>
      },
      sort: jest.fn().mockImplementation(function (this: typeof queryBuilder, sortObj: Record<string, number>) {
        this.state.sort = sortObj;
        return this;
      }),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockImplementation(async function (this: typeof queryBuilder) {
        const result = [...this.state.data];

        if (Object.keys(this.state.sort).length > 0) {
          result.sort((a, b) => {
            for (const [field, order] of Object.entries(this.state.sort)) {
              const valA = (a as unknown as Record<string, string | number>)[field];
              const valB = (b as unknown as Record<string, string | number>)[field];
              if (valA === valB) continue;

              if (valA > valB) return order;
              return -order;
            }
            return 0;
          });
        }
        return result;
      })
    };
    findMock.mockReturnValue(queryBuilder);
    return queryBuilder;
  };

  const repository = MediaMentionsRepository({ MediaMentionsModel: MockModel });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complex Sorting Logic', () => {
    it('should maintain default sort order (createdAt DESC) when no filters are provided', async () => {
      setupQueryMock(mockDbMentions);

      const result = await repository.findAll({});

      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('3');
      expect(result[2].id).toBe('1');
    });

    it('should respect custom sorting if the base repository allows it', async () => {
      const queryMock = setupQueryMock(mockDbMentions);

      await repository.findAll({});

      expect(queryMock.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });

  describe('Complex Filtering Logic', () => {
    it('should filter by status and return only matching entities', async () => {
      setupQueryMock(mockDbMentions.filter((m) => m.status === MediaStatus.Published));

      const result = await repository.findAll({ statuses: [MediaStatus.Published] });

      expect(result).toHaveLength(2);
      expect(result.every((m) => m.status === MediaStatus.Published)).toBe(true);
      expect(result[0].id).toBe('3');
      expect(result[1].id).toBe('1');
      expect(findMock).toHaveBeenCalledWith({ status: { $in: [MediaStatus.Published] } });
    });

    it('should return empty array when no mentions match multiple filters', async () => {
      setupQueryMock([]);

      const filters = {
        statuses: [MediaStatus.Draft],
        slug: 'slug-1'
      } as MediaMentionFilters;

      const result = await repository.findAll(filters);

      expect(result).toHaveLength(0);
      expect(findMock).toHaveBeenCalledWith({
        $and: [{ status: { $in: [MediaStatus.Draft] } }, { slug: 'slug-1' }]
      });
    });

    it('should handle findPaginated with filtering and custom sort simultaneously', async () => {
      const countMock = jest.fn().mockResolvedValue(2);
      (MockModel as unknown as { countDocuments: jest.Mock }).countDocuments = countMock;

      setupQueryMock(mockDbMentions.filter((m) => m.status === MediaStatus.Published));

      const result = await repository.findPaginated(1, 10, { statuses: [MediaStatus.Published] });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.items[0].id).toBe('3');
      expect(countMock).toHaveBeenCalledWith({ status: { $in: [MediaStatus.Published] } });
    });
  });

  describe('Edge Cases', () => {
    it('should return all items if buildQuery returns empty object for undefined filters', async () => {
      setupQueryMock(mockDbMentions);

      const result = await repository.findAll(undefined);

      expect(findMock).toHaveBeenCalledWith({});
      expect(result).toHaveLength(3);
    });

    it('should correctly map DbMediaMention to MediaMentionEntity via toEntity', async () => {
      setupQueryMock([mockDbMentions[0]]);

      const result = await repository.findAll({});
      const first = result[0];

      expect(first).not.toHaveProperty('_id');
      expect(first).toHaveProperty('id', '1');
      expect(typeof first.id).toBe('string');
    });
  });
});

describe('MediaMentionsRepository Comprehensive Tests', () => {
  const mockId = '65f1a2b3c4d5e6f7a8b9c0d1';

  const createMockDoc = (overrides = {}): DbMediaMention =>
    ({
      _id: { toString: () => mockId },
      url: 'https://example.com',
      adminTitle: 'Test Mention',
      title: { uk: 'Заголовок', en: 'Title' },
      slug: 'test-mention',
      status: MediaStatus.Published,
      coverImage: { src: 'img.jpg', alt: { uk: 'а', en: 'a' }, caption: { uk: '', en: '' } },
      description: { uk: 'Опис', en: 'Desc' },
      keywords: { uk: 'к', en: 'k' },
      allowIndexation: { uk: true, en: true },
      meta: { views: 10 },
      createdAt: '2026-03-10T10:00:00.000Z',
      updatedAt: '2026-03-11T12:00:00.000Z',
      ...overrides
    }) as DbMediaMention;

  const findByIdAndUpdateMock = jest.fn();
  const findByIdMock = jest.fn();
  const findOneMock = jest.fn();
  const findMock = jest.fn();
  const findByIdAndDeleteMock = jest.fn();
  const countDocumentsMock = jest.fn();
  const saveMock = jest.fn();

  const MockModel = jest.fn().mockImplementation(function () {
    return { save: saveMock };
  }) as unknown as jest.Mocked<Model<DbMediaMention>>;

  Object.assign(MockModel, {
    findByIdAndUpdate: findByIdAndUpdateMock,
    findById: findByIdMock,
    findOne: findOneMock,
    find: findMock,
    findByIdAndDelete: findByIdAndDeleteMock,
    countDocuments: countDocumentsMock
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Core Functionality', () => {
    it('should pass default fallback values to model when optional input fields are missing or empty', async () => {
      const repository = MediaMentionsRepository({ MediaMentionsModel: MockModel });
      const minimalInput: CreateMediaMentionInput = {
        url: 'https://test.com',
        adminTitle: 'Minimal',
        title: { uk: 'Укр', en: 'En' },
        slug: 'minimal',
        description: { uk: 'Опис', en: 'Desc' },
        keywords: { uk: 'к', en: 'k' },
        allowIndexation: { uk: true, en: true },
        coverImage: { src: 'i.jpg', alt: { uk: '', en: '' }, caption: { uk: '', en: '' } },
        status: undefined as unknown as MediaStatus
      };

      saveMock.mockResolvedValue({
        toObject: () => createMockDoc({ adminTitle: 'Minimal' })
      });

      const result = await repository.create(minimalInput);

      expect(MockModel).toHaveBeenCalledWith(
        expect.objectContaining({
          publishedAt: '1970-01-01T00:00:00.000Z',
          status: MediaStatus.Draft,
          meta: { views: 0 }
        })
      );
      expect(result.id).toBe(mockId);
    });

    it('should pass explicit input values to model when provided', async () => {
      const repository = MediaMentionsRepository({ MediaMentionsModel: MockModel });
      const fullInput: CreateMediaMentionInput = {
        url: 'https://test.com',
        adminTitle: 'Full',
        title: { uk: 'Укр', en: 'En' },
        slug: 'full',
        description: { uk: 'Опис', en: 'Desc' },
        keywords: { uk: 'к', en: 'k' },
        allowIndexation: { uk: true, en: true },
        coverImage: { src: 'i.jpg', alt: { uk: '', en: '' }, caption: { uk: '', en: '' } },
        publishedAt: '2026-05-12T10:00:00.000Z',
        status: MediaStatus.Published,
        meta: { views: 50 }
      };

      saveMock.mockResolvedValue({
        toObject: () => createMockDoc({ publishedAt: '2026-05-12T10:00:00.000Z' })
      });

      const result = await repository.create(fullInput);

      expect(MockModel).toHaveBeenCalledWith(
        expect.objectContaining({
          publishedAt: '2026-05-12T10:00:00.000Z',
          status: MediaStatus.Published,
          meta: { views: 50 }
        })
      );
      expect(result.publishedAt).toBe('2026-05-12T10:00:00.000Z');
    });

    it('should increment views successfully', async () => {
      const repository = MediaMentionsRepository({ MediaMentionsModel: MockModel });
      const updatedDoc = createMockDoc({ meta: { views: 11 } });
      findByIdAndUpdateMock.mockReturnValue({
        lean: jest.fn().mockResolvedValue(updatedDoc)
      });

      const result = await repository.incrementViews(mockId);
      expect(result?.meta.views).toBe(11);
    });

    it('should return null for incrementViews with invalid ID', async () => {
      const repository = MediaMentionsRepository({ MediaMentionsModel: MockModel });
      const result = await repository.incrementViews('invalid');
      expect(result).toBeNull();
    });

    it('should return null when incrementViews is called with valid ID that does not exist in DB', async () => {
      const repository = MediaMentionsRepository({ MediaMentionsModel: MockModel });
      findByIdAndUpdateMock.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null)
      });

      const result = await repository.incrementViews(mockId);
      expect(result).toBeNull();
    });
  });

  describe('Filtering and Sorting', () => {
    const repository = MediaMentionsRepository({ MediaMentionsModel: MockModel });

    const setupChainMock = (data: unknown[]) => {
      const query: MockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(data)
      };
      findMock.mockReturnValue(query);
      return query;
    };

    it('should filter by status and slug simultaneously', async () => {
      setupChainMock([]);

      const filters = {
        statuses: [MediaStatus.Published],
        slug: 'test-mention'
      } as MediaMentionFilters;

      await repository.findAll(filters);

      expect(findMock).toHaveBeenCalledWith({
        $and: [{ status: { $in: [MediaStatus.Published] } }, { slug: 'test-mention' }]
      });
    });

    it('should apply pagination (limit and skip)', async () => {
      const queryMock = setupChainMock([]);

      const filters = {
        limit: 15,
        skip: 30
      } as MediaMentionFilters;

      await repository.findAll(filters);

      expect(queryMock.limit).toHaveBeenCalledWith(15);
      expect(queryMock.skip).toHaveBeenCalledWith(30);
    });

    it('should use default sort when no sort options are provided', async () => {
      const queryMock = setupChainMock([]);
      await repository.findAll({});

      expect(queryMock.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });

  describe('Paginated Results', () => {
    const repository = MediaMentionsRepository({ MediaMentionsModel: MockModel });

    it('should return paginated items with correct metadata', async () => {
      countDocumentsMock.mockResolvedValue(45);
      const items = [createMockDoc({ slug: 'm1' }), createMockDoc({ slug: 'm2' })];

      findMock.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(items)
      });

      const result = await repository.findPaginated(3, 10, { statuses: [MediaStatus.Published] });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(45);
      expect(result.page).toBe(3);
      expect(result.totalPages).toBe(5);
      expect(countDocumentsMock).toHaveBeenCalledWith({ status: { $in: [MediaStatus.Published] } });
    });
  });

  describe('Base Operations', () => {
    const repository = MediaMentionsRepository({ MediaMentionsModel: MockModel });

    it('should find media mention by slug', async () => {
      findOneMock.mockReturnValue({
        lean: jest.fn().mockResolvedValue(createMockDoc({ slug: 'unique-slug' }))
      });

      const result = await repository.findBySlug('unique-slug');
      expect(findOneMock).toHaveBeenCalledWith({ slug: 'unique-slug' });
      expect(result?.slug).toBe('unique-slug');
    });

    it('should update media mention correctly', async () => {
      findByIdAndUpdateMock.mockReturnValue({
        lean: jest.fn().mockResolvedValue(createMockDoc({ adminTitle: 'Updated' }))
      });

      const result = await repository.update(mockId, { adminTitle: 'Updated' });

      expect(result?.adminTitle).toBe('Updated');
      expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
        mockId,
        expect.objectContaining({ adminTitle: 'Updated' }),
        expect.any(Object)
      );
    });

    it('should delete and return true', async () => {
      findByIdAndDeleteMock.mockResolvedValue(createMockDoc());
      const result = await repository.delete(mockId);
      expect(result).toBe(true);
      expect(findByIdAndDeleteMock).toHaveBeenCalledWith(mockId);
    });

    it('should return null if findById finds nothing', async () => {
      findByIdMock.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null)
      });

      const result = await repository.findById(mockId);
      expect(result).toBeNull();
    });
  });
});
