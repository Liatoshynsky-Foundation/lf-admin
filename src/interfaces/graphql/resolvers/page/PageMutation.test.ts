import { GraphQLError } from 'graphql';

import * as helpers from '../helpers';
import { PageMutation } from './PageMutation';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import type { BasePage } from '~/domain/entities/Page';
import type { PageRepository } from '~/src/domain/repositories/pageRepository';
import { DEFAULT_COVER_IMAGE } from '~/src/infrastructure/repositories/pageRepository/pageRepository.test';
import { PageCategories, PageStatus } from '~/types/enums/common.enums';
import {Scalars} from '~/types/graphql/generated/graphql';

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

const mockCopyBlobs = jest.fn().mockResolvedValue(undefined);
jest.mock('~/src/application/use-cases/uploadService/upload', () => ({
  blobStorageService: () => ({
    copyBlobsToNewFolder: mockCopyBlobs
  })
}));

describe('PageMutation', () => {
  const mockRepo: jest.Mocked<PageRepository> = {
    getDraftBySlug: jest.fn(),
    getPublishedBySlug: jest.fn(),
    createDraft: jest.fn(),
    applyPatchToDraft: jest.fn(),
    applyPatchToPublished: jest.fn(),
    findPages: jest.fn()
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
        PageMutation.upsertPageDraft({}, { input: { slug: 's', blocks: {} } }, emptyContext)
      ).rejects.toThrow(GraphQLError);
    });

    it('should create a new draft if one does not exist', async () => {
      const blocks = (mockBasePage.blocks as unknown) as import('~/types/graphql/generated/graphql').Scalars['JSON']['input'];

      mockRepo.getDraftBySlug.mockResolvedValue(null);
      mockRepo.getPublishedBySlug.mockResolvedValue(mockBasePage);
      mockRepo.createDraft.mockResolvedValue(mockBasePage);

      await PageMutation.upsertPageDraft({}, { input: { slug: 's', blocks } }, mockContext);

      expect(mockRepo.createDraft).toHaveBeenCalledWith('s', expect.anything(), mockBasePage);
    });

    it('should call syncImagesCrops and copy blobs when crop data is present', async () => {
      const crop = { x: 10, y: 10, width: 50, height: 50 };
      const blocks = ({
        FoundationInfo: {
          image: { src: 'photo.jpg', isTmp: true, crop }
        }
      } as unknown) as Scalars['JSON']['input'];

      mockRepo.getDraftBySlug.mockResolvedValue(mockBasePage);
      mockRepo.applyPatchToDraft.mockResolvedValue({ ...mockBasePage, blocks: (blocks as unknown) as Record<string, any> });

      await PageMutation.upsertPageDraft({}, { input: { slug: 's', blocks } }, mockContext);

      expect(mockCopyBlobs).toHaveBeenCalledWith('tmp', 'photos', ['photo.jpg']);
      expect(helpers.syncImagesCrops).toHaveBeenCalledWith(mockBasePage.id, blocks);
    });
  });

  describe('publishPage', () => {
    it('should copy blobs and sync crops during publication', async () => {
      const crop = { x: 1, y: 1, width: 1, height: 1 };
      const blocks = ({
        IntroSection: {
          title: { uk: '', en: '' },
          image: { src: 'new.jpg', isTmp: true, crop },
          quote: { text: { uk: '', en: '' }, author: '' }
        }
      } as unknown) as Scalars['JSON']['input'];

      mockRepo.getPublishedBySlug.mockResolvedValue(mockBasePage);
      mockRepo.getDraftBySlug.mockResolvedValue(mockBasePage);
      mockRepo.applyPatchToPublished.mockResolvedValue({ ...mockBasePage, blocks: (blocks as unknown) as Record<string, import('~/store/types').BlockData> });

      await PageMutation.publishPage({}, { input: { slug: 'test', blocks } }, mockContext);

      expect(mockCopyBlobs).toHaveBeenCalledWith('tmp', 'photos', ['new.jpg']);
      expect(helpers.syncImagesCrops).toHaveBeenCalledWith(mockBasePage.id, blocks);
    });

    it('should use draft blocks if no blocks are provided in the input', async () => {
      const draftBlocks = ({
        WhatWeDo: {
          title: { uk: '', en: '' },
          items: [{ title: { uk: '', en: '' }, description: { uk: {}, en: {} } }]
        }
      } as unknown) as Record<string, import('~/store/types').BlockData>;

      mockRepo.getDraftBySlug.mockResolvedValue({ ...mockBasePage, blocks: draftBlocks });
      mockRepo.getPublishedBySlug.mockResolvedValue(null);
      mockRepo.applyPatchToPublished.mockResolvedValue({ ...mockBasePage, blocks: draftBlocks });

      await PageMutation.publishPage({}, { input: { slug: 'test' } }, mockContext);

      expect(mockRepo.applyPatchToPublished).toHaveBeenCalled();
      expect(helpers.syncImagesCrops).toHaveBeenCalledWith(mockBasePage.id, draftBlocks);
    });

    it('should throw an error if no source metadata is found for title or pageType', async () => {
      mockRepo.getPublishedBySlug.mockResolvedValue(null);
      mockRepo.getDraftBySlug.mockResolvedValue(null);

      await expect(
        PageMutation.publishPage({}, { input: { slug: 'unknown', blocks: {} } }, mockContext)
      ).rejects.toThrow(/no source \(draft or published\)/);
    });
  });
});
