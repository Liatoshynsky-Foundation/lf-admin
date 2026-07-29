import { GraphQLError } from 'graphql';

import { createMockContext } from './testUtils';
import { LocalizedImage } from '~/domain/entities/BaseContent';
import { ImageCropModel } from '~/infrastructure/models/imageCrop.model';
import { SortByDate, SortOrder } from '~/types/enums/common.enums';

jest.mock('mongoose');
jest.mock('~/infrastructure/models/imageCrop.model');

import {
  endpointRepositoryHandler,
  extractTitleForSlug,
  mapFilters,
  markImagesAsUsed,
  processSlugUpdate,
  syncImagesCrops
} from './helpers';

describe('endpointRepositoryHandler', () => {
  const fakeRepo = {
    findById: jest.fn().mockResolvedValue({ id: '1' })
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw GraphQLError when admin is falsy', async () => {
    const handler = endpointRepositoryHandler('mediaMentionsRepository')<Record<string, never>, unknown>(async ({
      repo
    }) => {
      return (repo as unknown as typeof fakeRepo).findById('1');
    });

    const context = createMockContext(false, 'mediaMentionsRepository', fakeRepo);

    await expect(handler({}, {}, context)).rejects.toThrow(GraphQLError);
  });

  it('should call handler and return value when admin is true', async () => {
    interface Args {
      id: string;
    }
    interface Result {
      id: string;
    }

    const handler = endpointRepositoryHandler('mediaMentionsRepository')<Args, Result>(async ({ args, repo }) => {
      return (repo as unknown as typeof fakeRepo).findById(args.id);
    });

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
      statuses: ['published'],
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

  it('should filter out null or empty statuses and languages', () => {
    const input = {
      statuses: [null, 'published', ''],
      languages: [null, 'uk', ''],
      search: 'search-term'
    };

    const result = mapFilters(input);

    expect(result).toEqual({
      statuses: ['published'],
      languages: ['uk'],
      slug: undefined,
      search: 'search-term',
      limit: undefined,
      skip: undefined,
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
      expect(extractTitleForSlug(123)).toBe('');
    });
  });

  describe('processSlugUpdate', () => {
    it('should update slug property in updateData when slug is unique', async () => {
      const repo = { findBySlug: jest.fn().mockResolvedValue(null) };
      const updateData: { slug?: string } = {};

      await processSlugUpdate('123', 'Новий заголовок', repo, updateData);

      expect(updateData.slug).toBeDefined();
      expect(repo.findBySlug).toHaveBeenCalled();
    });

    it('should allow same slug if entity ID matches', async () => {
      const repo = { findBySlug: jest.fn().mockResolvedValue({ id: '123' }) };
      const updateData: { slug?: string } = {};

      await processSlugUpdate('123', 'Заголовок', repo, updateData);

      expect(updateData.slug).toBeDefined();
    });

    it('should handle conflict when another entity has the slug then resolves with suffix', async () => {
      const repo = {
        findBySlug: jest.fn().mockResolvedValueOnce({ id: '999' }).mockResolvedValueOnce(null)
      };
      const updateData: { slug?: string } = {};

      await processSlugUpdate('123', 'Заголовок', repo, updateData);

      expect(updateData.slug).toBeDefined();
    });

    it('should handle null id and existing entity conflict in processSlugUpdate', async () => {
      const repo = {
        findBySlug: jest.fn().mockResolvedValueOnce({ id: 'existing-id' }).mockResolvedValueOnce(null)
      };
      const updateData: { slug?: string } = {};

      await processSlugUpdate(null, 'Заголовок', repo, updateData);

      expect(updateData.slug).toBeDefined();
    });

    it('should not update slug if title is missing', async () => {
      const repo = { findBySlug: jest.fn() };
      const updateData: { slug?: string } = {};
      await processSlugUpdate('123', null, repo, updateData);
      expect(updateData.slug).toBeUndefined();
    });
  });
});

describe('Synchronization Helpers', () => {
  const contentId = 'test-id';

  beforeEach(() => jest.clearAllMocks());

  describe('syncImagesCrops - Cover Image mode', () => {
    it('should call findOneAndUpdate for both locales if crop exists in cover image', async () => {
      const image: LocalizedImage = {
        src: 'test.jpg',
        alt: { uk: 'опис', en: 'alt' },
        crop: { x: 1, y: 2, width: 3, height: 4 }
      };

      await syncImagesCrops(contentId, image, { locale: 'uk', isCoverImage: true });

      expect(ImageCropModel.findOneAndUpdate).toHaveBeenCalledTimes(2);

      expect(ImageCropModel.findOneAndUpdate).toHaveBeenCalledWith(
        { pageId: contentId, cropId: 'coverImage', locale: 'uk' },
        {
          $set: {
            crop: image.crop,
            pageId: contentId,
            cropId: 'coverImage',
            locale: 'uk'
          }
        },
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
        expect.objectContaining({ $set: expect.objectContaining({ cropId: 'custom-id' }) }),
        expect.anything()
      );
    });

    it('should return localizedCrop when present on cover image with crop property', async () => {
      const image = {
        src: 'https://example.com/cover.jpg',
        crop: { x: 0, y: 0, width: 10, height: 10 },
        localizedCrop: {
          uk: { x: 5, y: 5, width: 50, height: 50 },
          en: { x: 10, y: 10, width: 60, height: 60 }
        }
      } as unknown as LocalizedImage;

      await syncImagesCrops(contentId, image, { isCoverImage: true });

      expect(ImageCropModel.findOneAndUpdate).toHaveBeenCalledWith(
        { pageId: contentId, cropId: 'coverImage', locale: 'uk' },
        expect.objectContaining({ $set: expect.objectContaining({ crop: { x: 5, y: 5, width: 50, height: 50 } }) }),
        expect.anything()
      );
      expect(ImageCropModel.findOneAndUpdate).toHaveBeenCalledWith(
        { pageId: contentId, cropId: 'coverImage', locale: 'en' },
        expect.objectContaining({ $set: expect.objectContaining({ crop: { x: 10, y: 10, width: 60, height: 60 } }) }),
        expect.anything()
      );
    });

    it('should handle field-level localized crop and skip locale when crop is null', async () => {
      const imageWithFieldLevelLocalizedCrop = {
        src: 'https://example.com/cover.jpg',
        alt: { uk: '', en: '' },
        crop: {
          uk: { x: 1, y: 1, width: 10, height: 10 },
          en: null
        }
      } as unknown as LocalizedImage;

      await syncImagesCrops(contentId, imageWithFieldLevelLocalizedCrop, { isCoverImage: true });

      expect(ImageCropModel.findOneAndUpdate).toHaveBeenCalledTimes(1);
      expect(ImageCropModel.findOneAndUpdate).toHaveBeenCalledWith(
        { pageId: contentId, cropId: 'coverImage', locale: 'uk' },
        expect.anything(),
        expect.anything()
      );
    });

    it('should return null when crop is non-object primitive', async () => {
      const image = {
        src: 'https://example.com/cover.jpg',
        crop: 'not-an-object'
      } as unknown as LocalizedImage;

      await syncImagesCrops(contentId, image, { isCoverImage: true });

      expect(ImageCropModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('should return null when crop is invalid object', async () => {
      const imageWithInvalidCrop = {
        src: 'invalid-url',
        alt: { uk: '', en: '' },
        crop: { x: 'invalid' }
      } as unknown as LocalizedImage;

      await syncImagesCrops(contentId, imageWithInvalidCrop, { isCoverImage: true });

      expect(ImageCropModel.findOneAndUpdate).not.toHaveBeenCalled();
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
    it('should recursively find and sync multiple images using default options', async () => {
      const content = {
        blocks: [
          {
            type: 'image',
            src: 'https://example.com/img1.jpg',
            crop: { x: 0, y: 0, width: 10, height: 10 }
          }
        ]
      };

      await syncImagesCrops(contentId, content);

      expect(ImageCropModel.findOneAndUpdate).toHaveBeenCalledTimes(1);
      expect(ImageCropModel.findOneAndUpdate).toHaveBeenCalledWith(
        { pageId: contentId, cropId: 'img1.jpg', locale: 'uk' },
        {
          $set: {
            crop: content.blocks[0].crop,
            pageId: contentId,
            cropId: 'img1.jpg',
            locale: 'uk'
          }
        },
        { upsert: true, new: true }
      );
    });

    it('should fallback cropId to src string if URL parsing fails', async () => {
      const content = {
        blocks: [
          {
            type: 'image',
            src: 'invalid-url-string',
            crop: { x: 1, y: 1, width: 5, height: 5 }
          }
        ]
      };

      await syncImagesCrops(contentId, content);

      expect(ImageCropModel.findOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ cropId: 'invalid-url-string' }),
        expect.anything(),
        expect.anything()
      );
    });

    it('should continue content crop loop if item crop is missing', async () => {
      const content = {
        blocks: [
          { type: 'image', src: 'http://example.com/no-crop.jpg', crop: null },
          { type: 'image', src: 'http://example.com/with-crop.jpg', crop: { x: 1, y: 1, width: 5, height: 5 } }
        ]
      };

      await syncImagesCrops(contentId, content, { locale: 'uk', isCoverImage: false });

      expect(ImageCropModel.findOneAndUpdate).toHaveBeenCalledTimes(1);
      expect(ImageCropModel.findOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ cropId: 'with-crop.jpg' }),
        expect.anything(),
        expect.anything()
      );
    });
  });
});

describe('markImagesAsUsed', () => {
  it('should extract http srcs from nested content arrays and coverImage and mark them as used', async () => {
    const mockUsageRepo = {
      addUsageRef: jest.fn().mockResolvedValue(undefined)
    };

    const content = {
      uk: {
        gallery: [{ src: 'http://example.com/uk-img1.jpg' }, { src: 'http://example.com/uk-img2.jpg' }],
        primitiveValue: 'some-string'
      },
      en: {
        image: { src: 'http://example.com/en-img.jpg' },
        nonHttpSrc: { src: 'relative/path.jpg' }
      }
    };

    const coverImage = { src: 'http://example.com/cover.jpg' };

    await markImagesAsUsed(mockUsageRepo, content, coverImage, 'page-1', 'block-1');

    expect(mockUsageRepo.addUsageRef).toHaveBeenCalledWith('http://example.com/uk-img1.jpg', {
      pageId: 'page-1',
      blockId: 'block-1',
      locale: 'uk'
    });
    expect(mockUsageRepo.addUsageRef).toHaveBeenCalledWith('http://example.com/uk-img2.jpg', {
      pageId: 'page-1',
      blockId: 'block-1',
      locale: 'uk'
    });
    expect(mockUsageRepo.addUsageRef).toHaveBeenCalledWith('http://example.com/en-img.jpg', {
      pageId: 'page-1',
      blockId: 'block-1',
      locale: 'en'
    });
    expect(mockUsageRepo.addUsageRef).toHaveBeenCalledWith('http://example.com/cover.jpg', {
      pageId: 'page-1',
      blockId: 'block-1',
      locale: 'uk'
    });
    expect(mockUsageRepo.addUsageRef).toHaveBeenCalledWith('http://example.com/cover.jpg', {
      pageId: 'page-1',
      blockId: 'block-1',
      locale: 'en'
    });
  });

  it('should handle null or non-http content and coverImage gracefully', async () => {
    const mockUsageRepo = {
      addUsageRef: jest.fn().mockResolvedValue(undefined)
    };

    await markImagesAsUsed(mockUsageRepo, null, { src: 'relative/path.jpg' }, 'page-1', 'block-1');

    expect(mockUsageRepo.addUsageRef).not.toHaveBeenCalled();
  });
});
