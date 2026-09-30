import { GraphQLError } from 'graphql';

import { createMockContext } from '../testUtils';
import { ResearchWorkQuery } from './researchWorkQuery';
import { IResearchWorkRepository } from '~/src/domain/repositories/researchWorkRepository';

describe('ResearchWorkQuery', () => {
  const mockRepo: jest.Mocked<Partial<IResearchWorkRepository>> = {
    findById: jest.fn(),
    findAll: jest.fn(),
    findPaginated: jest.fn()
  };

  const authorizedContext = createMockContext(true, 'researchWorkRepository', mockRepo);
  const unauthorizedContext = createMockContext(false, 'researchWorkRepository', mockRepo);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('researchWorkById', () => {
    const mockId = 'some-id';

    it('throws GraphQLError when admin is falsy', async () => {
      await expect(ResearchWorkQuery.researchWorkById({}, { id: mockId }, unauthorizedContext)).rejects.toThrow(
        GraphQLError
      );
    });

    it('calls findById with the correct id', async () => {
      await ResearchWorkQuery.researchWorkById({}, { id: mockId }, authorizedContext);

      expect(mockRepo.findById).toHaveBeenCalledWith(mockId);
    });
  });

  describe('allResearchWorks', () => {
    it('throws GraphQLError when admin is falsy', async () => {
      await expect(ResearchWorkQuery.allResearchWorks({}, { filters: {} }, unauthorizedContext)).rejects.toThrow(
        GraphQLError
      );
    });

    it('calls findAll', async () => {
      await ResearchWorkQuery.allResearchWorks({}, { filters: {} }, authorizedContext);

      expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
    });

    it('maps filters for findAll', async () => {
      const filters = {
        search: 'ліатошинський',
        statuses: ['published'],
        sort: [{ field: 'author', order: 'asc' }]
      };

      await ResearchWorkQuery.allResearchWorks({}, { filters }, authorizedContext);

      expect(mockRepo.findAll).toHaveBeenCalledWith({
        search: 'ліатошинський',
        sort: [{ sortBy: 'author', sortOrder: 'asc' }],
        languages: undefined,
        limit: undefined,
        skip: undefined,
        statuses: ['published'],
        slug: undefined
      });
    });
  });

  describe('paginatedResearchWorks', () => {
    const paginationParams = {
      limit: 8,
      page: 1,
      filters: {
        search: 'search'
      }
    };

    it('throws GraphQLError when admin is falsy', async () => {
      await expect(
        ResearchWorkQuery.paginatedResearchWorks({}, paginationParams, unauthorizedContext)
      ).rejects.toThrow(GraphQLError);
    });

    it('calls findPaginated with args', async () => {
      await ResearchWorkQuery.paginatedResearchWorks({}, paginationParams, authorizedContext);

      expect(mockRepo.findPaginated).toHaveBeenCalledWith(
        paginationParams.page,
        paginationParams.limit,
        expect.objectContaining({ search: 'search' })
      );
    });
  });
});
