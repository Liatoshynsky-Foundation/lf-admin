import { GraphQLError } from 'graphql';

import { createMockContext } from '../testUtils';
import { FiltersGQLInput, FundQuery } from './fundQuery';
import { IFundRepository } from '~/src/domain/repositories/fundRepository';

describe('FundQuery Resolvers', () => {
  const mockRepo: jest.Mocked<Partial<IFundRepository>> = {
    findById: jest.fn(),
    findAll: jest.fn(),
    findPaginated: jest.fn(),
  };

  const authorizedContext = createMockContext(true, 'fundRepository', mockRepo);

  beforeEach(() => {
    jest.clearAllMocks();
  });
  const unauthorizedContext = createMockContext(false, 'fundRepository', mockRepo);

  describe('findFundById', () => {
    const mockId = 'some-id';
    it('should throw GraphQLError when admin is falsy', async () => {
      const mockId = 'some-id';
      await expect(FundQuery.findFundById({}, { id: mockId }, unauthorizedContext)).rejects.toThrow(GraphQLError);
    });

    it('should call findById of repo with correct id', async () => {
      await FundQuery.findFundById({}, { id: mockId }, authorizedContext);

      expect(mockRepo.findById).toHaveBeenCalledWith(mockId);
    });
  });

  describe('findAllFunds', () => {
    it('should throw GraphQLError when admin is falsy', async () => {
      await expect(FundQuery.findAllFunds({}, { filters: {} }, unauthorizedContext)).rejects.toThrow(GraphQLError);
    });

    it('should call findAll', async () => {
      await FundQuery.findAllFunds({}, { filters: {} }, authorizedContext);

      expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
    });

    it('should call findAll with all filters', async () => {
      const filters: FiltersGQLInput = {
        search: 'search',
        sort: [{ field: 'fundNumber', order: 'asc' }]
      };
      await FundQuery.findAllFunds({}, { filters: filters }, authorizedContext);

      expect(mockRepo.findAll).toHaveBeenCalledWith({
        search: 'search',
        sort: [{ sortBy: 'fundNumber', sortOrder: 'asc' }],
        languages: undefined,
        limit: undefined,
        skip: undefined,
        statuses: undefined,
        slug: undefined
      });
    });
  });

  describe('findFundsPaginated', () => {
    const paginationParams = {
      limit: 10,
      page: 1,
      filters: {
        search: 'search'
      }
    };
    it('should throw GraphQLError when admin is falsy', async () => {
      await expect(FundQuery.findFundsPaginated({}, paginationParams, unauthorizedContext)).rejects.toThrow(GraphQLError);
    });

    it('should call findPaginated of repo with args', async () => {

      await FundQuery.findFundsPaginated({}, paginationParams, authorizedContext);

      expect(mockRepo.findPaginated).toHaveBeenCalledTimes(1);
      expect(mockRepo.findPaginated).toHaveBeenCalledWith(paginationParams.page, paginationParams.limit, paginationParams.filters);
    });
  });
});