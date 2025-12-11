import { PageRepository } from './pageRepository';
import { PageStatus } from '~/back-shared/types/enums/common.enums';
import type { Patch } from '~/back-shared/types/pages/types';
import type { BasePage } from '~/domain/entities/Page';
import dbConnect from '~/infrastructure/db/connect';
import PageModel from '~/infrastructure/models/page.model';

jest.mock('../../db/connect', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined)
}));

jest.mock('../../models/page.model', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    save: jest.fn()
  }
}));

jest.mock('../../models/draftPage.model', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    save: jest.fn()
  }
}));

const mockedConnect = dbConnect as unknown as jest.Mock;
const mockedPageFindOne = (PageModel as unknown as { findOne: jest.Mock }).findOne;
const mockedPageFindOneAndUpdate = (PageModel as unknown as { findOneAndUpdate: jest.Mock }).findOneAndUpdate;

const draftModelMock = jest.requireMock('../../models/draftPage.model') as {
  default: { findOne: jest.Mock; findOneAndUpdate: jest.Mock; save: jest.Mock };
};
const mockedDraftFindOne = draftModelMock.default.findOne;
const mockedDraftFindOneAndUpdate = draftModelMock.default.findOneAndUpdate;

type LeanRet<T> = { lean: jest.Mock<Promise<T>, []>; toObject?: jest.Mock<T, []> };
const leanResolved = <T>(val: T): LeanRet<T> => ({
  lean: jest.fn().mockResolvedValue(val),
  toObject: jest.fn().mockReturnValue(val)
});

