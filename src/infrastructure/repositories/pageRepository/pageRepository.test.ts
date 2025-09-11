jest.mock('../../db/connect', () => jest.fn().mockResolvedValue(undefined));

const findOneMock = jest.fn();
const findOneAndUpdateMock = jest.fn();
const deleteOneMock = jest.fn();

jest.mock('../../models/page.model', () => {
  const DiscriminatorCtor = function (this: unknown, payload: Record<string, unknown>) {
    return {
      save: async () => {
        const createdAt = new Date('2024-04-01T00:00:00.000Z');
        const updatedAt = new Date('2024-04-01T00:00:00.000Z');
        return {
          toObject: () => ({
            _id: '65b8d6c7f1e7b9a9a9a9a9a9',
            ...payload,
            createdAt,
            updatedAt
          })
        };
      }
    };
  };

  return {
    __esModule: true,
    default: {
      findOne: (...args: unknown[]) => findOneMock(...args),
      findOneAndUpdate: (...args: unknown[]) => findOneAndUpdateMock(...args),
      deleteOne: (...args: unknown[]) => deleteOneMock(...args),
      discriminators: { static: DiscriminatorCtor }
    }
  };
});

import { PageRepository } from './pageRepository';

type JSONValue = string | number | boolean | null | { [k: string]: JSONValue } | JSONValue[];
type Patch = { $set?: { blocks?: JSONValue }; $unset?: Record<string, unknown> };

