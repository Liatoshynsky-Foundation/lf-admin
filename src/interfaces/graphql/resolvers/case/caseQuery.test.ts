import { GraphQLError } from 'graphql';

import { createMockContext } from '../testUtils';
import { CaseQuery, FiltersGQLInput } from './caseQuery';
import { ICaseRepository } from '~/src/domain/repositories/caseRepository';

describe('CaseQuery Resolvers', () => {
  const mockRepo: jest.Mocked<Partial<ICaseRepository>> = {
    findById: jest.fn(),
    findAll: jest.fn(),
    findPaginated: jest.fn()
  };

  const authorizedContext = createMockContext(true, 'caseRepository', mockRepo);
  const unauthorizedContext = createMockContext(false, 'caseRepository', mockRepo);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('caseById', () => {
    const mockId = 'some-id';

    it('should throw GraphQLError when admin is falsy', async () => {
      await expect(CaseQuery.caseById({}, { id: mockId }, unauthorizedContext)).rejects.toThrow(GraphQLError);
    });

    it('should call findById of repo with correct id', async () => {
      await CaseQuery.caseById({}, { id: mockId }, authorizedContext);

      expect(mockRepo.findById).toHaveBeenCalledWith(mockId);
    });
  });

  describe('allCases', () => {
    it('should throw GraphQLError when admin is falsy', async () => {
      await expect(CaseQuery.allCases({}, { filters: {} }, unauthorizedContext)).rejects.toThrow(GraphQLError);
    });

    it('should call findAll', async () => {
      await CaseQuery.allCases({}, { filters: {} }, authorizedContext);

      expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
    });

    it('should pass undefined to findAll when filters argument is not provided', async () => {
      await CaseQuery.allCases({}, { filters: undefined as unknown as FiltersGQLInput }, authorizedContext);

      expect(mockRepo.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should call findAll with all filters including fundId', async () => {
      const filters: FiltersGQLInput = {
        search: 'search',
        fundId: 'fund-id',
        statuses: ['published'],
        sort: [{ field: 'caseNumber', order: 'asc' }]
      };
      await CaseQuery.allCases({}, { filters }, authorizedContext);

      expect(mockRepo.findAll).toHaveBeenCalledWith({
        search: 'search',
        sort: [{ sortBy: 'caseNumber', sortOrder: 'asc' }],
        languages: undefined,
        limit: undefined,
        skip: undefined,
        statuses: ['published'],
        slug: undefined,
        fundId: 'fund-id'
      });
    });

  });

  describe('paginatedCases', () => {
    const paginationParams = {
      limit: 10,
      page: 1,
      filters: {
        search: 'search'
      }
    };

    it('should throw GraphQLError when admin is falsy', async () => {
      await expect(CaseQuery.paginatedCases({}, paginationParams, unauthorizedContext)).rejects.toThrow(GraphQLError);
    });

    it('should call findPaginated of repo with args', async () => {
      await CaseQuery.paginatedCases({}, paginationParams, authorizedContext);

      expect(mockRepo.findPaginated).toHaveBeenCalledTimes(1);
      expect(mockRepo.findPaginated).toHaveBeenCalledWith(
        paginationParams.page,
        paginationParams.limit,
        expect.objectContaining({ search: 'search' })
      );
    });
  });
});
