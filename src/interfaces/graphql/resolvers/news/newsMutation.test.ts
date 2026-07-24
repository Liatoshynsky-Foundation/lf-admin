import { CreateNewsGQLInput, NewsMutation, UpdateNewsGQLInput } from './newsMutation';
import type { News } from '~/domain/entities/News';
import { createMockContext } from '~/interfaces/graphql/resolvers/testUtils';
import { newsServiceErrors } from '~/src/constants/errors';
import { INewsRepository } from '~/src/domain/repositories/newsRepository';
import { NewsStatus } from '~/types/enums/common.enums';

jest.mock('mongoose');

import * as helpers from '../helpers';

jest.mock('./processNewsContent/processNewsContent', () => ({
  processNewsContent: jest.fn(<T>(input: T): Promise<T> => Promise.resolve(input))
}));

jest.mock('~/src/shared/utils/slugGenerator/slugGenerator', () => ({
  generateUniqueSlug: jest.fn((title: string) => Promise.resolve(`slug-${title.toLowerCase()}`))
}));

jest.mock('../helpers', () => ({
  ...jest.requireActual('../helpers'),
  syncImagesCrops: jest.fn(),
  extractTitleForSlug: jest.fn((title) => title?.uk || title?.en || ''),
  processSlugUpdate: jest.fn((id, title, repo, updateData) => {
    updateData.slug = 'slug-оновлено';
    return Promise.resolve();
  }),
  markImagesAsUsed: jest.fn()
}));