describe('PageRepository', () => {
  const repo = PageRepository();

  const _id = '507f1f77bcf86cd799439011';
  const baseDoc = {
    _id,
    slug: 'about-us',
    title: { uk: 'Про нас', en: 'About us' },
    status: 'published' as const,
    pageType: 'static',
    blocks: { IntroSection: {}, Other: {} },
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-02-01T00:00:00.000Z')
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPageBySlugAndStatus', () => {
    it('should return mapped entity when found', async () => {
      findOneMock.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce(baseDoc)
      });

      const res = await repo.getPageBySlugAndStatus('about-us', 'published');

      expect(findOneMock).toHaveBeenCalledWith({
        slug: 'about-us',
        status: 'published'
      });
      expect(res).toEqual({
        id: _id,
        slug: 'about-us',
        title: baseDoc.title,
        status: 'published',
        pageType: 'static',
        blocks: baseDoc.blocks,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-02-01T00:00:00.000Z'
      });
    });

    it('should return null when not found', async () => {
      findOneMock.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce(null)
      });

      const res = await repo.getPageBySlugAndStatus('missing', 'draft');

      expect(findOneMock).toHaveBeenCalledWith({
        slug: 'missing',
        status: 'draft'
      });
      expect(res).toBeNull();
    });
  });

  describe('partialUpdateBySlugAndStatus', () => {
    it('should update via $set and returns mapped entity', async () => {
      const patch: Patch = { $set: { blocks: { IntroSection: { a: 1 } } } };
      const updatedAt = new Date('2024-03-01T00:00:00.000Z');

      findOneAndUpdateMock.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce({
          ...baseDoc,
          blocks: { IntroSection: { a: 1 } },
          updatedAt
        })
      });

      const res = await repo.partialUpdateBySlugAndStatus('about-us', 'published', patch);

      expect(findOneAndUpdateMock).toHaveBeenCalledWith({ slug: 'about-us', status: 'published' }, patch, {
        new: true,
        strict: false,
        runValidators: true,
        context: 'query'
      });
      expect(res).toEqual({
        id: _id,
        slug: 'about-us',
        title: { uk: 'Про нас', en: 'About us' },
        status: 'published',
        pageType: 'static',
        blocks: { IntroSection: { a: 1 } },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-03-01T00:00:00.000Z'
      });
    });

    it('should support $unset and throws when not found', async () => {
      const patch: Patch = { $unset: { blocks: '' } };

      findOneAndUpdateMock.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce(undefined)
      });

      await expect(repo.partialUpdateBySlugAndStatus('missing', 'draft', patch)).rejects.toThrow(
        'Page not found by slug="missing" & status="draft"'
      );

      expect(findOneAndUpdateMock).toHaveBeenCalledWith({ slug: 'missing', status: 'draft' }, patch, {
        new: true,
        strict: false,
        runValidators: true,
        context: 'query'
      });
    });
  });

  describe('upsertDraft', () => {
    it('should throw if blocks are null/undefined', async () => {
      await expect(repo.upsertDraft('about-us', undefined)).rejects.toThrow('Draft blocks payload is required');
    });

    it('should throw if no published source', async () => {
      findOneMock.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce(null)
      });

      await expect(repo.upsertDraft('about-us', { IntroSection: {} })).rejects.toThrow(
        'Published page not found by slug="about-us"'
      );

      expect(findOneMock).toHaveBeenCalledWith({
        slug: 'about-us',
        status: 'published'
      });
    });

    it('should update existing draft if present', async () => {
      const publishedLean = { ...baseDoc };
      const draftSaved = {
        toObject: () => ({
          _id: '60b8d6c7f1e7b9a9a9a9a9a9',
          slug: 'about-us',
          status: 'draft' as const,
          title: publishedLean.title,
          pageType: publishedLean.pageType,
          blocks: { IntroSection: { x: 1 } },
          createdAt: new Date('2024-04-01T00:00:00.000Z'),
          updatedAt: new Date('2024-04-02T00:00:00.000Z')
        })
      };

      const draftDoc = {
        set: (_: Record<string, unknown>) => void 0,
        save: async () => draftSaved
      };

      findOneMock
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValueOnce(publishedLean)
        })
        .mockReturnValueOnce(draftDoc);

      const result = await repo.upsertDraft('about-us', {
        IntroSection: { x: 1 }
      });

      expect(findOneMock.mock.calls[0][0]).toEqual({
        slug: 'about-us',
        status: 'published'
      });
      expect(findOneMock.mock.calls[1][0]).toEqual({
        slug: 'about-us',
        status: 'draft'
      });

      expect(result).toEqual({
        id: '60b8d6c7f1e7b9a9a9a9a9a9',
        slug: 'about-us',
        status: 'draft',
        title: publishedLean.title,
        pageType: publishedLean.pageType,
        blocks: { IntroSection: { x: 1 } },
        createdAt: '2024-04-01T00:00:00.000Z',
        updatedAt: '2024-04-02T00:00:00.000Z'
      });
    });

    it('should create new draft using discriminator of published pageType', async () => {
      const publishedLean = { ...baseDoc };

      findOneMock
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValueOnce(publishedLean)
        })
        .mockReturnValueOnce(null);

      const result = await repo.upsertDraft('about-us', {
        IntroSection: { y: 2 }
      });

      expect(findOneMock.mock.calls[0][0]).toEqual({
        slug: 'about-us',
        status: 'published'
      });
      expect(findOneMock.mock.calls[1][0]).toEqual({
        slug: 'about-us',
        status: 'draft'
      });

      expect(result.slug).toBe('about-us');
      expect(result.status).toBe('draft');
      expect(result.pageType).toBe('static');
      expect(result.blocks).toEqual({ IntroSection: { y: 2 } });
      expect(result.createdAt).toBe('2024-04-01T00:00:00.000Z');
      expect(result.updatedAt).toBe('2024-04-01T00:00:00.000Z');
    });
  });

  describe('publishFromBlocks', () => {
    it('should publish using provided blocks and deletes draft', async () => {
      const providedBlocks = { IntroSection: { a: 1 } };

      findOneMock
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValueOnce(null)
        })
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValueOnce(baseDoc)
        });

      findOneAndUpdateMock.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce({
          ...baseDoc,
          status: 'published' as const,
          blocks: providedBlocks,
          updatedAt: new Date('2024-05-01T00:00:00.000Z')
        })
      });

      const res = await repo.publishFromBlocks('about-us', providedBlocks);

      expect(findOneAndUpdateMock).toHaveBeenCalledWith(
        { slug: 'about-us', status: 'published' },
        {
          $set: {
            blocks: providedBlocks,
            title: baseDoc.title,
            pageType: baseDoc.pageType
          },
          $setOnInsert: { slug: 'about-us', status: 'published' }
        },
        { new: true, upsert: true, runValidators: true, context: 'query', strict: false }
      );

      expect(deleteOneMock).toHaveBeenCalledWith({
        slug: 'about-us',
        status: 'draft'
      });

      expect(res).toEqual({
        id: _id,
        slug: 'about-us',
        title: baseDoc.title,
        status: 'published',
        pageType: baseDoc.pageType,
        blocks: providedBlocks,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-05-01T00:00:00.000Z'
      });
    });

    it('should publish from existing draft when blocks not provided', async () => {
      const draftLean = {
        ...baseDoc,
        status: 'draft' as const,
        blocks: { IntroSection: { fromDraft: true } }
      };

      findOneMock
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValueOnce(draftLean)
        })
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValueOnce(draftLean)
        });

      findOneAndUpdateMock.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce({
          ...baseDoc,
          status: 'published' as const,
          blocks: draftLean.blocks,
          updatedAt: new Date('2024-06-01T00:00:00.000Z')
        })
      });

      const res = await repo.publishFromBlocks('about-us');

      expect(findOneMock.mock.calls[0][0]).toEqual({
        slug: 'about-us',
        status: 'draft'
      });
      expect(findOneMock.mock.calls[1][0]).toEqual({
        slug: 'about-us',
        status: 'draft'
      });

      expect(findOneAndUpdateMock).toHaveBeenCalledWith(
        { slug: 'about-us', status: 'published' },
        {
          $set: {
            blocks: { IntroSection: { fromDraft: true } },
            title: draftLean.title,
            pageType: draftLean.pageType
          },
          $setOnInsert: { slug: 'about-us', status: 'published' }
        },
        { new: true, upsert: true, runValidators: true, context: 'query', strict: false }
      );

      expect(deleteOneMock).toHaveBeenCalledWith({
        slug: 'about-us',
        status: 'draft'
      });

      expect(res).toEqual({
        id: _id,
        slug: 'about-us',
        title: baseDoc.title,
        status: 'published',
        pageType: baseDoc.pageType,
        blocks: { IntroSection: { fromDraft: true } },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-06-01T00:00:00.000Z'
      });
    });

    it('should throw if no draft for implicit blocks', async () => {
      findOneMock.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce(null)
      });

      await expect(repo.publishFromBlocks('missing')).rejects.toThrow('Draft page not found by slug="missing"');
    });

    it('throws if no source when blocks provided', async () => {
      const providedBlocks = { IntroSection: { a: 1 } };

      findOneMock
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValueOnce(null)
        })
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValueOnce(null)
        });

      await expect(repo.publishFromBlocks('no-source', providedBlocks)).rejects.toThrow(
        'No source page found by slug="no-source"'
      );

      expect(deleteOneMock).not.toHaveBeenCalled();
      expect(findOneAndUpdateMock).not.toHaveBeenCalled();
    });
  });
});
