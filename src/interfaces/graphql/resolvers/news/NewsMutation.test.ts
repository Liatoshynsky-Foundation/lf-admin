import { GraphQLError } from 'graphql';

import { CreateNewsGQLInput, NewsMutation, UpdateNewsGQLInput } from './NewsMutation';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import type { News } from '~/domain/entities/News';
import type { NewsRepository } from '~/src/domain/repositories/newsRepository';
import { NewsStatus } from '~/types/enums/common.enums';

jest.mock('./processNewsContent/processNewsContent', () => ({
  processNewsContent: jest.fn(<T>(input: T): Promise<T> => Promise.resolve(input)),
}));

jest.mock('~/src/shared/utils/slugGenerator/slugGenerator', () => ({
  generateUniqueSlug: jest.fn((title: string) =>
    Promise.resolve(`slug-${title.toLowerCase()}`)
  ),
}));

describe('NewsMutation Resolvers', () => {
  const mockRepo: jest.Mocked<Partial<NewsRepository>> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    incrementViews: jest.fn()
  };

  const createContainer = (admin: boolean) => ({
    admin,
    requestContainer: { cradle: { newsRepository: mockRepo as NewsRepository } }
  } as unknown as GraphQLContext);

  const adminContext = createContainer(true);
  const userContext = createContainer(false);

  const baseInput: CreateNewsGQLInput = {
    adminTitle: 'Test News',
    title: { uk: 'Новина', en: 'News' },
    description: { uk: 'Опис', en: 'Desc' },
    keywords: { uk: 'к', en: 'k' },
    allowIndexation: { uk: true, en: true },
    content: { uk: { blocks: [] }, en: { blocks: [] } } as News['content'],
    coverImage: { src: '', alt: { uk: '', en: '' }, caption: { uk: '', en: '' } },
    status: NewsStatus.Draft
  };

  const createMockNews = (overrides: Partial<News> = {}): News => ({
    id: '1',
    ...baseInput,
    slug: 'slug',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    meta: { views: 0 },
    ...overrides
  });

  const mockAction = <T>(method: keyof typeof mockRepo, value: T) =>
    (mockRepo[method] as jest.Mock).mockResolvedValue(value);

  beforeEach(() => jest.clearAllMocks());

  describe('Security & Validation', () => {
    it('should throw GraphQLError if user is not admin', async () => {
      await expect(NewsMutation.createNews({}, { input: baseInput }, userContext))
        .rejects.toThrow(GraphQLError);
    });

    it('should throw error if title is empty (required for slug)', async () => {
      const invalidInput = { ...baseInput, title: { uk: '' } };
      await expect(NewsMutation.createNews({}, { input: invalidInput }, adminContext))
        .rejects.toThrow();
    });
  });

  describe('createNews', () => {
    it('should successfully create news with generated slug', async () => {
      mockAction('findBySlug', null);
      mockAction('create', createMockNews({ id: 'new-id', slug: 'slug-новина' }));

      const result = await NewsMutation.createNews({}, { input: baseInput }, adminContext);

      expect(result.id).toBe('new-id');
      expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ slug: 'slug-новина' }));
    });
  });

  describe('updateNews', () => {
    const id = 'news-123';

    it('should update title and re-generate slug', async () => {
      const updateInput: UpdateNewsGQLInput = { title: { uk: 'Оновлено', en: 'Updated' } };
      mockAction('findById', createMockNews({ id }));
      mockAction('update', createMockNews({ id, slug: 'slug-оновлено' }));

      const result = await NewsMutation.updateNews({}, { id, input: updateInput }, adminContext);

      expect(mockRepo.update).toHaveBeenCalledWith(id, expect.objectContaining({ slug: 'slug-оновлено' }));
      expect(result.slug).toBe('slug-оновлено');
    });

    it('should throw if news not found during slug update', async () => {
      mockAction('findById', null);
      await expect(NewsMutation.updateNews({}, { id, input: { title: { uk: 'Т' } } }, adminContext))
        .rejects.toThrow();
    });

    it('should not call findById if title is not being updated', async () => {
      const contentInput: UpdateNewsGQLInput = { description: { uk: 'New' } };
      mockAction('update', createMockNews({ id, ...contentInput }));

      await NewsMutation.updateNews({}, { id, input: contentInput }, adminContext);

      expect(mockRepo.findById).not.toHaveBeenCalled();
      expect(mockRepo.update).toHaveBeenCalled();
    });
  });

  describe('Repository Passthrough Operations', () => {
    it('deleteNews: should call delete and return boolean', async () => {
      mockAction('delete', true);
      const result = await NewsMutation.deleteNews({}, { id: '1' }, adminContext);
      expect(result).toBe(true);
      expect(mockRepo.delete).toHaveBeenCalledWith('1');
    });

    it('incrementNewsViews: should call incrementViews', async () => {
      const news = createMockNews({ id: '1', meta: { views: 5 } });
      mockAction('incrementViews', news);

      const result = await NewsMutation.incrementNewsViews({}, { id: '1' }, adminContext);
      expect(result.meta.views).toBe(5);
    });
  });
});