import { PageRepository } from './pageRepository';
import type { BasePage } from '~/domain/entities/Page';
import dbConnect from '~/infrastructure/db/connect';
import PageModel from '~/infrastructure/models/page.model';
import { PageStatus } from '~/types/enums/common.enums';

jest.mock('../../db/connect', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined)
}));

jest.mock('../../models/page.model', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn()
  }
}));

jest.mock('../../models/draftPage.model', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn()
  }
}));

const mockedConnect = dbConnect as unknown as jest.Mock;
const mockedPageFindOne = (PageModel as unknown as { findOne: jest.Mock }).findOne;
const mockedPageFindOneAndUpdate = (PageModel as unknown as { findOneAndUpdate: jest.Mock }).findOneAndUpdate;

const draftModelMock = jest.requireMock('../../models/draftPage.model') as {
  default: { findOne: jest.Mock; findOneAndUpdate: jest.Mock };
};
const mockedDraftFindOne = draftModelMock.default.findOne;
const mockedDraftFindOneAndUpdate = draftModelMock.default.findOneAndUpdate;

type LeanRet<T> = { lean: jest.Mock<Promise<T>, []> };
const leanResolved = <T>(val: T): LeanRet<T> => ({ lean: jest.fn().mockResolvedValue(val) });

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
    blocks: { IntroSection: { a: 1 } },
    createdAt,
    updatedAt
  };

  const draftDoc = {
    _id: '60b8d6c7f1e7b9a9a9a9a9a9',
    slug: 'about-us',
    title: { uk: 'Про нас', en: 'About us' },
    status: PageStatus.Draft,
    pageType: 'AboutUsPage',
    blocks: { IntroSection: { draft: true } },
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
        blocks: { IntroSection: { a: 1 } },
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
        blocks: { IntroSection: { draft: true } },
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

  describe('upsertDraftBySlug', () => {
    it('should throw if blocks are null/undefined', async () => {
      await expect(repo.upsertDraftBySlug('about-us', undefined)).rejects.toThrow('Draft blocks payload is required');
    });

    it('should upsert existing draft and return mapped entity', async () => {
      mockedDraftFindOne.mockReturnValueOnce(leanResolved(draftDoc));
      mockedPageFindOne.mockReturnValueOnce(leanResolved(publishedDoc));

      const updatedDraft = {
        ...draftDoc,
        blocks: { IntroSection: { updated: true } },
        updatedAt: new Date('2024-03-01T00:00:00.000Z')
      };
      mockedDraftFindOneAndUpdate.mockReturnValueOnce(leanResolved(updatedDraft));

      const res = await repo.upsertDraftBySlug('about-us', { IntroSection: { updated: true } });

      expect(mockedDraftFindOne).toHaveBeenCalledWith({ slug: 'about-us' });
      expect(mockedPageFindOne).toHaveBeenCalledWith({ slug: 'about-us' });
      expect(mockedDraftFindOneAndUpdate).toHaveBeenCalledWith(
        { slug: 'about-us' },
        {
          $set: {
            slug: 'about-us',
            status: PageStatus.Draft,
            title: draftDoc.title,
            pageType: draftDoc.pageType,
            blocks: { IntroSection: { updated: true } }
          }
        },
        { new: true, upsert: true, runValidators: true, context: 'query' }
      );

      expect(res).toEqual({
        id: draftDoc._id,
        slug: 'about-us',
        title: draftDoc.title,
        status: PageStatus.Draft,
        pageType: 'AboutUsPage',
        blocks: { IntroSection: { updated: true } },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-03-01T00:00:00.000Z'
      });
    });

    it('should create draft from published meta when no existing draft', async () => {
      mockedDraftFindOne.mockReturnValueOnce(leanResolved(null));
      mockedPageFindOne.mockReturnValueOnce(leanResolved(publishedDoc));

      const createdDraft = {
        ...draftDoc,
        blocks: { IntroSection: { created: true } },
        createdAt: new Date('2024-04-01T00:00:00.000Z'),
        updatedAt: new Date('2024-04-01T00:00:00.000Z')
      };
      mockedDraftFindOneAndUpdate.mockReturnValueOnce(leanResolved(createdDraft));

      const res = await repo.upsertDraftBySlug('about-us', { IntroSection: { created: true } });

      expect(mockedDraftFindOneAndUpdate).toHaveBeenCalledWith(
        { slug: 'about-us' },
        {
          $set: {
            slug: 'about-us',
            status: PageStatus.Draft,
            title: publishedDoc.title,
            pageType: publishedDoc.pageType,
            blocks: { IntroSection: { created: true } }
          }
        },
        { new: true, upsert: true, runValidators: true, context: 'query' }
      );

      expect(res.slug).toBe('about-us');
      expect(res.status).toBe(PageStatus.Draft);
      expect(res.pageType).toBe('AboutUsPage');
      expect(res.blocks).toEqual({ IntroSection: { created: true } });
      expect(res.createdAt).toBe('2024-04-01T00:00:00.000Z');
      expect(res.updatedAt).toBe('2024-04-01T00:00:00.000Z');
    });

    it('should throw when no source meta available', async () => {
      mockedDraftFindOne.mockReturnValueOnce(leanResolved(null));
      mockedPageFindOne.mockReturnValueOnce(leanResolved(null));

      await expect(repo.upsertDraftBySlug('about-us', { x: 1 })).rejects.toThrow(
        'Cannot upsert draft: no source (draft or published) for slug="about-us"'
      );
    });
  });

  describe('publishBySlug', () => {
    it('should publish from provided blocks when no draft', async () => {
      mockedDraftFindOne.mockReturnValueOnce(leanResolved(null));
      mockedPageFindOne.mockReturnValueOnce(leanResolved(publishedDoc));

      const updated = {
        ...publishedDoc,
        blocks: { IntroSection: { provided: true } },
        status: PageStatus.Published,
        updatedAt: new Date('2024-05-01T00:00:00.000Z')
      };
      mockedPageFindOneAndUpdate.mockReturnValueOnce(leanResolved(updated));

      const res = await repo.publishBySlug('about-us', { IntroSection: { provided: true } });

      expect(mockedPageFindOneAndUpdate).toHaveBeenCalledWith(
        { slug: 'about-us' },
        {
          $set: {
            status: PageStatus.Published,
            title: publishedDoc.title,
            pageType: publishedDoc.pageType,
            blocks: { IntroSection: { provided: true } }
          }
        },
        { new: true, upsert: true, runValidators: true, context: 'query', strict: false }
      );

      expect(res).toEqual({
        id: _id,
        slug: 'about-us',
        title: publishedDoc.title,
        status: PageStatus.Published,
        pageType: 'AboutUsPage',
        blocks: { IntroSection: { provided: true } },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-05-01T00:00:00.000Z'
      });
    });

    it('should publish from draft when blocksOverride not provided', async () => {
      mockedDraftFindOne.mockReturnValueOnce(leanResolved(draftDoc));

      const updated = {
        ...publishedDoc,
        blocks: draftDoc.blocks,
        status: PageStatus.Published,
        updatedAt: new Date('2024-06-01T00:00:00.000Z')
      };
      mockedPageFindOneAndUpdate.mockReturnValueOnce(leanResolved(updated));

      const res = await repo.publishBySlug('about-us');

      expect(mockedDraftFindOne).toHaveBeenCalledWith({ slug: 'about-us' });
      expect(mockedPageFindOneAndUpdate).toHaveBeenCalledWith(
        { slug: 'about-us' },
        {
          $set: {
            status: PageStatus.Published,
            title: draftDoc.title,
            pageType: draftDoc.pageType,
            blocks: draftDoc.blocks
          }
        },
        { new: true, upsert: true, runValidators: true, context: 'query', strict: false }
      );

      expect(res.updatedAt).toBe('2024-06-01T00:00:00.000Z');
      expect(res.blocks).toEqual(draftDoc.blocks);
    });

    it('should throw when no draft and no override provided', async () => {
      mockedDraftFindOne.mockReturnValueOnce(leanResolved(null));

      await expect(repo.publishBySlug('missing')).rejects.toThrow('Draft not found by slug="missing"');
    });

    it('should throw when cannot resolve title/pageType', async () => {
      mockedDraftFindOne.mockReturnValueOnce(leanResolved(null));
      mockedPageFindOne.mockReturnValueOnce(leanResolved(null));

      await expect(repo.publishBySlug('about-us', { x: 1 })).rejects.toThrow(
        'Cannot publish: missing title/pageType for slug="about-us"'
      );
    });
  });
});
