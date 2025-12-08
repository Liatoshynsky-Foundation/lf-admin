import { PageService } from './pageService';
import { createDotNotationPatch } from '~/application/use-cases/dotNotationPatch/dotNotationPatch';
import { extractImageSrcs } from '~/application/use-cases/extractImageSrc/extractImageSrc';
import { removeTmpFlagsRecursively } from '~/application/use-cases/removeTmpFlags/removeTmpFlags';
import { blobStorageService } from '~/application/use-cases/uploadService/upload';
import { PageStatus } from '~/back-shared/types/enums/common.enums';
import type { Patch } from '~/back-shared/types/pages/types';
import type { BasePage } from '~/domain/entities/Page';
import { PageRepository } from '~/infrastructure/repositories/pageRepository/pageRepository';

jest.mock('~/src/infrastructure/repositories/pageRepository/pageRepository', () => ({
  PageRepository: jest.fn()
}));

jest.mock('~/src/application/use-cases/dotNotationPatch/dotNotationPatch', () => ({
  createDotNotationPatch: jest.fn()
}));

jest.mock('~/src/application/use-cases/extractImageSrc/extractImageSrc', () => ({
  extractImageSrcs: jest.fn()
}));

jest.mock('~/src/application/use-cases/removeTmpFlags/removeTmpFlags', () => ({
  removeTmpFlagsRecursively: jest.fn()
}));

jest.mock('~/src/application/use-cases/uploadService/upload', () => ({
  blobStorageService: jest.fn().mockReturnValue({
    copyBlobsToNewFolder: jest.fn()
  })
}));

const mockedPageRepository = {
  getPublishedBySlug: jest.fn(),
  getDraftBySlug: jest.fn(),
  createDraft: jest.fn(),
  applyPatchToDraft: jest.fn(),
  applyPatchToPublished: jest.fn()
};

(PageRepository as jest.Mock).mockReturnValue(mockedPageRepository);

const mockedCreateDotNotationPatch = createDotNotationPatch as jest.Mock;
const mockedExtractImageSrcs = extractImageSrcs as jest.Mock;
const mockedRemoveTmpFlagsRecursively = removeTmpFlagsRecursively as jest.Mock;
const mockedBlobStorageService = blobStorageService as jest.Mock;
const mockedCopyBlobsToNewFolder = jest.fn();
mockedBlobStorageService.mockReturnValue({ copyBlobsToNewFolder: mockedCopyBlobsToNewFolder });

const createBlocks = (prefix = '') => ({
  IntroSection: {
    title: { uk: `${prefix} Вступ`, en: `${prefix} Introduction` },
    image: {
      src: `https://example.com/${prefix.toLowerCase()}-image.jpg`,
      alt: { uk: `${prefix} Зображення`, en: `${prefix} Image` },
      caption: { uk: `${prefix} Підпис`, en: `${prefix} Caption` }
    },
    quote: {
      text: { uk: `${prefix} Цитата`, en: `${prefix} Quote` },
      source: { uk: `${prefix} Автор`, en: `${prefix} Autor` }
    }
  }
});

const createPage = (status: PageStatus, id: string, prefix = ''): BasePage => ({
  id,
  slug: 'about-us',
  title: { uk: 'Про нас', en: 'About us' },
  status,
  pageType: 'AboutUsPage',
  blocks: createBlocks(prefix),
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-02-01T00:00:00.000Z'
});

