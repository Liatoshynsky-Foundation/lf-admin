import { Model } from 'mongoose';

import {DbNews, NewsRepository} from './newsRepository';
import { News } from '~/domain/entities/News';
import {CreateNewsInput, INewsRepository} from '~/domain/repositories/newsRepository';
import { NewsStatus, SortByDate, SortOrder } from '~/types/enums/common.enums';

jest.mock('mongoose', () => ({
  Schema: jest.fn(),
  model: jest.fn(),
  Types: {
    ObjectId: {
      isValid: (id: string) => /^[0-9a-fA-F]{24}$/.test(id)
    }
  }
}));

jest.mock('~/src/infrastructure/db/connect', () => jest.fn());

interface DbNewsMock extends Omit<News, 'id'> {
  _id: { toString: () => string };
}

interface MockQuery {
  sort: jest.Mock;
  skip: jest.Mock;
  limit: jest.Mock;
  lean: jest.Mock;
}

describe('NewsRepository - Advanced Filtering Logic', () => {
  const mockDbNewsExtended: DbNews[] = [
    { _id: { toString: () => '1' }, adminTitle: 'C News', status: NewsStatus.Published, slug: 'news-c', createdAt: '2024-01-01' },
    { _id: { toString: () => '2' }, adminTitle: 'A News', status: NewsStatus.Draft, slug: 'news-a', createdAt: '2024-01-05' },
    { _id: { toString: () => '3' }, adminTitle: 'B News', status: NewsStatus.Published, slug: 'news-b', createdAt: '2024-01-03' },
  ] as unknown as DbNews[];

  const findMock = jest.fn();
  const MockModel = { find: findMock } as unknown as Model<News>;
  const repository = NewsRepository({ NewsModel: MockModel });

  const setupAdvancedMock = (data: DbNews[]) => {
    const queryBuilder = {
      state: { data: [...data], sort: {} as Record<string, number> },
      sort: jest.fn().mockImplementation(function(this: typeof queryBuilder, sortObj: Record<string, number>) {
        this.state.sort = sortObj;
        return this;
      }),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockImplementation(async function(this: typeof queryBuilder) {
        const result = [...this.state.data];
        if (Object.keys(this.state.sort).length > 0) {
          result.sort((a, b) => {
            for (const [field, order] of Object.entries(this.state.sort)) {
              const valA = (a as unknown as Record<string, string | number>)[field];
              const valB = (b as unknown as Record<string, string | number>)[field];

              if (valA === valB) continue;

              if (valA > valB) return order;
              if (valA < valB) return -order;
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

  it('should filter by status and maintain default sorting (createdAt DESC)', async () => {
    findMock.mockImplementation((conditions: Record<string, unknown>) => {
      const filtered = mockDbNewsExtended.filter(n => n.status === conditions.status);
      return setupAdvancedMock(filtered);
    });

    const result = await repository.findAll({ status: NewsStatus.Published });

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('3');
    expect(result[1].id).toBe('1');
  });

  it('should return empty array when slug and status criteria do not match any document', async () => {
    findMock.mockImplementation((conditions: Record<string, unknown>) => {
      const filtered = mockDbNewsExtended.filter(n =>
        n.status === conditions.status && n.slug === conditions.slug
      );
      return setupAdvancedMock(filtered);
    });

    const result = await repository.findAll({
      status: NewsStatus.Published,
      slug: 'news-a'
    });

    expect(result).toHaveLength(0);
  });

  it('should handle complex multiple sort fields after filtering', async () => {
    findMock.mockImplementation(() => setupAdvancedMock(mockDbNewsExtended));

    const result = await repository.findAll({
      sort: [
        { sortBy: 'status', sortOrder: SortOrder.Asc },
        { sortBy: 'adminTitle', sortOrder: SortOrder.Asc }
      ]
    });

    expect(result[0].adminTitle).toBe('A News');
    expect(result[1].adminTitle).toBe('B News');
    expect(result[2].adminTitle).toBe('C News');
  });
});

describe('NewsRepository Comprehensive Tests', () => {
  const mockId = '65eddf5e2f1a2b3c4d5e6f7a';

  const createMockNewsDoc = (overrides: Partial<DbNewsMock> = {}): DbNewsMock => ({
    _id: { toString: () => mockId },
    adminTitle: 'Test News',
    title: { uk: 'Заголовок', en: 'Title' },
    slug: 'test-news',
    content: { uk: { blocks: [] }, en: { blocks: [] } } as News['content'],
    status: NewsStatus.Published,
    coverImage: { src: 'img.jpg', alt: { uk: 'а', en: 'a' }, caption: { uk: '', en: '' } },
    description: { uk: 'Опис', en: 'Desc' },
    keywords: { uk: 'к', en: 'k' },
    allowIndexation: { uk: true, en: true },
    meta: { views: 10 },
    createdAt: '2026-03-10T10:00:00.000Z',
    updatedAt: '2026-03-11T12:00:00.000Z',
    ...overrides
  });

  const findByIdAndUpdateMock = jest.fn();
  const findByIdMock = jest.fn();
  const findOneMock = jest.fn();
  const findMock = jest.fn();
  const findByIdAndDeleteMock = jest.fn();
  const countDocumentsMock = jest.fn();
  const saveMock = jest.fn();

  const MockModel = jest.fn().mockImplementation(() => ({
    save: saveMock
  })) as unknown as Model<News> & {
    findByIdAndUpdate: jest.Mock;
    findById: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
    findByIdAndDelete: jest.Mock;
    countDocuments: jest.Mock;
  };

  Object.assign(MockModel, {
    findByIdAndUpdate: findByIdAndUpdateMock,
    findById: findByIdMock,
    findOne: findOneMock,
    find: findMock,
    findByIdAndDelete: findByIdAndDeleteMock,
    countDocuments: countDocumentsMock
  });

  let repository: INewsRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = NewsRepository({
      NewsModel: MockModel
    });
  });

  describe('Core Functionality', () => {
    it('should create news and return populated entity', async () => {
      const input: CreateNewsInput = {
        adminTitle: 'New News',
        title: { uk: 'Укр', en: 'En' },
        slug: 'new-news',
        content: { uk: { blocks: [] }, en: { blocks: [] } } as News['content'],
        status: NewsStatus.Draft,
        coverImage: { src: 'i.jpg', alt: { uk: 'а', en: 'a' }, caption: { uk: '', en: '' } },
        description: { uk: 'Опис', en: 'Desc' },
        keywords: { uk: 'к', en: 'k' },
        allowIndexation: { uk: true, en: true }
      };

      saveMock.mockResolvedValue({
        toObject: () => createMockNewsDoc({ adminTitle: 'New News' })
      });

      const result = await repository.create(input);

      expect(result.adminTitle).toBe('New News');
      expect(result.id).toBe(mockId);
      expect(saveMock).toHaveBeenCalled();
    });

    it('should increment views successfully', async () => {
      findByIdAndUpdateMock.mockReturnValue({
        lean: jest.fn().mockResolvedValue(createMockNewsDoc({ meta: { views: 11 } }))
      });

      const result = await repository.incrementViews(mockId);
      expect(result?.meta.views).toBe(11);
      expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
        mockId,
        { $inc: { 'meta.views': 1 } },
        { new: true }
      );
    });

    it('should return null for incrementViews with invalid ID format', async () => {
      const result = await repository.incrementViews('invalid-id');
      expect(result).toBeNull();
      expect(findByIdAndUpdateMock).not.toHaveBeenCalled();
    });
  });

  describe('Filtering and Sorting', () => {
    const setupChainMock = (data: DbNewsMock[]): MockQuery => {
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
      setupChainMock([createMockNewsDoc()]);

      await repository.findAll({
        status: NewsStatus.Published,
        slug: 'test-news'
      });

      expect(findMock).toHaveBeenCalledWith({
        status: NewsStatus.Published,
        slug: 'test-news'
      });
    });

    it('should apply complex sorting (multiple fields)', async () => {
      const queryMock = setupChainMock([]);

      await repository.findAll({
        sort: [
          { sortBy: SortByDate.PublishedAt, sortOrder: SortOrder.Desc },
          { sortBy: SortByDate.AdminTitle, sortOrder: SortOrder.Asc }
        ]
      });

      expect(queryMock.sort).toHaveBeenCalledWith({
        publishedAt: -1,
        adminTitle: 1
      });
    });

    it('should apply pagination (limit and skip)', async () => {
      const queryMock = setupChainMock([]);

      await repository.findAll({
        limit: 20,
        skip: 40
      });

      expect(queryMock.limit).toHaveBeenCalledWith(20);
      expect(queryMock.skip).toHaveBeenCalledWith(40);
    });

    it('should use default sort when no sort is provided', async () => {
      const queryMock = setupChainMock([]);
      await repository.findAll({});

      expect(queryMock.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });

  describe('Pagination', () => {
    it('should return paginated results with correct metadata', async () => {
      countDocumentsMock.mockResolvedValue(25);

      const items = [createMockNewsDoc({ slug: 'n1' }), createMockNewsDoc({ slug: 'n2' })];
      findMock.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(items)
      });

      const result = await repository.findPaginated(2, 10, { status: NewsStatus.Published });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(25);
      expect(result.page).toBe(2);
      expect(result.totalPages).toBe(3);
    });
  });

  describe('Base Operations', () => {
    it('should find news by slug', async () => {
      findOneMock.mockReturnValue({
        lean: jest.fn().mockResolvedValue(createMockNewsDoc({ slug: 'unique-slug' }))
      });

      const result = await repository.findBySlug('unique-slug');
      expect(findOneMock).toHaveBeenCalledWith({ slug: 'unique-slug' });
      expect(result?.slug).toBe('unique-slug');
    });

    it('should update news correctly', async () => {
      findByIdAndUpdateMock.mockReturnValue({
        lean: jest.fn().mockResolvedValue(createMockNewsDoc({ adminTitle: 'Updated Title' }))
      });

      const result = await repository.update(mockId, { adminTitle: 'Updated Title' });

      expect(result?.adminTitle).toBe('Updated Title');
      expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
        mockId,
        expect.objectContaining({ adminTitle: 'Updated Title' }),
        expect.any(Object)
      );
    });

    it('should delete news and return true', async () => {
      findByIdAndDeleteMock.mockResolvedValue(createMockNewsDoc());
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

    it('should return 0 when counting news with no results', async () => {
      countDocumentsMock.mockResolvedValue(0);
      const count = await repository.count({ status: NewsStatus.Archived });
      expect(count).toBe(0);
      expect(countDocumentsMock).toHaveBeenCalledWith({ status: NewsStatus.Archived });
    });
  });
});