describe('NewsMutation Resolvers', () => {
  const mockRepo: jest.Mocked<Partial<INewsRepository>> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    incrementViews: jest.fn()
  };

  const id = 'news-123';
  const adminContext = createMockContext(true, 'newsRepository', mockRepo);
  const userContext = createMockContext(false, 'newsRepository', mockRepo);

  const baseInput: CreateNewsGQLInput = {
    adminTitle: 'Test News',
    title: { uk: 'Новина', en: 'News' },
    description: { uk: 'Опис', en: 'Desc' },
    keywords: { uk: 'к', en: 'k' },
    allowIndexation: { uk: true, en: true },
    content: { uk: { blocks: [] }, en: { blocks: [] } } as News['content'],
    coverImage: {
      src: 'test.jpg',
      alt: { uk: '', en: '' },
      caption: { uk: '', en: '' },
      crop: { x: 0, y: 0, width: 100, height: 100 }
    },
    status: NewsStatus.Draft
  };

  const createMockNews = (overrides: Partial<News> = {}): News => {
    const base = {
      id: '1',
      ...baseInput,
      slug: 'slug',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      meta: { views: 0 },
      status: NewsStatus.Published,
      content: { uk: { blocks: [] }, en: { blocks: [] } },
      newsDate: '2024-01-01'
    };

    return { ...base, ...overrides } as News;
  };

  const mockAction = <T>(method: keyof typeof mockRepo, value: T) =>
    (mockRepo[method] as jest.Mock).mockResolvedValue(value);

  beforeEach(() => jest.clearAllMocks());

  describe('Security & Validation', () => {
    it('should throw TITLE_REQUIRED_FOR_SLUG if title is empty', async () => {
      const invalidInput = { ...baseInput, title: { uk: '', en: '' } };
      await expect(NewsMutation.createNews({}, { input: invalidInput }, adminContext)).rejects.toThrow(
        newsServiceErrors.TITLE_REQUIRED_FOR_SLUG
      );
    });

    it('should throw TITLE_REQUIRED_FOR_SLUG if title uk is missing (via partial object)', async () => {
      const invalidInput = { ...baseInput, title: { uk: '' } } as unknown as CreateNewsGQLInput;
      await expect(NewsMutation.createNews({}, { input: invalidInput }, adminContext)).rejects.toThrow(
        newsServiceErrors.TITLE_REQUIRED_FOR_SLUG
      );
    });

    it('should throw TITLE_TOO_SHORT_FOR_SLUG if title has fewer than 2 characters', async () => {
      const invalidInput = { ...baseInput, title: { uk: 'Т', en: 'T' } };
      await expect(NewsMutation.createNews({}, { input: invalidInput }, adminContext)).rejects.toThrow(
        newsServiceErrors.TITLE_TOO_SHORT_FOR_SLUG
      );
    });

    it('should throw TITLE_TOO_LONG_FOR_SLUG if title.uk exceeds 150 characters (lf-manual-tests#469)', async () => {
      const invalidInput = { ...baseInput, title: { uk: 'а'.repeat(151), en: 'Valid title' } };
      await expect(NewsMutation.createNews({}, { input: invalidInput }, adminContext)).rejects.toThrow(
        newsServiceErrors.TITLE_TOO_LONG_FOR_SLUG
      );
    });

    it('should throw TITLE_TOO_LONG_FOR_SLUG if title.en exceeds 150 characters (lf-manual-tests#469)', async () => {
      const invalidInput = { ...baseInput, title: { uk: 'Валідний заголовок', en: 'a'.repeat(151) } };
      await expect(NewsMutation.createNews({}, { input: invalidInput }, adminContext)).rejects.toThrow(
        newsServiceErrors.TITLE_TOO_LONG_FOR_SLUG
      );
    });

    it('should accept a title exactly 150 characters long', async () => {
      mockAction('findBySlug', null);
      mockAction('create', createMockNews({ id: 'new-id' }));
      const validInput = { ...baseInput, title: { uk: 'а'.repeat(150), en: 'a'.repeat(150) } };

      await expect(NewsMutation.createNews({}, { input: validInput }, adminContext)).resolves.toBeDefined();
      expect(mockRepo.create).toHaveBeenCalled();
    });

    it('should throw GraphQLError for createNews if user is unauthenticated', async () => {
      await expect(NewsMutation.createNews({}, { input: baseInput }, userContext)).rejects.toThrow();
    });

    it('should throw GraphQLError for updateNews if user is unauthenticated', async () => {
      await expect(NewsMutation.updateNews({}, { id: '1', input: {} }, userContext)).rejects.toThrow();
    });
  });

  describe('createNews', () => {
    it('should successfully create news and call unified syncImagesCrops', async () => {
      mockAction('findBySlug', null);
      mockAction('create', createMockNews({ id: 'new-id', slug: 'slug-новина' }));

      const result = await NewsMutation.createNews({}, { input: baseInput }, adminContext);

      expect(result.id).toBe('new-id');
      expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ slug: 'slug-новина' }));
      expect(helpers.syncImagesCrops).toHaveBeenCalledWith('new-id', baseInput.coverImage, { isCoverImage: true });
      expect(helpers.syncImagesCrops).toHaveBeenCalledWith('new-id', baseInput.content);
    });

    it('should use NewsStatus.Draft as default status if status field is completely omitted', async () => {
      const { status: _status, ...inputWithoutStatus } = baseInput;
      mockAction('findBySlug', null);
      mockAction('create', createMockNews({ id: 'default-id' }));

      await NewsMutation.createNews({}, { input: inputWithoutStatus as CreateNewsGQLInput }, adminContext);

      expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ status: NewsStatus.Draft }));
    });
  });

  describe('updateNews', () => {
    it('should update title, re-generate slug and sync crops', async () => {
      const updateInput: UpdateNewsGQLInput = {
        title: { uk: 'Оновлено', en: 'Updated' },
        coverImage: { ...baseInput.coverImage, src: 'new.jpg' },
        content: { uk: { blocks: [{ type: 'image' }] }, en: { blocks: [] } } as News['content']
      };
      mockAction('findById', createMockNews({ id }));
      mockAction('update', createMockNews({ id, slug: 'slug-оновлено' }));

      const result = await NewsMutation.updateNews({}, { id, input: updateInput }, adminContext);

      expect(mockRepo.update).toHaveBeenCalledWith(id, expect.objectContaining({ slug: 'slug-оновлено' }));
      expect(result.slug).toBe('slug-оновлено');
      expect(helpers.syncImagesCrops).toHaveBeenCalledWith(id, updateInput.coverImage, { isCoverImage: true });
      expect(helpers.syncImagesCrops).toHaveBeenCalledWith(id, updateInput.content);
    });

    it('should throw TITLE_REQUIRED_FOR_SLUG if updated title is empty', async () => {
      mockAction('findById', createMockNews({ id }));

      await expect(
        NewsMutation.updateNews({}, { id, input: { title: { uk: '', en: '' } } }, adminContext)
      ).rejects.toThrow(newsServiceErrors.TITLE_REQUIRED_FOR_SLUG);

      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('should throw TITLE_TOO_SHORT_FOR_SLUG if updated title has fewer than 2 characters', async () => {
      mockAction('findById', createMockNews({ id }));

      await expect(
        NewsMutation.updateNews({}, { id, input: { title: { uk: 'Т', en: 'T' } } }, adminContext)
      ).rejects.toThrow(newsServiceErrors.TITLE_TOO_SHORT_FOR_SLUG);

      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('should throw TITLE_TOO_LONG_FOR_SLUG if updated title.uk exceeds 150 characters (lf-manual-tests#469)', async () => {
      mockAction('findById', createMockNews({ id }));

      await expect(
        NewsMutation.updateNews({}, { id, input: { title: { uk: 'а'.repeat(151), en: 'Valid title' } } }, adminContext)
      ).rejects.toThrow(newsServiceErrors.TITLE_TOO_LONG_FOR_SLUG);

      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('should fall back to empty content object structure during processContentFields execution if content property is missing', async () => {
      const updateInputWithoutContent: UpdateNewsGQLInput = {
        description: { uk: 'New Description', en: 'New Desc' }
      };
      mockAction('findById', createMockNews({ id }));
      mockAction('update', createMockNews({ id }));

      await NewsMutation.updateNews({}, { id, input: updateInputWithoutContent }, adminContext);

      expect(mockRepo.update).toHaveBeenCalled();
    });

    it('should throw if news not found during slug update', async () => {
      mockAction('findById', null);
      const expectedError = newsServiceErrors.NEWS_NOT_FOUND(id);

      await expect(
        NewsMutation.updateNews({}, { id, input: { title: { uk: 'Т', en: 'E' } } }, adminContext)
      ).rejects.toThrow(expectedError);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
    });

    it('should throw GraphQLError immediately if news is not found at all, even without title updates', async () => {
      mockAction('findById', null);
      const expectedError = newsServiceErrors.NEWS_NOT_FOUND(id);

      await expect(
        NewsMutation.updateNews(
          {},
          { id, input: { description: { uk: 'New Description', en: 'New Desc' } } },
          adminContext
        )
      ).rejects.toThrow(expectedError);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
    });

    it('should throw GraphQLError if the target repository update result resolves to empty falsy values', async () => {
      mockAction('findById', createMockNews({ id }));
      mockAction('update', null);

      await expect(
        NewsMutation.updateNews({}, { id, input: { description: { uk: 'Test', en: 'Test' } } }, adminContext)
      ).rejects.toThrow();
    });

    it('should call findById for existence check but not for slug update if title is missing', async () => {
      const contentInput: UpdateNewsGQLInput = {
        description: { uk: 'New', en: 'New' }
      };

      mockAction('findById', createMockNews({ id }));
      mockAction('update', createMockNews({ id, ...contentInput }));

      await NewsMutation.updateNews({}, { id, input: contentInput }, adminContext);

      expect(mockRepo.findById).toHaveBeenCalledTimes(1);
      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(mockRepo.findBySlug).not.toHaveBeenCalled();
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
      expect(result!.meta.views).toBe(5);
    });
  });
});
