import { PageRepository } from './pageRepository';
import type { Patch } from '~/back-shared/types/pages/types';
import type { BasePage } from '~/domain/entities/Page';
import dbConnect from '~/infrastructure/db/connect';
import PageModel from '~/infrastructure/models/page.model';
import { PageCategories, PageStatus } from '~/types/enums/common.enums';

const DEFAULT_COVER_IMAGE = {
  src: '/images/image.jpg',
  alt: { uk: 'Зображення', en: 'Image' },
  caption: { uk: '', en: '' },
  isTmp: false
};

jest.mock('../../db/connect', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined)
}));

jest.mock('../../models/page.model', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    find: jest.fn(),
    save: jest.fn()
  }
}));

jest.mock('../../models/draftPage.model', () => {
  const mockSave = jest.fn();
  const MockModel = jest.fn().mockImplementation(() => ({
    save: mockSave,
    toObject: jest.fn()
  }));

  return {
    __esModule: true,
    default: Object.assign(MockModel, {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      save: mockSave
    })
  };
});

const mockedConnect = dbConnect as unknown as jest.Mock;
const mockedPageFindOne = (PageModel as unknown as { findOne: jest.Mock }).findOne;
const mockedPageFindOneAndUpdate = (PageModel as unknown as { findOneAndUpdate: jest.Mock }).findOneAndUpdate;
const mockedPagesFind = (PageModel as unknown as { find: jest.Mock }).find;

const DraftPageModelMock = jest.requireMock('../../models/draftPage.model').default;
const mockedDraftFindOne = DraftPageModelMock.findOne;
const mockedDraftFindOneAndUpdate = DraftPageModelMock.findOneAndUpdate;

type LeanRet<T> = { lean: jest.Mock<Promise<T>, []>; toObject?: jest.Mock<T, []> };
const leanResolved = <T>(val: T): LeanRet<T> => ({
  lean: jest.fn().mockResolvedValue(val),
  toObject: jest.fn().mockReturnValue(val)
});

interface MockImageWithCrop {
  image?: {
    crop?: { x: number; y: number; width: number; height: number };
  };
  bigImage?: {
    crop?: { x: number; y: number; width: number; height: number };
  };
}

