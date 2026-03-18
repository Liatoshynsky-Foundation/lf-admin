import { GraphQLError } from 'graphql';

import { CreateMediaMentionGQLInput, MediaMentionsMutation, UpdateMediaMentionGQLInput } from './mediaMentionMutation';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { MediaMentionEntity } from '~/domain/entities/MediaMentions';
import type { IMediaMentionsRepository } from '~/domain/repositories/mediaMentionsRepository';
import { MediaStatus } from '~/types/enums/common.enums';

jest.mock('~/src/shared/utils/slugGenerator/slugGenerator', () => ({
  generateUniqueSlug: jest.fn((title: string) => Promise.resolve(title.toLowerCase().replaceAll(/\s+/g, '-')))
}));

describe('media-mentions Mutation', () => {
  const mockRepo: jest.Mocked<Partial<IMediaMentionsRepository>> = {
    create: jest.fn(),
    update: jest.fn(),
    findBySlug: jest.fn(),
    delete: jest.fn(),
    incrementViews: jest.fn(),
  };

  const adminContext = {
    admin: true,
    requestContainer: {
      cradle: { mediaMentionsRepository: mockRepo as IMediaMentionsRepository }
    }
  } as unknown as GraphQLContext;

  const createMockEntity = (overrides: Partial<MediaMentionEntity> = {}): MediaMentionEntity => ({
    id: 'mock-id',
    url: 'https://example.com',
    adminTitle: 'Admin Title',
    title: { uk: 'Заголовок', en: 'Title' },
    description: { uk: 'Опис', en: 'Desc' },
    keywords: { uk: 'к', en: 'k' },
    allowIndexation: { uk: true, en: true },
    slug: 'slug-test',
    coverImage: { src: '', alt: { uk: '', en: '' }, caption: { uk: '', en: '' } },
    status: MediaStatus.Published,
    meta: { views: 0 },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    ...overrides
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMediaMention', () => {
    const input: CreateMediaMentionGQLInput = {
      url: 'https://news.com/article',
      adminTitle: 'Test Article',
      title: { uk: 'Тестова стаття', en: 'Test Article' },
      description: { uk: 'Опис', en: 'Desc' },
      keywords: { uk: 'ключі', en: 'keys' },
      allowIndexation: { uk: true, en: true },
      coverImage: { src: 'img.jpg', alt: { uk: '', en: '' }, caption: { uk: '', en: '' } },
      status: MediaStatus.Draft
    };

    it('should generate slug and call repo.create', async () => {
      (mockRepo.findBySlug as jest.Mock).mockResolvedValue(null);
      (mockRepo.create as jest.Mock).mockResolvedValue(createMockEntity({ ...input, id: 'new-id', slug: 'тестова-стаття' }));

      const result = await MediaMentionsMutation.createMediaMention({}, { input }, adminContext);

      expect(result.id).toBe('new-id');
      expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        slug: 'тестова-стаття',
        meta: { views: 0 }
      }));
    });

    it('should throw unauthenticated error if not admin', async () => {
      const context = { admin: false } as unknown as GraphQLContext;
      await expect(MediaMentionsMutation.createMediaMention({}, { input }, context))
        .rejects.toThrow(GraphQLError);
    });

    it('should throw error if title.uk is missing for slug generation', async () => {
      const invalidInput = { ...input, title: { en: 'Only English' } } as CreateMediaMentionGQLInput;
      await expect(MediaMentionsMutation.createMediaMention({}, { input: invalidInput }, adminContext))
        .rejects.toThrow('Title is required for slug generation');
    });
  });

  describe('updateMediaMention', () => {
    const id = 'existing-id';
    const updateInput: UpdateMediaMentionGQLInput = {
      title: { uk: 'Оновлений заголовок', en: 'Updated Title' }
    };

    it('should update slug when title changes', async () => {
      (mockRepo.findBySlug as jest.Mock).mockResolvedValue(null);
      (mockRepo.update as jest.Mock).mockResolvedValue(createMockEntity({ id, slug: 'оновлений-заголовок' }));

      const result = await MediaMentionsMutation.updateMediaMention({}, { id, input: updateInput }, adminContext);

      expect(result.slug).toBe('оновлений-заголовок');
      expect(mockRepo.update).toHaveBeenCalledWith(id, expect.objectContaining({
        slug: 'оновлений-заголовок'
      }));
    });

    it('should throw error if entity not found', async () => {
      (mockRepo.update as jest.Mock).mockResolvedValue(null);

      await expect(MediaMentionsMutation.updateMediaMention({}, { id, input: updateInput }, adminContext))
        .rejects.toThrow(GraphQLError);
    });
  });

  describe('endpoint handlers', () => {
    it('deleteMediaMention: should call repo.delete', async () => {
      (mockRepo.delete as jest.Mock).mockResolvedValue(true);

      const result = await MediaMentionsMutation.deleteMediaMention({}, { id: '1' }, adminContext);

      expect(result).toBe(true);
      expect(mockRepo.delete).toHaveBeenCalledWith('1');
    });

    it('addMediaMentionView: should call repo.addView', async () => {
      const mockEntity = createMockEntity({ id: '1', meta: { views: 1 } });
      (mockRepo.incrementViews as jest.Mock).mockResolvedValue(mockEntity);

      const result = await MediaMentionsMutation.addMediaMentionView({}, { id: '1' }, adminContext);

      expect(result!.meta.views).toBe(1);
      expect(mockRepo.incrementViews).toHaveBeenCalledWith('1');
    });
  });
});