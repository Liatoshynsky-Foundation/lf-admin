import { createMockContext } from '../testUtils';
import { FondQuery } from './fondQuery';
import { IFondRepository } from '~/src/domain/repositories/fondRepository';

describe('FondQuery Resolvers', () => {
  const mockRepo: jest.Mocked<Partial<IFondRepository>> = {
    findById: jest.fn(),
    findAll: jest.fn(),
    findPaginated: jest.fn(),
    findByFondNumber: jest.fn(),
  };

  const context = createMockContext(true, 'fondRepository', mockRepo);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fondById should call findById of repo with correct id', async () => {
    const mockId = 'some-id';
    await FondQuery.fondById({}, { id: mockId }, context);

    expect(mockRepo.findById).toHaveBeenCalledWith(mockId);
  });

  it('findAllFonds should call findAll', async () => {
    await FondQuery.findAllFonds({}, {}, context);

    expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
  });

  it('findFondsPaginated should call findPaginated of repo with args', async () => {
    const paginationParams = {
      limit: 10, page: 1, filters: {
        search: 'search'
      }
    };
    await FondQuery.findFondsPaginated({}, paginationParams, context);

    expect(mockRepo.findPaginated).toHaveBeenCalledTimes(1);
    expect(mockRepo.findPaginated).toHaveBeenCalledWith(paginationParams.page, paginationParams.limit, paginationParams.filters);
  });
});