describe('PageService', () => {
  const pageService = PageService({ pageRepository: mockedPageRepository });
  const publishedPage = createPage(PageStatus.Published, '507f1f77bcf86cd799439011');
  const draftPage = createPage(PageStatus.Draft, '60b8d6c7f1e7b9a9a9a9a9a9', 'Чернетка');

  beforeEach(() => {
    jest.clearAllMocks();
    mockedRemoveTmpFlagsRecursively.mockImplementation((input) => input);
  });

  describe('getPage', () => {
    it('should return published page by slug', async () => {
      mockedPageRepository.getPublishedBySlug.mockResolvedValueOnce(publishedPage);
      const result = await pageService.getPage('about-us');
      expect(mockedPageRepository.getPublishedBySlug).toHaveBeenCalledWith('about-us');
      expect(result).toEqual(publishedPage);
    });

    it('should return null when published page not found', async () => {
      mockedPageRepository.getPublishedBySlug.mockResolvedValueOnce(null);
      const result = await pageService.getPage('missing');
      expect(mockedPageRepository.getPublishedBySlug).toHaveBeenCalledWith('missing');
      expect(result).toBeNull();
    });
  });

  describe('getPageByStatus', () => {
    it('should return published page when status is Published', async () => {
      mockedPageRepository.getPublishedBySlug.mockResolvedValueOnce(publishedPage);
      const result = await pageService.getPageByStatus('about-us', PageStatus.Published);
      expect(mockedPageRepository.getPublishedBySlug).toHaveBeenCalledWith('about-us');
      expect(result).toEqual(publishedPage);
    });

    it('should return draft page when status is Draft', async () => {
      mockedPageRepository.getDraftBySlug.mockResolvedValueOnce(draftPage);
      const result = await pageService.getPageByStatus('about-us', PageStatus.Draft);
      expect(mockedPageRepository.getDraftBySlug).toHaveBeenCalledWith('about-us');
      expect(result).toEqual(draftPage);
    });

    it('should return null for invalid status', async () => {
      const result = await pageService.getPageByStatus('about-us', 'InvalidStatus' as PageStatus);
      expect(result).toBeNull();
    });
  });

  describe('upsertDraft', () => {
    const patch: Patch = { $set: { 'IntroSection.title.uk': 'Оновлений Вступ' } };

    it('should create new draft when no existing draft exists', async () => {
      const input = { slug: 'about-us', blocks: createBlocks('Новий') };
      mockedPageRepository.getDraftBySlug.mockResolvedValueOnce(null);
      mockedPageRepository.getPublishedBySlug.mockResolvedValueOnce(publishedPage);
      mockedExtractImageSrcs.mockReturnValueOnce(['https://example.com/новий-image.jpg']);
      mockedPageRepository.createDraft.mockResolvedValueOnce({ ...draftPage, blocks: input.blocks });

      const result = await pageService.upsertDraft(input);

      expect(result).toEqual({ ...draftPage, blocks: input.blocks });
    });

    it('should apply patch to existing draft when changes exist', async () => {
      const input = { slug: 'about-us', blocks: createBlocks('Оновлений') };
      mockedPageRepository.getDraftBySlug.mockResolvedValueOnce(draftPage);
      mockedExtractImageSrcs.mockReturnValueOnce(['https://example.com/оновлений-image.jpg']);
      mockedCreateDotNotationPatch.mockReturnValueOnce(patch);
      mockedPageRepository.applyPatchToDraft.mockResolvedValueOnce({ ...draftPage, blocks: input.blocks });

      const result = await pageService.upsertDraft(input);

      expect(mockedPageRepository.applyPatchToDraft).toHaveBeenCalledWith('about-us', patch);
      expect(result).toEqual({ ...draftPage, blocks: input.blocks });
    });

    it('should return existing draft when no changes in patch', async () => {
      const input = { slug: 'about-us', blocks: draftPage.blocks };
      mockedPageRepository.getDraftBySlug.mockResolvedValueOnce(draftPage);
      mockedExtractImageSrcs.mockReturnValueOnce([]);
      mockedCreateDotNotationPatch.mockReturnValueOnce({ $set: {}, $unset: {} });

      const result = await pageService.upsertDraft(input);

      expect(mockedPageRepository.applyPatchToDraft).not.toHaveBeenCalled();
      expect(result).toEqual(draftPage);
    });

    it('should throw when no source (draft or published) exists', async () => {
      const input = { slug: 'missing', blocks: {} };
      mockedPageRepository.getDraftBySlug.mockResolvedValueOnce(null);
      mockedPageRepository.getPublishedBySlug.mockResolvedValueOnce(null);
      mockedExtractImageSrcs.mockReturnValueOnce([]);

      await expect(pageService.upsertDraft(input)).rejects.toThrow(
        'Cannot upsert draft: no source (draft or published) for slug="missing"'
      );
    });
  });

  describe('publishPage', () => {
    const patch: Patch = { $set: { 'IntroSection.title.uk': 'Опублікований Вступ' } };

    it('should publish page with provided blocks', async () => {
      const input = { slug: 'about-us', blocks: createBlocks('Опублікований') };
      mockedPageRepository.getDraftBySlug.mockResolvedValueOnce(null);
      mockedPageRepository.getPublishedBySlug.mockResolvedValueOnce(publishedPage);
      mockedExtractImageSrcs.mockReturnValueOnce(['https://example.com/опублікований-image.jpg']);
      mockedCreateDotNotationPatch.mockReturnValueOnce(patch);
      mockedPageRepository.applyPatchToPublished.mockResolvedValueOnce({ ...publishedPage, blocks: input.blocks });

      const result = await pageService.publishPage(input);

      expect(mockedPageRepository.applyPatchToPublished).toHaveBeenCalledWith(
        'about-us',
        patch,
        publishedPage.title,
        publishedPage.pageType
      );
      expect(result).toEqual({ ...publishedPage, blocks: input.blocks });
    });

    it('should publish page using draft blocks when no blocks provided', async () => {
      const input = { slug: 'about-us' };
      mockedPageRepository.getDraftBySlug.mockResolvedValueOnce(draftPage);
      mockedPageRepository.getPublishedBySlug.mockResolvedValueOnce(publishedPage);
      mockedExtractImageSrcs.mockReturnValueOnce(['https://example.com/чернетка-image.jpg']);
      mockedCreateDotNotationPatch.mockReturnValueOnce(patch);
      mockedPageRepository.applyPatchToPublished.mockResolvedValueOnce({ ...publishedPage, blocks: draftPage.blocks });

      const result = await pageService.publishPage(input);

      expect(mockedCreateDotNotationPatch).toHaveBeenCalledWith(publishedPage.blocks, draftPage.blocks);
      expect(mockedPageRepository.applyPatchToPublished).toHaveBeenCalledWith(
        'about-us',
        patch,
        draftPage.title,
        draftPage.pageType
      );
      expect(result).toEqual({ ...publishedPage, blocks: draftPage.blocks });
    });

    it('should throw when no draft and no blocks provided', async () => {
      const input = { slug: 'missing' };
      mockedPageRepository.getDraftBySlug.mockResolvedValueOnce(null);
      await expect(pageService.publishPage(input)).rejects.toThrow(
        'Cannot publish: Draft not found by slug="missing" and no blocks provided.'
      );
    });
  });
});
