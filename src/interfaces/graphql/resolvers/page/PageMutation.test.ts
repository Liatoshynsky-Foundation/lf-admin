import { GraphQLError } from 'graphql';

import * as helpers from '../helpers';
import { PageMutation } from './PageMutation';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import type { BasePage } from '~/domain/entities/Page';
import type { PageRepository } from '~/src/domain/repositories/pageRepository';
import { DEFAULT_COVER_IMAGE } from '~/src/infrastructure/repositories/pageRepository/pageRepository.test';
import type { BlockData } from '~/store/types';
import { PageCategories, PageStatus } from '~/types/enums/common.enums';
import { Scalars } from '~/types/graphql/generated/graphql';

jest.mock('mongoose', () => ({
  Types: {
    ObjectId: jest.fn().mockImplementation(() => ({
      toString: () => 'mocked-object-id'
    }))
  }
}));

jest.mock('../helpers', () => ({
  ...jest.requireActual('../helpers'),
  syncImagesCrops: jest.fn()
}));

jest.mock('~/infrastructure/models/imageCrop.model', () => ({
  ImageCropModel: {
    findOneAndUpdate: jest.fn()
  }
}));

describe('PageMutation', () => {
  const mockRepo: jest.Mocked<PageRepository> = {
    getDraftBySlug: jest.fn(),
    getPublishedBySlug: jest.fn(),
    createDraft: jest.fn(),
    applyPatchToDraft: jest.fn(),
    applyPatchToPublished: jest.fn(),
    findPages: jest.fn(),
    updatePageSeo: jest.fn()
  };

  const mockContext = {
    admin: true,
    requestContainer: { cradle: { pageRepository: mockRepo } }
  } as unknown as GraphQLContext;

  const mockBasePage: BasePage = {
    id: '1',
    slug: 's',
    title: { uk: 'Т', en: 'T' },
    status: PageStatus.Published,
    pageType: 'AboutUsPage',
    category: PageCategories.Foundation,
    coverImage: DEFAULT_COVER_IMAGE,
    blocks: {},
    description: { uk: '', en: '' },
    keywords: { uk: '', en: '' },
    allowIndexation: { uk: true, en: true },
    blocksOrder: ['block-1'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('upsertPageDraft', () => {
    it('should throw UNAUTHENTICATED if not admin', async () => {
      const emptyContext = { admin: false } as unknown as GraphQLContext;
      await expect(
        PageMutation.upsertPageDraft({}, { input: { slug: 's', blocks: {}, blocksOrder: [] } }, emptyContext)
      ).rejects.toThrow(GraphQLError);
    });

    it('should throw if draft blocks are missing', async () => {
      await expect(
        PageMutation.upsertPageDraft(
          {},
          { input: { slug: 's', blocks: null as unknown as Scalars['JSON']['input'], blocksOrder: [] } },
          mockContext
        )
      ).rejects.toThrow(GraphQLError);
    });

    it('should throw if neither draft nor published source exists', async () => {
      mockRepo.getDraftBySlug.mockResolvedValue(null);
      mockRepo.getPublishedBySlug.mockResolvedValue(null);

      await expect(
        PageMutation.upsertPageDraft({}, { input: { slug: 'missing', blocks: {}, blocksOrder: [] } }, mockContext)
      ).rejects.toThrow(/no source \(draft or published\)/);
    });

    it('should create a new draft if one does not exist', async () => {
      const blocks = mockBasePage.blocks as unknown as Scalars['JSON']['input'];

      mockRepo.getDraftBySlug.mockResolvedValue(null);
      mockRepo.getPublishedBySlug.mockResolvedValue(mockBasePage);
      mockRepo.createDraft.mockResolvedValue(mockBasePage);

      await PageMutation.upsertPageDraft({}, { input: { slug: 's', blocks, blocksOrder: [] } }, mockContext);

      expect(mockRepo.createDraft).toHaveBeenCalledWith('s', expect.anything(), [], mockBasePage);
    });

    it('should clean tmp flags and sync crops when crop data is present', async () => {
      const crop = { x: 10, y: 10, width: 50, height: 50 };
      const blocks = {
        FoundationInfo: {
          image: { src: 'photo.jpg', isTmp: true, crop }
        }
      } as unknown as Scalars['JSON']['input'];

      mockRepo.getDraftBySlug.mockResolvedValue(mockBasePage);
      mockRepo.applyPatchToDraft.mockResolvedValue({
        ...mockBasePage,
        blocks: blocks as unknown as Record<string, BlockData>
      });

      await PageMutation.upsertPageDraft({}, { input: { slug: 's', blocks, blocksOrder: [] } }, mockContext);

      expect(JSON.stringify(mockRepo.applyPatchToDraft.mock.calls[0][2])).toContain('"isTmp":false');
      expect(helpers.syncImagesCrops).toHaveBeenCalledWith(mockBasePage.id, blocks);
    });

    it('should return the existing draft when blocks and order are unchanged', async () => {
      const blocks = {} as Scalars['JSON']['input'];
      const existingDraft: BasePage = { ...mockBasePage, blocks: {}, blocksOrder: ['block-1'] };

      mockRepo.getDraftBySlug.mockResolvedValue(existingDraft);

      const result = await PageMutation.upsertPageDraft(
        {},
        { input: { slug: 's', blocks, blocksOrder: ['block-1'] } },
        mockContext
      );

      expect(result).toBe(existingDraft);
      expect(mockRepo.applyPatchToDraft).not.toHaveBeenCalled();
      expect(helpers.syncImagesCrops).toHaveBeenCalledWith(existingDraft.id, blocks);
    });

    it('should apply patch when blocks order has changed even if blocks are identical', async () => {
      const existingDraft: BasePage = { ...mockBasePage, blocks: {}, blocksOrder: ['block-1'] };

      mockRepo.getDraftBySlug.mockResolvedValue(existingDraft);
      mockRepo.applyPatchToDraft.mockResolvedValue(existingDraft);

      await PageMutation.upsertPageDraft(
        {},
        { input: { slug: 's', blocks: {}, blocksOrder: ['block-2'] } },
        mockContext
      );

      expect(mockRepo.applyPatchToDraft).toHaveBeenCalled();
    });

    it('should fallback to empty object if existingDraft.blocks or cleanedBlocks is falsy', async () => {
      const existingDraftWithNullBlocks: BasePage = {
        ...mockBasePage,
        blocks: null as unknown as Record<string, BlockData>,
        blocksOrder: ['block-1']
      };

      mockRepo.getDraftBySlug.mockResolvedValue(existingDraftWithNullBlocks);

      await PageMutation.upsertPageDraft(
        {},
        { input: { slug: 's', blocks: false as unknown as Scalars['JSON']['input'], blocksOrder: ['block-1'] } },
        mockContext
      );

      expect(mockRepo.getDraftBySlug).toHaveBeenCalledWith('s');
    });
  });

  describe('publishPage', () => {
    it('should throw UNAUTHENTICATED if not admin', async () => {
      const emptyContext = { admin: false } as unknown as GraphQLContext;

      await expect(
        PageMutation.publishPage({}, { input: { slug: 's', blocks: {}, blocksOrder: [] } }, emptyContext)
      ).rejects.toThrow(GraphQLError);
    });

    it('should throw when no draft exists and blocks are not provided', async () => {
      mockRepo.getDraftBySlug.mockResolvedValue(null);

      await expect(
        PageMutation.publishPage({}, { input: { slug: 'missing', blocksOrder: [] } }, mockContext)
      ).rejects.toThrow(/Draft not found/);
    });

    it('should clean tmp flags and sync crops during publication', async () => {
      const crop = { x: 1, y: 1, width: 1, height: 1 };
      const blocks = {
        IntroSection: {
          title: { uk: '', en: '' },
          image: { src: 'new.jpg', isTmp: true, crop },
          quote: { text: { uk: '', en: '' }, author: '' }
        }
      } as unknown as Scalars['JSON']['input'];

      mockRepo.getPublishedBySlug.mockResolvedValue(mockBasePage);
      mockRepo.getDraftBySlug.mockResolvedValue(mockBasePage);
      mockRepo.applyPatchToPublished.mockResolvedValue({
        ...mockBasePage,
        blocks: blocks as unknown as Record<string, BlockData>
      });

      await PageMutation.publishPage({}, { input: { slug: 'test', blocks, blocksOrder: [] } }, mockContext);

      expect(JSON.stringify(mockRepo.applyPatchToPublished.mock.calls[0][1])).toContain('"isTmp":false');
      expect(helpers.syncImagesCrops).toHaveBeenCalledWith(mockBasePage.id, blocks);
    });

    it('should use draft blocks if no blocks are provided in the input', async () => {
      const draftBlocks = {
        WhatWeDo: {
          title: { uk: '', en: '' },
          items: [{ title: { uk: '', en: '' }, description: { uk: {}, en: {} } }]
        }
      } as unknown as Record<string, BlockData>;

      mockRepo.getDraftBySlug.mockResolvedValue({ ...mockBasePage, blocks: draftBlocks });
      mockRepo.getPublishedBySlug.mockResolvedValue(null);
      mockRepo.applyPatchToPublished.mockResolvedValue({ ...mockBasePage, blocks: draftBlocks });

      await PageMutation.publishPage({}, { input: { slug: 'test', blocksOrder: [] } }, mockContext);

      expect(mockRepo.applyPatchToPublished).toHaveBeenCalled();
      expect(helpers.syncImagesCrops).toHaveBeenCalledWith(mockBasePage.id, draftBlocks);
    });

    it('should fallback to empty object if cleanedBlocks is falsy in publishPage', async () => {
      mockRepo.getPublishedBySlug.mockResolvedValue(mockBasePage);
      mockRepo.getDraftBySlug.mockResolvedValue(mockBasePage);
      mockRepo.applyPatchToPublished.mockResolvedValue(mockBasePage);

      await PageMutation.publishPage(
        {},
        { input: { slug: 's', blocks: null as unknown as Scalars['JSON']['input'], blocksOrder: [] } },
        mockContext
      );

      expect(mockRepo.applyPatchToPublished).toHaveBeenCalled();
    });

    it('should throw an error if title is missing', async () => {
      mockRepo.getPublishedBySlug.mockResolvedValue(null);
      mockRepo.getDraftBySlug.mockResolvedValue({
        ...mockBasePage,
        title: undefined as unknown as { uk: string; en: string },
        pageType: 'AboutUsPage'
      });

      await expect(
        PageMutation.publishPage({}, { input: { slug: 'unknown', blocks: {}, blocksOrder: [] } }, mockContext)
      ).rejects.toThrow('Cannot upsert draft: no source (draft or published) for slug="unknown"');
    });

    it('should throw an error if pageType is missing', async () => {
      mockRepo.getPublishedBySlug.mockResolvedValue(null);
      mockRepo.getDraftBySlug.mockResolvedValue({
        ...mockBasePage,
        title: { uk: 'Title', en: 'Title' },
        pageType: undefined as unknown as string
      });

      await expect(
        PageMutation.publishPage({}, { input: { slug: 'unknown', blocks: {}, blocksOrder: [] } }, mockContext)
      ).rejects.toThrow('Cannot upsert draft: no source (draft or published) for slug="unknown"');
    });
  });

  describe('updatePageSeo', () => {
    const seoInput = {
      slug: 'about-us',
      title: { uk: 'SEO Заголовок', en: 'SEO Title' },
      description: { uk: 'SEO Опис', en: 'SEO Description' },
      keywords: { uk: 'ключові слова', en: 'keywords' },
      canonicalUrl: { uk: 'https://example.com/uk', en: 'https://example.com/en' },
      allowIndexation: { uk: false, en: true }
    };

    it('should throw UNAUTHENTICATED if not admin', async () => {
      const emptyContext = { admin: false } as unknown as GraphQLContext;

      await expect(PageMutation.updatePageSeo({}, { input: seoInput }, emptyContext)).rejects.toThrow(GraphQLError);
    });

    it('should call repo.updatePageSeo and return the updated page', async () => {
      const updatedPage = {
        ...mockBasePage,
        title: seoInput.title,
        description: seoInput.description,
        keywords: seoInput.keywords,
        canonicalUrl: seoInput.canonicalUrl,
        allowIndexation: seoInput.allowIndexation
      };

      mockRepo.updatePageSeo.mockResolvedValue(updatedPage);

      const res = await PageMutation.updatePageSeo({}, { input: seoInput }, mockContext);

      expect(mockRepo.updatePageSeo).toHaveBeenCalledWith('about-us', seoInput);
      expect(res).toEqual(updatedPage);
    });
  });
});
