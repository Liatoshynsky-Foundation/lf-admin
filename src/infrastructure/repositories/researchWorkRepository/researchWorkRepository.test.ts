import { Model } from 'mongoose';

import { DbResearchWork, ResearchWorkRepository } from './researchWorkRepository';
import { CreateResearchWorkInput } from '~/src/domain/repositories/researchWorkRepository';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const mockId = '65eddf5e2f1a2b3c4d5e6f7a';

const createMockResearchWorkDoc = (overrides: Partial<DbResearchWork> = {}): DbResearchWork => ({
  _id: { toString: () => mockId },
  bibliographicDescription: 'Опис',
  author: 'Автор',
  year: '1993',
  keywords: 'музика',
  pdfFile: null,
  url: null,
  status: BaseContentStatuses.Hidden,
  publishedAt: null,
  createdAt: '2026-07-29T10:00:00.000Z',
  updatedAt: '2026-07-29T10:00:00.000Z',
  ...overrides
});

jest.mock('../../db/connect', () => jest.fn());

const saveMock = jest.fn();

describe('researchWorkRepository', () => {
  const MockResearchWorkModel = jest.fn().mockImplementation(() => ({
    save: saveMock
  })) as unknown as Model<DbResearchWork>;

  const repository = ResearchWorkRepository({ ResearchWorkModel: MockResearchWorkModel });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('saves a research work and maps it to an entity', async () => {
      const input: CreateResearchWorkInput = {
        bibliographicDescription: 'Опис',
        author: 'Автор',
        year: '1993',
        keywords: 'музика',
        pdfFile: null,
        url: null,
        status: BaseContentStatuses.Published,
        publishedAt: '2026-09-17T10:00:00.000Z'
      };

      const savedDoc = createMockResearchWorkDoc({
        status: BaseContentStatuses.Published,
        publishedAt: '2026-09-17T10:00:00.000Z'
      });
      saveMock.mockResolvedValue({
        toObject: () => savedDoc
      });

      const result = await repository.create(input);

      expect(MockResearchWorkModel).toHaveBeenCalledWith(input);
      expect(saveMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        id: mockId,
        bibliographicDescription: input.bibliographicDescription,
        author: input.author,
        year: input.year,
        keywords: input.keywords,
        pdfFile: null,
        url: null,
        status: BaseContentStatuses.Published,
        publishedAt: '2026-09-17T10:00:00.000Z',
        createdAt: savedDoc.createdAt,
        updatedAt: savedDoc.updatedAt
      });
    });

    it('maps Date publishedAt to an ISO string', async () => {
      const publishedAt = new Date('2026-09-17T12:00:00.000Z');
      const savedDoc = createMockResearchWorkDoc({
        status: BaseContentStatuses.Published,
        publishedAt
      });
      saveMock.mockResolvedValue({
        toObject: () => savedDoc
      });

      const result = await repository.create({
        bibliographicDescription: 'Опис',
        author: 'Автор',
        year: '1993',
        status: BaseContentStatuses.Published,
        publishedAt: publishedAt.toISOString()
      });

      expect(result.publishedAt).toBe('2026-09-17T12:00:00.000Z');
    });
  });
});
