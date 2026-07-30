import { GraphQLError } from 'graphql';

import { createMockContext } from '../testUtils';
import { FiltersGQLInput, FondQuery } from './fondQuery';
import { IFondRepository } from '~/src/domain/repositories/fondRepository';

describe('FondQuery Resolvers', () => {
  const mockRepo: jest.Mocked<Partial<IFondRepository>> = {
    findById: jest.fn(),
    findAll: jest.fn(),
    findPaginated: jest.fn(),
  };

  const authorizedContext = createMockContext(true, 'fondRepository', mockRepo);

  beforeEach(() => {
    jest.clearAllMocks();
  });
  const unauthorizedContext = createMockContext(false, 'fondRepository', mockRepo);

  describe('findFondById', () => {
    const mockId = 'some-id';
    it('should throw GraphQLError when admin is falsy', async () => {
      const mockId = 'some-id';
      await expect(FondQuery.findFondById({}, { id: mockId }, unauthorizedContext)).rejects.toThrow(GraphQLError);
    });

    it('should call findById of repo with correct id', async () => {
      await FondQuery.findFondById({}, { id: mockId }, authorizedContext);

      expect(mockRepo.findById).toHaveBeenCalledWith(mockId);
    });
  });

  describe('findAllFonds', () => {
    it('should throw GraphQLError when admin is falsy', async () => {
      await expect(FondQuery.findAllFonds({}, { filters: {} }, unauthorizedContext)).rejects.toThrow(GraphQLError);
    });

    it('should call findAll', async () => {
      await FondQuery.findAllFonds({}, { filters: {} }, authorizedContext);

      expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
    });

    it('should call findAll with all filters', async () => {
      const filters: FiltersGQLInput = {
        search: 'search',
        sort: [{ field: 'fondNumber', order: 'asc' }]
      };
      await FondQuery.findAllFonds({}, { filters: filters }, authorizedContext);

      expect(mockRepo.findAll).toHaveBeenCalledWith({
        search: 'search',
        sort: [{ sortBy: 'fondNumber', sortOrder: 'asc' }],
        languages: undefined,
        limit: undefined,
        skip: undefined,
        statuses: undefined,
        slug: undefined
      });
    });
  });

  describe('findFondsPaginated', () => {
    const paginationParams = {
      limit: 10,
      page: 1,
      filters: {
        search: 'search'
      }
    };
    it('should throw GraphQLError when admin is falsy', async () => {
      await expect(FondQuery.findFondsPaginated({}, paginationParams, unauthorizedContext)).rejects.toThrow(GraphQLError);
    });

    it('should call findPaginated of repo with args', async () => {

      await FondQuery.findFondsPaginated({}, paginationParams, authorizedContext);

      expect(mockRepo.findPaginated).toHaveBeenCalledTimes(1);
      expect(mockRepo.findPaginated).toHaveBeenCalledWith(paginationParams.page, paginationParams.limit, paginationParams.filters);
    });
  });
});