describe('PageRepository', () => {
  const repo = PageRepository({
    PageModel: PageModel as unknown as import('mongoose').Model<BasePage>,
    DraftPageModel: DraftPageModelMock as unknown as import('mongoose').Model<BasePage>
  });

  const _id = '507f1f77bcf86cd799439011';
  const createdAt = new Date('2024-01-01T00:00:00.000Z');
  const updatedAt = new Date('2024-02-01T00:00:00.000Z');

  const publishedDoc = {
    _id,
    slug: 'about-us',
    title: { uk: 'Про нас', en: 'About us' },
    status: PageStatus.Published,
    category: 'foundation', 
    coverImage: DEFAULT_COVER_IMAGE, 
    pageType: 'AboutUsPage',
    blocks: {
      IntroSection: {
        title: { uk: 'Вступ', en: 'Introduction' },
        image: { src: 'foundation-first.jpg', alt: { uk: 'Зображення', en: 'Image' } },
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
    category: 'foundation', 
    coverImage: DEFAULT_COVER_IMAGE, 
    pageType: 'AboutUsPage',
    blocks: {
      IntroSection: {
        title: { uk: 'Чернетка Вступ', en: 'Draft Introduction' },
        image: { src: 'draft-image.jpg', alt: { uk: 'Чернетка Зображення', en: 'Draft Image' } },
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
        category: 'foundation', 
        coverImage: DEFAULT_COVER_IMAGE,
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
        category: 'foundation', 
        coverImage: DEFAULT_COVER_IMAGE,
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
        category: 'foundation', 
        coverImage: DEFAULT_COVER_IMAGE,
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
        category: 'foundation', 
        coverImage: DEFAULT_COVER_IMAGE,
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

  describe('applyPatchToPublished with crop', () => {
    it('should include crop data in blocks when patched', async () => {
      const crop = { x: 50, y: 50, width: 200, height: 200 };
      const patch = {
        $set: { 'IntroSection.image.crop': crop }
      };

      const title = { uk: 'Про нас', en: 'About us' };
      const pageType = 'AboutUsPage';

      const updatedDoc = {
        ...publishedDoc,
        blocks: {
          ...publishedDoc.blocks,
          IntroSection: {
            ...publishedDoc.blocks.IntroSection,
            image: { ...publishedDoc.blocks.IntroSection.image, crop }
          }
        }
      };

      mockedPageFindOneAndUpdate.mockReturnValueOnce(leanResolved(updatedDoc));

      const res = await repo.applyPatchToPublished('about-us', patch, title, pageType);

      const introSection = res.blocks.IntroSection as unknown as MockImageWithCrop;
      expect(introSection.image?.crop).toEqual(crop);

      expect(mockedPageFindOneAndUpdate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          $set: expect.objectContaining({
            'blocks.IntroSection.image.crop': crop
          })
        }),
        expect.anything()
      );
    });
  });

  describe('createDraft with crop', () => {
    it('should save a new draft with crop data in blocks', async () => {
      const crop = { x: 10, y: 10, width: 100, height: 100 };
      const blocks = {
        IntroSection: {
          image: { src: 'new-image.jpg', crop }
        }
      };

      const newDraftDoc = { ...draftDoc, _id: 'new-draft-id', blocks };
      const mockSave = jest.fn().mockResolvedValue({
        toObject: jest.fn().mockReturnValue(newDraftDoc)
      });
      DraftPageModelMock.mockImplementationOnce(() => ({ save: mockSave }));

      const res = await repo.createDraft('about-us', blocks, publishedDoc as unknown as BasePage);

      const resBlocks = res.blocks as unknown as Record<string, MockImageWithCrop>;
      expect(resBlocks.IntroSection.image?.crop).toEqual(crop);
    });
  });

  describe('applyPatchToDraft with crop', () => {
    it('should apply patch containing crop to draft blocks', async () => {
      const crop = { x: 25, y: 25, width: 50, height: 50 };
      const patch: Patch = { $set: { 'IntroSection.image.crop': crop } };

      const updatedDraft = {
        ...draftDoc,
        blocks: { IntroSection: { image: { src: 'foundation-first.jpg', crop } } }
      };

      mockedDraftFindOneAndUpdate.mockReturnValueOnce(leanResolved(updatedDraft));
      const res = await repo.applyPatchToDraft('about-us', patch);

      const resBlocks = res.blocks as unknown as Record<string, MockImageWithCrop>;
      expect(resBlocks.IntroSection.image?.crop).toEqual(crop);
    });
  });

  describe('applyPatchToPublished with complex crop', () => {
    it('should correctly build dot notation for nested crop updates', async () => {
      const crop = { x: 0, y: 0, width: 500, height: 500 };
      const patch: Patch = { $set: { 'OurMission.bigImage.crop': crop } };
      const title = { uk: 'Місія', en: 'Mission' };
      const pageType = 'AboutUsPage';

      const updatedDoc = {
        ...publishedDoc,
        blocks: { OurMission: { bigImage: { src: 'mission.jpg', crop } } }
      };

      mockedPageFindOneAndUpdate.mockReturnValueOnce(leanResolved(updatedDoc));
      const res = await repo.applyPatchToPublished('about-us', patch, title, pageType);

      const resBlocks = res.blocks as unknown as Record<string, MockImageWithCrop>;
      expect(resBlocks.OurMission.bigImage?.crop).toEqual(crop);
    });
  });

  describe('findPages', () => {
    it('should return all pages if no category is provided', async () => {
      mockedPagesFind.mockReturnValueOnce(leanResolved([publishedDoc]));

      const res = await repo.findPages();

      expect(mockedConnect).toHaveBeenCalled();
      expect(res).toEqual([{
        id: _id,
        slug: 'about-us',
        title: publishedDoc.title,
        status: PageStatus.Published,
        category: 'foundation', 
        coverImage: DEFAULT_COVER_IMAGE,
        pageType: 'AboutUsPage',
        blocks: publishedDoc.blocks,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-02-01T00:00:00.000Z'
      }]);
    });

    it('should return all pages by category if provided', async () => {
      mockedPagesFind.mockReturnValueOnce(leanResolved([publishedDoc]));
      const category = 'foundation' as PageCategories;

      const res = await repo.findPages(category);

      expect(mockedConnect).toHaveBeenCalled();
      expect(mockedPagesFind).toHaveBeenCalledWith({
        category
      });

      expect(res).toEqual([{
        id: _id,
        slug: 'about-us',
        title: publishedDoc.title,
        status: PageStatus.Published,
        category: 'foundation', 
        coverImage: DEFAULT_COVER_IMAGE,
        pageType: 'AboutUsPage',
        blocks: publishedDoc.blocks,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-02-01T00:00:00.000Z'
      }]);
    });
  });
});
