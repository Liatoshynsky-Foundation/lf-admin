import { GraphQLError } from 'graphql';

import { CreateMediaMentionGQLInput, MediaMentionsMutation, UpdateMediaMentionGQLInput } from './mediaMentionMutation';
import { MediaMentionEntity } from '~/domain/entities/MediaMentions';
import type { IMediaMentionsRepository } from '~/domain/repositories/mediaMentionsRepository';
import { createMockContext } from '~/interfaces/graphql/resolvers/testUtils';
import { MediaStatus } from '~/types/enums/common.enums';

jest.mock('mongoose');

import * as helpers from '../helpers';

jest.mock('../helpers', () => ({
  ...jest.requireActual('../helpers'),
  syncImagesCrops: jest.fn()
}));

jest.mock('~/src/shared/utils/slugGenerator/slugGenerator', () => ({
  generateUniqueSlug: jest.fn(async (title: string, options?: { checkExists?: (slug: string) => Promise<boolean> }) => {
    const slug = title.toLowerCase().replaceAll(/\s+/g, '-');
    if (options?.checkExists) {
      await options.checkExists(slug);
    }
    return slug;
  })
}));

describe('media-mentions Mutation', () => {
  const mockRepo: jest.Mocked<Partial<IMediaMentionsRepository>> = {
    create: jest.fn(),
    update: jest.fn(),
    findBySlug: jest.fn(),
    delete: jest.fn(),
    incrementViews: jest.fn()
  };

  const adminContext = createMockContext(true, 'mediaMentionsRepository', mockRepo);

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
      coverImage: {
        src: 'img.jpg',
        alt: { uk: '', en: '' },
        caption: { uk: '', en: '' },
        crop: { x: 0, y: 0, width: 100, height: 100 }
      },
      status: MediaStatus.Draft
    };

    it('should generate slug and call repo.create and sync crops using unified helper', async () => {
      (mockRepo.findBySlug as jest.Mock).mockResolvedValue(null);
      (mockRepo.create as jest.Mock).mockResolvedValue(createMockEntity({ id: 'new-id', slug: 'тестова-стаття' }));

      const result = await MediaMentionsMutation.createMediaMention({}, { input }, adminContext);

      expect(result.id).toBe('new-id');
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'тестова-стаття',
          meta: { views: 0 }
        })
      );
      expect(helpers.syncImagesCrops).toHaveBeenCalledWith('new-id', input.coverImage, { isCoverImage: true });
    });

    it('should throw unauthenticated error if not admin', async () => {
      const context = createMockContext(false, 'mediaMentionsRepository', mockRepo);
      await expect(MediaMentionsMutation.createMediaMention({}, { input }, context)).rejects.toThrow(GraphQLError);
    });

    it('should throw error if title.uk is missing for slug generation', async () => {
      const invalidInput = { ...input, title: { en: 'Only English' } } as unknown as CreateMediaMentionGQLInput;
      await expect(MediaMentionsMutation.createMediaMention({}, { input: invalidInput }, adminContext)).rejects.toThrow(
        'Title is required for slug generation'
      );
    });

    it('should default to Draft status when status is omitted', async () => {
      const inputWithoutStatus = { ...input, status: undefined };
      (mockRepo.findBySlug as jest.Mock).mockResolvedValue(null);
      (mockRepo.create as jest.Mock).mockResolvedValue(createMockEntity({ id: 'new-id' }));

      await MediaMentionsMutation.createMediaMention({}, { input: inputWithoutStatus }, adminContext);

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: MediaStatus.Draft
        })
      );
    });
  });

  describe('updateMediaMention', () => {
    const id = 'existing-id';
    const updateInput: UpdateMediaMentionGQLInput = {
      title: { uk: 'Оновлений заголовок', en: 'Updated Title' },
      coverImage: {
        src: 'updated.jpg',
        alt: { uk: '', en: '' },
        caption: { uk: '', en: '' },
        crop: { x: 5, y: 5, width: 90, height: 90 }
      }
    };

    it('should update slug and sync crops when title/image changes', async () => {
      (mockRepo.findBySlug as jest.Mock).mockResolvedValue(null);
      (mockRepo.update as jest.Mock).mockResolvedValue(createMockEntity({ id, slug: 'оновлений-заголовок' }));

      const result = await MediaMentionsMutation.updateMediaMention({}, { id, input: updateInput }, adminContext);

      expect(result.slug).toBe('оновлений-заголовок');
      expect(mockRepo.update).toHaveBeenCalledWith(
        id,
        expect.objectContaining({
          slug: 'оновлений-заголовок'
        })
      );
      expect(helpers.syncImagesCrops).toHaveBeenCalledWith(id, updateInput.coverImage, { isCoverImage: true });
    });

    it('should throw error if entity not found', async () => {
      (mockRepo.update as jest.Mock).mockResolvedValue(null);

      await expect(
        MediaMentionsMutation.updateMediaMention({}, { id, input: updateInput }, adminContext)
      ).rejects.toThrow(GraphQLError);
    });

    it('should throw unauthenticated error if not admin', async () => {
      const context = createMockContext(false, 'mediaMentionsRepository', mockRepo);
      await expect(MediaMentionsMutation.updateMediaMention({}, { id, input: updateInput }, context)).rejects.toThrow(
        GraphQLError
      );
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
