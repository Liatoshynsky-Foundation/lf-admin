import { GraphQLError } from 'graphql';

import { createMockContext } from '../testUtils';
import { ResearchWorkMutation } from './researchWorkMutation';
import { graphqlErrors, ResearchWorkErrorCodes, ResearchWorkErrors } from '~/constants/errors';
import { ResearchWork } from '~/src/domain/entities/ResearchWork';
import {
  CreateResearchWorkInput,
  IResearchWorkRepository,
  UpdateResearchWorkInput
} from '~/src/domain/repositories/researchWorkRepository';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const mockId = '65eddf5e2f1a2b3c4d5e6f7a';

const createMockCreateInput = (overrides: Partial<CreateResearchWorkInput> = {}): CreateResearchWorkInput => ({
  bibliographicDescription: 'Опис роботи',
  author: 'Автор',
  year: '1993',
  keywords: 'музика',
  pdfFile: null,
  url: null,
  status: BaseContentStatuses.Hidden,
  publishedAt: null,
  ...overrides
});

const createMockEntity = (overrides: Partial<ResearchWork> = {}): ResearchWork => ({
  id: mockId,
  bibliographicDescription: 'Опис роботи',
  author: 'Автор',
  year: '1993',
  keywords: 'музика',
  pdfFile: null,
  url: null,
  status: BaseContentStatuses.Hidden,
  publishedAt: null,
  createdAt: '2026-09-17T10:00:00.000Z',
  updatedAt: '2026-09-17T10:00:00.000Z',
  ...overrides
});

const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockFindById = jest.fn();

const mockRepo: Partial<IResearchWorkRepository> = {
  create: mockCreate,
  update: mockUpdate,
  delete: mockDelete,
  findById: mockFindById
};

const adminContext = createMockContext(true, 'researchWorkRepository', mockRepo);
const userContext = createMockContext(false, 'researchWorkRepository', mockRepo);

