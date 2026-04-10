import { GraphQLError } from 'graphql';

import { createMockContext } from './testUtils';

jest.mock('mongoose');
jest.mock('~/infrastructure/models/imageCrop.model');

import {
  endpointRepositoryHandler,
  extractTitleForSlug,
  mapFilters,
  processSlugUpdate, syncImagesCrops,
} from './helpers';
import { LocalizedImage } from '~/domain/entities/BaseContent';
import { ImageCropModel } from '~/infrastructure/models/imageCrop.model';
import { SortByDate, SortOrder } from '~/types/enums/common.enums';

describe('endpointRepositoryHandler', () => {
  const fakeRepo = {
    findById: jest.fn().mockResolvedValue({ id: '1' })
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw GraphQLError when admin is falsy', async () => {
    const handler = endpointRepositoryHandler('mediaMentionsRepository')<Record<string, never>, unknown>(
      async ({ repo }) => {
        return (repo as unknown as typeof fakeRepo).findById('1');
      }
    );

    const context = createMockContext(false, 'mediaMentionsRepository', fakeRepo);

    await expect(handler({}, {}, context)).rejects.toThrow(GraphQLError);
  });

  it('should call handler and return value when admin is true', async () => {
    interface Args { id: string }
    interface Result { id: string }

    const handler = endpointRepositoryHandler('mediaMentionsRepository')<Args, Result>(
      async ({ args, repo }) => {
        return (repo as unknown as typeof fakeRepo).findById(args.id);
      }
    );

    const context = createMockContext(true, 'mediaMentionsRepository', fakeRepo);
    const res = await handler({}, { id: '1' }, context);

    expect(res).toEqual({ id: '1' });
    expect(fakeRepo.findById).toHaveBeenCalledWith('1');
  });
});

describe('mapFilters', () => {
  it('should return undefined if filters are not provided', () => {
    expect(mapFilters()).toBeUndefined();
    expect(mapFilters(null)).toBeUndefined();
  });

  it('should correctly map basic filter fields', () => {
    const input = {
      status: 'published',
      slug: 'test-slug',
      limit: 10,
      skip: 0
    };

    const result = mapFilters(input);

    expect(result).toEqual({
      statuses: ['published'],
      slug: 'test-slug',
      limit: 10,
      skip: 0,
      sort: undefined
    });
  });

  it('should correctly map sorting fields', () => {
    const input = {
      sort: [
        { field: 'createdAt', order: 'desc' },
        { field: 'adminTitle', order: 'asc' }
      ]
    };

    const result = mapFilters(input);

    expect(result?.sort).toEqual([
      { sortBy: SortByDate.CreatedAt, sortOrder: SortOrder.Desc },
      { sortBy: SortByDate.AdminTitle, sortOrder: SortOrder.Asc }
    ]);
  });
});

describe('Slug Helpers', () => {
  describe('extractTitleForSlug', () => {
    it('should extract uk title from localized object', () => {
      expect(extractTitleForSlug({ uk: 'Привіт', en: 'Hello' })).toBe('Привіт');
    });

    it('should return the string if title is already a string', () => {
      expect(extractTitleForSlug('Звичайна назва')).toBe('Звичайна назва');
    });

    it('should return empty string for invalid inputs', () => {
      expect(extractTitleForSlug(null)).toBe('');
      expect(extractTitleForSlug({})).toBe('');
    });
  });

  describe('processSlugUpdate', () => {
    const mockRepo = {
      findBySlug: jest.fn()
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should update slug property in updateData', async () => {
      mockRepo.findBySlug.mockResolvedValue(null);
      const updateData: { slug?: string } = {};

      await processSlugUpdate('123', 'Новий заголовок', mockRepo, updateData);

      expect(updateData.slug).toBeDefined();
      expect(typeof updateData.slug).toBe('string');
      expect(mockRepo.findBySlug).toHaveBeenCalled();
    });

    it('should not update slug if title is missing', async () => {
      const updateData: { slug?: string } = {};
      await processSlugUpdate('123', null, mockRepo, updateData);
      expect(updateData.slug).toBeUndefined();
    });
  });
});

describe('Synchronization Helpers', () => {
  const contentId = 'test-id';

  beforeEach(() => jest.clearAllMocks());

  describe('syncImagesCrops - Cover Image mode', () => {
    it('should call findOneAndUpdate if crop exists in cover image', async () => {
      const image: LocalizedImage = {
        src: 'test.jpg',
        alt: { uk: 'опис', en: 'alt' },
        crop: { x: 1, y: 2, width: 3, height: 4 }
      };

      await syncImagesCrops(contentId, image, { locale: 'uk', isCoverImage: true });

      expect(ImageCropModel.findOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ pageId: contentId, cropId: 'coverImage', locale: 'uk' }),
        expect.objectContaining({ crop: image.crop }),
        { upsert: true, new: true }
      );
    });

    it('should use cropIdPrefix if provided', async () => {
      const image: LocalizedImage = {
        src: 'test.jpg',
        alt: { uk: '', en: '' },
        crop: { x: 1, y: 1, width: 1, height: 1 }
      };

      await syncImagesCrops(contentId, image, { isCoverImage: true, cropIdPrefix: 'custom-id' });

      expect(ImageCropModel.findOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ cropId: 'custom-id' }),
        expect.anything(),
        expect.anything()
      );
    });

    it('should not call findOneAndUpdate if crop is missing in cover image', async () => {
      const imageWithoutCrop: LocalizedImage = {
        src: '1.jpg',
        alt: { uk: '', en: '' }
      };

      await syncImagesCrops(contentId, imageWithoutCrop, { isCoverImage: true });
      expect(ImageCropModel.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe('syncImagesCrops - Content mode', () => {
    it('should recursively find and sync multiple images in content object', async () => {
      const content = {
        blocks: [
          {
            type: 'image',
            src: 'img1.jpg',
            crop: { x: 0, y: 0, width: 10, height: 10 }
          },
          {
            type: 'text',
            value: 'hello'
          },
          {
            type: 'image',
            src: 'img2.jpg',
            crop: { x: 1, y: 1, width: 5, height: 5 }
          }
        ]
      };

      await syncImagesCrops(contentId, content, { locale: 'en', isCoverImage: false });

      expect(ImageCropModel.findOneAndUpdate).toHaveBeenCalledTimes(2);
      expect(ImageCropModel.findOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ pageId: contentId, cropId: 'img1.jpg', locale: 'en' }),
        expect.objectContaining({ crop: content.blocks[0].crop }),
        { upsert: true, new: true }
      );
      expect(ImageCropModel.findOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ pageId: contentId, cropId: 'img2.jpg', locale: 'en' }),
        expect.objectContaining({ crop: content.blocks[2].crop }),
        { upsert: true, new: true }
      );
    });

    it('should not call findOneAndUpdate if no images with crop are found', async () => {
      const contentWithoutCrops = {
        text: 'just some text',
        image: { src: 'no-crop.jpg' }
      };

      await syncImagesCrops(contentId, contentWithoutCrops, { isCoverImage: false });
      expect(ImageCropModel.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });
});