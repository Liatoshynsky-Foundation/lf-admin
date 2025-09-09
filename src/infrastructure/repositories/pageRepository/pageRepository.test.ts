import { PageRepository } from './pageRepository';

jest.mock('../../db/connect', () => jest.fn().mockResolvedValue(undefined));

const findOneMock = jest.fn();
const findOneAndUpdateMock = jest.fn();

jest.mock('../../models/page.model', () => ({
  __esModule: true,
  default: {
    findOne: (...args: unknown[]) => findOneMock(...args),
    findOneAndUpdate: (...args: unknown[]) => findOneAndUpdateMock(...args)
  }
}));

type JSONValue = string | number | boolean | null | { [k: string]: JSONValue } | JSONValue[];
type Patch = { $set?: { blocks?: JSONValue }; $unset?: Record<string, unknown> };

describe('PageRepository', () => {
  const repo = PageRepository();

  const baseDoc = {
    _id: '507f1f77bcf86cd799439011',
    slug: 'about-us',
    title: 'About us',
    status: 'published',
    pageType: 'static',
    blocks: { IntroSection: {}, Other: {} },
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-02-01T00:00:00.000Z')
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPageBySlug', () => {
    it('should return mapped page when found', async () => {
      findOneMock.mockReturnValueOnce({ lean: jest.fn().mockResolvedValueOnce(baseDoc) });
      const result = await repo.getPageBySlug('about-us');
      expect(findOneMock).toHaveBeenCalledWith({ slug: 'about-us' });
      expect(result).toEqual({
        id: baseDoc._id,
        slug: baseDoc.slug,
        title: baseDoc.title,
        status: baseDoc.status,
        pageType: baseDoc.pageType,
        blocks: baseDoc.blocks,
        createdAt: baseDoc.createdAt,
        updatedAt: baseDoc.updatedAt
      });
    });

    it('should return null when page not found', async () => {
      findOneMock.mockReturnValueOnce({ lean: jest.fn().mockResolvedValueOnce(null) });
      const result = await repo.getPageBySlug('missing');
      expect(findOneMock).toHaveBeenCalledWith({ slug: 'missing' });
      expect(result).toBeNull();
    });
  });

  describe('partialUpdateBySlug', () => {
    it('should update blocks via $set and return mapped page', async () => {
      const newBlocks = { IntroSection: { a: 1 } } as const;
      const patch: Patch = { $set: { blocks: newBlocks } };

      findOneAndUpdateMock.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce({
          ...baseDoc,
          blocks: newBlocks,
          updatedAt: new Date('2024-03-01T00:00:00.000Z')
        })
      });

      const result = await repo.partialUpdateBySlug('about-us', patch);

      expect(findOneAndUpdateMock).toHaveBeenCalledWith({ slug: 'about-us' }, patch, { new: true, strict: false });

      expect(result).toEqual({
        id: baseDoc._id,
        slug: baseDoc.slug,
        title: baseDoc.title,
        status: baseDoc.status,
        pageType: baseDoc.pageType,
        blocks: newBlocks,
        createdAt: baseDoc.createdAt,
        updatedAt: new Date('2024-03-01T00:00:00.000Z')
      });
    });

    it('should support $unset and throw when not found', async () => {
      const patch: Patch = { $unset: { blocks: '' } };
      findOneAndUpdateMock.mockReturnValueOnce({ lean: jest.fn().mockResolvedValueOnce(undefined) });
      await expect(repo.partialUpdateBySlug('missing', patch)).rejects.toThrow('Page not found by slug="missing"');
    });
  });
});