describe('ResearchWorkMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createResearchWork', () => {
    it('throws if user is not an admin', async () => {
      const input = createMockCreateInput();

      await expect(ResearchWorkMutation.createResearchWork({}, { input }, userContext)).rejects.toEqual(
        new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
          extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
        })
      );
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('throws BAD_USER_INPUT for invalid input', async () => {
      const input = createMockCreateInput({ bibliographicDescription: '' });

      await expect(ResearchWorkMutation.createResearchWork({}, { input }, adminContext)).rejects.toMatchObject({
        message: expect.stringContaining('Бібліографічний опис'),
        extensions: {
          code: 'BAD_USER_INPUT',
          issues: expect.arrayContaining([
            expect.objectContaining({ path: 'bibliographicDescription' })
          ])
        }
      });
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('rejects a non-PDF file with BAD_USER_INPUT', async () => {
      const input = createMockCreateInput({
        pdfFile: { filename: 'scan.png', url: 'https://cdn/scan.png', mimeType: 'image/png' }
      });

      await expect(ResearchWorkMutation.createResearchWork({}, { input }, adminContext)).rejects.toMatchObject({
        extensions: { code: 'BAD_USER_INPUT' }
      });
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('rejects an invalid URL with BAD_USER_INPUT', async () => {
      const input = createMockCreateInput({ url: 'not-a-url' });

      await expect(ResearchWorkMutation.createResearchWork({}, { input }, adminContext)).rejects.toMatchObject({
        message: expect.stringContaining('посилання'),
        extensions: { code: 'BAD_USER_INPUT' }
      });
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('accepts keywords: null and maps it to null', async () => {
      const input = createMockCreateInput({ keywords: null });
      mockCreate.mockResolvedValue(createMockEntity({ keywords: null }));

      await ResearchWorkMutation.createResearchWork({}, { input }, adminContext);

      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ keywords: null }));
    });

    it('rejects draft status on create with BAD_USER_INPUT', async () => {
      const input = createMockCreateInput({ status: BaseContentStatuses.Draft });

      await expect(ResearchWorkMutation.createResearchWork({}, { input }, adminContext)).rejects.toMatchObject({
        extensions: { code: 'BAD_USER_INPUT' }
      });
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('allows both pdfFile and url together', async () => {
      const input = createMockCreateInput({
        pdfFile: { filename: 'doc.pdf', url: 'https://cdn/doc.pdf', mimeType: 'application/pdf' },
        url: 'https://example.com/work'
      });
      mockCreate.mockResolvedValue(createMockEntity());

      await ResearchWorkMutation.createResearchWork({}, { input }, adminContext);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          pdfFile: input.pdfFile,
          url: input.url
        })
      );
    });

    it('defaults status to Published when omitted', async () => {
      const { status: _status, ...inputWithoutStatus } = createMockCreateInput();
      mockCreate.mockResolvedValue(createMockEntity({ status: BaseContentStatuses.Published }));

      await ResearchWorkMutation.createResearchWork(
        {},
        { input: inputWithoutStatus as CreateResearchWorkInput },
        adminContext
      );

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: BaseContentStatuses.Published,
          publishedAt: expect.any(String)
        })
      );
    });

    it('sets publishedAt when creating with Published status', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-09-17T12:00:00.000Z'));
      const input = createMockCreateInput({
        status: BaseContentStatuses.Published,
        publishedAt: null
      });
      mockCreate.mockResolvedValue(createMockEntity({ status: BaseContentStatuses.Published }));

      await ResearchWorkMutation.createResearchWork({}, { input }, adminContext);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: BaseContentStatuses.Published,
          publishedAt: '2026-09-17T12:00:00.000Z'
        })
      );
      jest.useRealTimers();
    });

    it('keeps an explicit publishedAt when provided', async () => {
      const publishedAt = '2026-01-01T00:00:00.000Z';
      const input = createMockCreateInput({
        status: BaseContentStatuses.Published,
        publishedAt
      });
      mockCreate.mockResolvedValue(createMockEntity({ status: BaseContentStatuses.Published, publishedAt }));

      await ResearchWorkMutation.createResearchWork({}, { input }, adminContext);

      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ publishedAt }));
    });

    it('does not set publishedAt for Hidden status', async () => {
      const input = createMockCreateInput({ status: BaseContentStatuses.Hidden, publishedAt: null });
      mockCreate.mockResolvedValue(createMockEntity());

      await ResearchWorkMutation.createResearchWork({}, { input }, adminContext);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: BaseContentStatuses.Hidden,
          publishedAt: null
        })
      );
    });

    it('calls repo.create and returns the created entity', async () => {
      const input = createMockCreateInput();
      const created = createMockEntity();
      mockCreate.mockResolvedValue(created);

      const result = await ResearchWorkMutation.createResearchWork({}, { input }, adminContext);

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(result).toEqual(created);
    });
  });

  describe('updateResearchWork', () => {
    const updateInput: UpdateResearchWorkInput = { author: 'Новий автор' };

    it('throws if user is not an admin', async () => {
      await expect(
        ResearchWorkMutation.updateResearchWork({}, { id: mockId, input: updateInput }, userContext)
      ).rejects.toEqual(
        new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
          extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
        })
      );
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('throws when research work does not exist', async () => {
      mockFindById.mockResolvedValue(null);

      await expect(
        ResearchWorkMutation.updateResearchWork({}, { id: mockId, input: updateInput }, adminContext)
      ).rejects.toEqual(
        new GraphQLError(ResearchWorkErrors.RESEARCH_WORK_NOT_FOUND(mockId), {
          extensions: { code: ResearchWorkErrorCodes.RESEARCH_WORK_NOT_FOUND }
        })
      );
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('updates and returns the entity', async () => {
      const current = createMockEntity();
      const updated = createMockEntity({ author: 'Новий автор' });
      mockFindById.mockResolvedValue(current);
      mockUpdate.mockResolvedValue(updated);

      const result = await ResearchWorkMutation.updateResearchWork(
        {},
        { id: mockId, input: updateInput },
        adminContext
      );

      expect(mockUpdate).toHaveBeenCalledWith(mockId, expect.objectContaining({ author: 'Новий автор' }));
      expect(result).toEqual(updated);
    });

    it('clears keywords when null is sent', async () => {
      const current = createMockEntity();
      mockFindById.mockResolvedValue(current);
      mockUpdate.mockResolvedValue(createMockEntity({ keywords: null }));

      await ResearchWorkMutation.updateResearchWork(
        {},
        { id: mockId, input: { keywords: null } },
        adminContext
      );

      expect(mockUpdate).toHaveBeenCalledWith(mockId, expect.objectContaining({ keywords: null }));
    });

    it('does not wipe url or keywords when they are omitted from the update', async () => {
      const current = createMockEntity({
        url: 'https://example.com/existing',
        keywords: 'існуючі'
      });
      mockFindById.mockResolvedValue(current);
      mockUpdate.mockResolvedValue(createMockEntity({ author: 'Новий автор' }));

      await ResearchWorkMutation.updateResearchWork(
        {},
        { id: mockId, input: { author: 'Новий автор' } },
        adminContext
      );

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      const [, payload] = mockUpdate.mock.calls[0] as [string, Record<string, unknown>];
      expect(payload).toEqual({ author: 'Новий автор' });
      expect(payload).not.toHaveProperty('url');
      expect(payload).not.toHaveProperty('keywords');
    });

    it('throws BAD_USER_INPUT for invalid update input', async () => {
      await expect(
        ResearchWorkMutation.updateResearchWork(
          {},
          { id: mockId, input: { bibliographicDescription: '' } },
          adminContext
        )
      ).rejects.toMatchObject({
        extensions: { code: 'BAD_USER_INPUT' }
      });
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('sets publishedAt when publishing a previously hidden work', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-09-17T15:00:00.000Z'));
      const current = createMockEntity({ status: BaseContentStatuses.Hidden, publishedAt: null });
      mockFindById.mockResolvedValue(current);
      mockUpdate.mockResolvedValue(createMockEntity({ status: BaseContentStatuses.Published }));

      await ResearchWorkMutation.updateResearchWork(
        {},
        { id: mockId, input: { status: BaseContentStatuses.Published } },
        adminContext
      );

      expect(mockUpdate).toHaveBeenCalledWith(
        mockId,
        expect.objectContaining({
          status: BaseContentStatuses.Published,
          publishedAt: '2026-09-17T15:00:00.000Z'
        })
      );
      jest.useRealTimers();
    });

    it('preserves existing publishedAt when publishing again', async () => {
      const publishedAt = '2026-01-01T00:00:00.000Z';
      const current = createMockEntity({ status: BaseContentStatuses.Hidden, publishedAt });
      mockFindById.mockResolvedValue(current);
      mockUpdate.mockResolvedValue(createMockEntity({ status: BaseContentStatuses.Published, publishedAt }));

      await ResearchWorkMutation.updateResearchWork(
        {},
        { id: mockId, input: { status: BaseContentStatuses.Published } },
        adminContext
      );

      expect(mockUpdate).toHaveBeenCalledWith(mockId, expect.objectContaining({ publishedAt }));
    });

    it('throws when repo.update returns null', async () => {
      mockFindById.mockResolvedValue(createMockEntity());
      mockUpdate.mockResolvedValue(null);

      await expect(
        ResearchWorkMutation.updateResearchWork({}, { id: mockId, input: updateInput }, adminContext)
      ).rejects.toEqual(
        new GraphQLError(ResearchWorkErrors.RESEARCH_WORK_NOT_FOUND(mockId), {
          extensions: { code: ResearchWorkErrorCodes.RESEARCH_WORK_NOT_FOUND }
        })
      );
    });
  });

  describe('updateResearchWorkStatus', () => {
    it('throws if user is not an admin', async () => {
      await expect(
        ResearchWorkMutation.updateResearchWorkStatus(
          {},
          { id: mockId, input: { status: BaseContentStatuses.Published } },
          userContext
        )
      ).rejects.toEqual(
        new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
          extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
        })
      );
    });

    it('throws when research work does not exist', async () => {
      mockFindById.mockResolvedValue(null);

      await expect(
        ResearchWorkMutation.updateResearchWorkStatus(
          {},
          { id: mockId, input: { status: BaseContentStatuses.Hidden } },
          adminContext
        )
      ).rejects.toEqual(
        new GraphQLError(ResearchWorkErrors.RESEARCH_WORK_NOT_FOUND(mockId), {
          extensions: { code: ResearchWorkErrorCodes.RESEARCH_WORK_NOT_FOUND }
        })
      );
    });

    it('updates status to Hidden', async () => {
      mockFindById.mockResolvedValue(createMockEntity({ status: BaseContentStatuses.Published }));
      mockUpdate.mockResolvedValue(createMockEntity({ status: BaseContentStatuses.Hidden }));

      await ResearchWorkMutation.updateResearchWorkStatus(
        {},
        { id: mockId, input: { status: BaseContentStatuses.Hidden } },
        adminContext
      );

      expect(mockUpdate).toHaveBeenCalledWith(
        mockId,
        expect.objectContaining({ status: BaseContentStatuses.Hidden })
      );
    });

    it('sets publishedAt when status becomes Published', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-09-17T16:00:00.000Z'));
      mockFindById.mockResolvedValue(createMockEntity({ publishedAt: null }));
      mockUpdate.mockResolvedValue(createMockEntity({ status: BaseContentStatuses.Published }));

      await ResearchWorkMutation.updateResearchWorkStatus(
        {},
        { id: mockId, input: { status: BaseContentStatuses.Published } },
        adminContext
      );

      expect(mockUpdate).toHaveBeenCalledWith(
        mockId,
        expect.objectContaining({
          status: BaseContentStatuses.Published,
          publishedAt: '2026-09-17T16:00:00.000Z'
        })
      );
      jest.useRealTimers();
    });
  });

  describe('deleteResearchWork', () => {
    it('throws if user is not an admin', async () => {
      await expect(ResearchWorkMutation.deleteResearchWork({}, { id: mockId }, userContext)).rejects.toEqual(
        new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
          extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
        })
      );
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('calls repo.delete and returns the result', async () => {
      mockDelete.mockResolvedValue(true);

      const result = await ResearchWorkMutation.deleteResearchWork({}, { id: mockId }, adminContext);

      expect(mockDelete).toHaveBeenCalledWith(mockId);
      expect(result).toBe(true);
    });
  });
});
