import { PageService } from './pageService';
import { createDotNotationPatch } from '~/application/use-cases/dotNotationPatch/dotNotationPatch';
import { extractImageSrcs } from '~/application/use-cases/extractImageSrc/extractImageSrc';
import { removeTmpFlagsRecursively } from '~/application/use-cases/removeTmpFlags/removeTmpFlags';
import { blobStorageService } from '~/application/use-cases/uploadService/upload';
import type { Patch } from '~/back-shared/types/pages/types';
import type { BasePage } from '~/domain/entities/Page';
import { PageRepository } from '~/infrastructure/repositories/pageRepository/pageRepository';
import { PageStatus } from '~/types/enums/common.enums';

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

describe('PageService', () => {
  const pageService = PageService({ pageRepository: mockedPageRepository });

  const _id = '507f1f77bcf86cd799439011';
  const createdAt = '2024-01-01T00:00:00.000Z';
  const updatedAt = '2024-02-01T00:00:00.000Z';

  const publishedPage: BasePage = {
    id: _id,
    slug: 'about-us',
    title: { uk: 'Про нас', en: 'About us' },
    status: PageStatus.Published,
    pageType: 'AboutUsPage',
    blocks: {
      IntroSection: {
        title: { uk: 'Вступ', en: 'Introduction' },
        image: {
          src: 'https://example.com/image.jpg',
          alt: { uk: 'Зображення', en: 'Image' },
          caption: { uk: 'Підпис до зображення', en: 'Image caption' }
        },
        quote: { text: { uk: 'Цитата', en: 'Quote' }, source: { uk: 'Автор', en: 'Autor' } }
      }
    },
    createdAt,
    updatedAt
  };

  const draftPage: BasePage = {
    id: '60b8d6c7f1e7b9a9a9a9a9a9',
    slug: 'about-us',
    title: { uk: 'Про нас', en: 'About us' },
    status: PageStatus.Draft,
    pageType: 'AboutUsPage',
    blocks: {
      IntroSection: {
        title: { uk: 'Чернетка Вступ', en: 'Draft Introduction' },
        image: {
          src: 'https://example.com/draft-image.jpg',
          alt: { uk: 'Чернетка Зображення', en: 'Draft Image' },
          caption: { uk: 'Підпис до чернетки', en: 'Draft caption' }
        },
        quote: {
          text: { uk: 'Чернетка Цитата', en: 'Draft Quote' },
          source: { uk: 'Чернетка Автор', en: 'Draft Autor' }
        }
      }
    },
    createdAt,
    updatedAt
  };

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
      expect(mockedPageRepository.getDraftBySlug).not.toHaveBeenCalled();
      expect(result).toEqual(publishedPage);
    });

    it('should return draft page when status is Draft', async () => {
      mockedPageRepository.getDraftBySlug.mockResolvedValueOnce(draftPage);

      const result = await pageService.getPageByStatus('about-us', PageStatus.Draft);

      expect(mockedPageRepository.getDraftBySlug).toHaveBeenCalledWith('about-us');
      expect(mockedPageRepository.getPublishedBySlug).not.toHaveBeenCalled();
      expect(result).toEqual(draftPage);
    });

    it('should return null for invalid status', async () => {
      const result = await pageService.getPageByStatus('about-us', 'InvalidStatus' as PageStatus);

      expect(mockedPageRepository.getPublishedBySlug).not.toHaveBeenCalled();
      expect(mockedPageRepository.getDraftBySlug).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('upsertDraft', () => {
    it('should create new draft when no existing draft or published page exists', async () => {
      const input = {
        slug: 'about-us',
        blocks: {
          IntroSection: {
            title: { uk: 'Новий Вступ', en: 'New Introduction' },
            image: {
              src: 'https://example.com/tmp/new-image.jpg',
              alt: { uk: 'Нове Зображення', en: 'New Image' },
              caption: { uk: 'Новий Підпис', en: 'New Caption' }
            },
            quote: { text: { uk: 'Нова Цитата', en: 'New Quote' }, source: { uk: 'Новий Автор', en: 'New Autor' } }
          }
        }
      };

      mockedPageRepository.getDraftBySlug.mockResolvedValueOnce(null);
      mockedPageRepository.getPublishedBySlug.mockResolvedValueOnce(publishedPage);
      mockedExtractImageSrcs.mockReturnValueOnce(['https://example.com/tmp/new-image.jpg']);
      mockedRemoveTmpFlagsRecursively.mockReturnValueOnce(input.blocks);
      mockedPageRepository.createDraft.mockResolvedValueOnce({ ...draftPage, blocks: input.blocks });

      const result = await pageService.upsertDraft(input);

      expect(mockedPageRepository.getDraftBySlug).toHaveBeenCalledWith('about-us');
      expect(mockedExtractImageSrcs).toHaveBeenCalledWith(input.blocks);
      expect(result).toEqual({ ...draftPage, blocks: input.blocks });
    });

    it('should apply patch to existing draft when changes exist', async () => {
      const input = {
        slug: 'about-us',
        blocks: {
          IntroSection: {
            title: { uk: 'Оновлений Вступ', en: 'Updated Introduction' },
            image: {
              src: 'https://example.com/tmp/updated-image.jpg',
              alt: { uk: 'Оновлене Зображення', en: 'Updated Image' },
              caption: { uk: 'Оновлений Підпис', en: 'Updated Caption' }
            },
            quote: {
              text: { uk: 'Оновлена Цитата', en: 'Updated Quote' },
              source: { uk: 'Оновлений Автор', en: 'Updated Autor' }
            }
          }
        }
      };

      const patch: Patch = {
        $set: { 'IntroSection.title.uk': 'Оновлений Вступ' },
        $unset: { 'IntroSection.quote.author': '' }
      };

      mockedPageRepository.getDraftBySlug.mockResolvedValueOnce(draftPage);
      mockedExtractImageSrcs.mockReturnValueOnce(['https://example.com/tmp/updated-image.jpg']);
      mockedRemoveTmpFlagsRecursively.mockReturnValueOnce(input.blocks);
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
      mockedRemoveTmpFlagsRecursively.mockReturnValueOnce(input.blocks);
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
    it('should publish page with provided blocks', async () => {
      const input = {
        slug: 'about-us',
        blocks: {
          IntroSection: {
            title: { uk: 'Опублікований Вступ', en: 'Published Introduction' },
            image: {
              src: 'https://example.com/tmp/published-image.jpg',
              alt: { uk: 'Опубліковане Зображення', en: 'Published Image' },
              caption: { uk: 'Опублікований Підпис', en: 'Published Caption' }
            },
            quote: {
              text: { uk: 'Опублікована Цитата', en: 'Published Quote' },
              source: { uk: 'Опублікований Автор', en: 'Published Autor' }
            }
          }
        }
      };

      const patch: Patch = {
        $set: { 'IntroSection.title.uk': 'Опублікований Вступ' },
        $unset: { 'IntroSection.quote.author': '' }
      };

      mockedPageRepository.getDraftBySlug.mockResolvedValueOnce(null);
      mockedPageRepository.getPublishedBySlug.mockResolvedValueOnce(publishedPage);
      mockedExtractImageSrcs.mockReturnValueOnce(['https://example.com/tmp/published-image.jpg']);
      mockedRemoveTmpFlagsRecursively.mockReturnValueOnce(input.blocks);
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

      const patch: Patch = {
        $set: { 'IntroSection.title.uk': 'Чернетка Вступ' },
        $unset: { 'IntroSection.quote.author': '' }
      };

      mockedPageRepository.getDraftBySlug.mockResolvedValueOnce(draftPage);
      mockedPageRepository.getPublishedBySlug.mockResolvedValueOnce(publishedPage);
      mockedExtractImageSrcs.mockReturnValueOnce(['https://example.com/draft-image.jpg']);
      mockedRemoveTmpFlagsRecursively.mockReturnValueOnce(draftPage.blocks);
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

      expect(mockedPageRepository.getPublishedBySlug).not.toHaveBeenCalled();
    });

    it('should throw when no title or pageType available', async () => {
      const input = {
        slug: 'about-us',
        blocks: {
          IntroSection: {
            title: { uk: 'Опублікований Вступ', en: 'Published Introduction' },
            image: {
              src: 'https://example.com/tmp/published-image.jpg',
              alt: { uk: 'Опубліковане Зображення', en: 'Published Image' },
              caption: { uk: 'Опублікований Підпис', en: 'Published Caption' }
            },
            quote: {
              text: { uk: 'Опублікована Цитата', en: 'Published Quote' },
              source: { uk: 'Опублікований Автор', en: 'Published Autor' }
            }
          }
        }
      };

      mockedPageRepository.getDraftBySlug.mockResolvedValueOnce(null);
      mockedPageRepository.getPublishedBySlug.mockResolvedValueOnce(null);
      mockedExtractImageSrcs.mockReturnValueOnce(['https://example.com/tmp/published-image.jpg']);
      mockedRemoveTmpFlagsRecursively.mockReturnValueOnce(input.blocks);

      await expect(pageService.publishPage(input)).rejects.toThrow(
        'Cannot upsert draft: no source (draft or published) for slug="about-us"'
      );
    });
  });
});