describe('PageRepository', () => {
  const repo = PageRepository({
    PageModel: PageModel as unknown as import('mongoose').Model<BasePage>,
    DraftPageModel: draftModelMock.default as unknown as import('mongoose').Model<BasePage>
  });

  const _id = '507f1f77bcf86cd799439011';
  const createdAt = new Date('2024-01-01T00:00:00.000Z');
  const updatedAt = new Date('2024-02-01T00:00:00.000Z');

  const publishedDoc = {
    _id,
    slug: 'about-us',
    title: { uk: 'Про нас', en: 'About us' },
    status: PageStatus.Published,
    pageType: 'AboutUsPage',
    blocks: {
      IntroSection: {
        title: { uk: 'Вступ', en: 'Introduction' },
        image: { url: 'https://example.com/image.jpg', alt: { uk: 'Зображення', en: 'Image' } },
        quote: { text: { uk: 'Цитата', en: 'Quote' }, author: 'Author' }
      }
    },
    createdAt,
    updatedAt
  };

  const draftDoc = {
    _id: '60b8d6c7f1e7b9a9a9a9a9a9',
    slug: 'about-us',
    title: { uk: 'Про нас', en: 'About us' },
    status: PageStatus.Draft,
    pageType: 'AboutUsPage',
    blocks: {
      IntroSection: {
        title: { uk: 'Чернетка Вступ', en: 'Draft Introduction' },
        image: { url: 'https://example.com/draft-image.jpg', alt: { uk: 'Чернетка Зображення', en: 'Draft Image' } },
        quote: { text: { uk: 'Чернетка Цитата', en: 'Draft Quote' }, author: 'Draft Author' }
      }
    },
    createdAt,
    updatedAt
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPublishedBySlug', () => {
    it('should return mapped published page when found', async () => {
      mockedPageFindOne.mockReturnValueOnce(leanResolved(publishedDoc));

      const res = await repo.getPublishedBySlug('about-us');

      expect(mockedConnect).toHaveBeenCalled();
      expect(mockedPageFindOne).toHaveBeenCalledWith({ slug: 'about-us' });
      expect(res).toEqual({
        id: _id,
        slug: 'about-us',
        title: publishedDoc.title,
        status: PageStatus.Published,
        pageType: 'AboutUsPage',
        blocks: publishedDoc.blocks,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-02-01T00:00:00.000Z'
      });
    });

    it('should return null when published page not found', async () => {
      mockedPageFindOne.mockReturnValueOnce(leanResolved(null));

      const res = await repo.getPublishedBySlug('missing');

      expect(mockedPageFindOne).toHaveBeenCalledWith({ slug: 'missing' });
      expect(res).toBeNull();
    });
  });

  describe('getDraftBySlug', () => {
    it('should return mapped draft page when found', async () => {
      mockedDraftFindOne.mockReturnValueOnce(leanResolved(draftDoc));

      const res = await repo.getDraftBySlug('about-us');

      expect(mockedDraftFindOne).toHaveBeenCalledWith({ slug: 'about-us' });
      expect(res).toEqual({
        id: draftDoc._id,
        slug: 'about-us',
        title: draftDoc.title,
        status: PageStatus.Draft,
        pageType: 'AboutUsPage',
        blocks: draftDoc.blocks,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-02-01T00:00:00.000Z'
      });
    });

    it('should return null when draft page not found', async () => {
      mockedDraftFindOne.mockReturnValueOnce(leanResolved(null));

      const res = await repo.getDraftBySlug('missing');

      expect(mockedDraftFindOne).toHaveBeenCalledWith({ slug: 'missing' });
      expect(res).toBeNull();
    });
  });

  describe('applyPatchToDraft', () => {
    it('should apply patch to existing draft and return mapped entity', async () => {
      const patch: Patch = {
        $set: { 'IntroSection.title.uk': 'Оновлений Вступ' },
        $unset: { 'IntroSection.quote.author': '' }
      };

      const updatedDraft = {
        ...draftDoc,
        blocks: {
          IntroSection: {
            title: { uk: 'Оновлений Вступ', en: 'Draft Introduction' },
            image: draftDoc.blocks.IntroSection.image,
            quote: { text: draftDoc.blocks.IntroSection.quote.text }
          }
        },
        updatedAt: new Date('2024-03-01T00:00:00.000Z')
      };

      mockedDraftFindOneAndUpdate.mockReturnValueOnce(leanResolved(updatedDraft));

      const res = await repo.applyPatchToDraft('about-us', patch);

      expect(mockedConnect).toHaveBeenCalled();
      expect(mockedDraftFindOneAndUpdate).toHaveBeenCalledWith(
        { slug: 'about-us' },
        {
          $set: { 'blocks.IntroSection.title.uk': 'Оновлений Вступ' },
          $unset: { 'blocks.IntroSection.quote.author': '' }
        },
        { new: true }
      );
      expect(res).toEqual({
        id: draftDoc._id,
        slug: 'about-us',
        title: draftDoc.title,
        status: PageStatus.Draft,
        pageType: 'AboutUsPage',
        blocks: updatedDraft.blocks,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-03-01T00:00:00.000Z'
      });
    });

    it('should throw when draft not found', async () => {
      const patch: Patch = { $set: { 'IntroSection.title.uk': 'Оновлений Вступ' } };
      mockedDraftFindOneAndUpdate.mockReturnValueOnce(leanResolved(null));

      await expect(repo.applyPatchToDraft('missing', patch)).rejects.toThrow('Error during creating draft page');
    });
  });

  describe('applyPatchToPublished', () => {
    it('should apply patch to published page and return mapped entity', async () => {
      const patch: Patch = {
        $set: { 'IntroSection.title.uk': 'Опублікований Вступ' },
        $unset: { 'IntroSection.quote.author': '' }
      };
      const title = { uk: 'Про нас', en: 'About us' };
      const pageType = 'AboutUsPage';

      const updatedPublished = {
        ...publishedDoc,
        blocks: {
          IntroSection: {
            title: { uk: 'Опублікований Вступ', en: 'Introduction' },
            image: publishedDoc.blocks.IntroSection.image,
            quote: { text: publishedDoc.blocks.IntroSection.quote.text }
          }
        },
        updatedAt: new Date('2024-05-01T00:00:00.000Z')
      };

      mockedPageFindOneAndUpdate.mockReturnValueOnce(leanResolved(updatedPublished));

      const res = await repo.applyPatchToPublished('about-us', patch, title, pageType);

      expect(mockedConnect).toHaveBeenCalled();
      expect(mockedPageFindOneAndUpdate).toHaveBeenCalledWith(
        { slug: 'about-us' },
        {
          $set: {
            'blocks.IntroSection.title.uk': 'Опублікований Вступ',
            title,
            pageType,
            status: PageStatus.Published
          },
          $unset: { 'blocks.IntroSection.quote.author': '' }
        },
        { new: true, upsert: true, runValidators: true, context: 'query', strict: false }
      );
      expect(res).toEqual({
        id: _id,
        slug: 'about-us',
        title,
        status: PageStatus.Published,
        pageType: 'AboutUsPage',
        blocks: updatedPublished.blocks,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-05-01T00:00:00.000Z'
      });
    });

    it('should throw when published page update fails', async () => {
      const patch: Patch = { $set: { 'IntroSection.title.uk': 'Опублікований Вступ' } };
      const title = { uk: 'Про нас', en: 'About us' };
      const pageType = 'AboutUsPage';

      mockedPageFindOneAndUpdate.mockReturnValueOnce(leanResolved(null));

      await expect(repo.applyPatchToPublished('about-us', patch, title, pageType)).rejects.toThrow(
        'Error during publishing the page'
      );
    });
  });
});
