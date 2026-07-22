import { OpusQuery } from './opusQuery';
import { handleGroup } from './tab-handlers/handleGroup';
import { handleMixed } from './tab-handlers/handleMixed';
import { handleWork } from './tab-handlers/handleWork';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { Opus } from '~/domain/entities/Opus';
import type { ICompositionRepository } from '~/domain/repositories/compositionRepository';
import type { IOpusRepository } from '~/domain/repositories/opusRepository';
import { WorksTab } from '~/types/graphql/generated/graphql';

interface MockCompositionRepository extends ICompositionRepository {
  findByOpusIds: jest.Mock;
}

const mockRepo: jest.Mocked<Partial<IOpusRepository>> = {
  findById: jest.fn(),
  findByNumber: jest.fn(),
  findAll: jest.fn(),
  findPaginated: jest.fn(),
  count: jest.fn()
};

const mockCompositionsRepo: jest.Mocked<Partial<MockCompositionRepository>> = {
  findByOpusId: jest.fn(),
  findByOpusIds: jest.fn(),
  syncForOpus: jest.fn(),
  deleteByOpusId: jest.fn(),
  searchByTitle: jest.fn()
};

jest.mock('./tab-handlers/handleGroup');
jest.mock('./tab-handlers/handleMixed');
jest.mock('./tab-handlers/handleWork');

const mockedHandleGroup = handleGroup as jest.MockedFunction<typeof handleGroup>;
const mockedHandleMixed = handleMixed as jest.MockedFunction<typeof handleMixed>;
const mockedHandleWork = handleWork as jest.MockedFunction<typeof handleWork>;

describe('OpusQuery Resolvers', () => {
  const buildContext = (isAdmin: boolean): GraphQLContext =>
    ({
      admin: isAdmin,
      requestContainer: {
        cradle: { 
          opusRepository: mockRepo as IOpusRepository, 
          compositionsRepository: mockCompositionsRepo as unknown as ICompositionRepository 
        }
      }
    }) as unknown as GraphQLContext;

  const adminContext = buildContext(true);
  const userContext = buildContext(false);

  const mockEntity = { id: '1', number: 'op.1' } as Opus;

  beforeEach(() => {
    jest.clearAllMocks();

    (mockCompositionsRepo.findByOpusId as jest.Mock).mockResolvedValue([]);
    (mockCompositionsRepo.findByOpusIds as jest.Mock).mockResolvedValue([]);
    (mockCompositionsRepo.searchByTitle as jest.Mock).mockResolvedValue([]);

    mockedHandleGroup.mockResolvedValue({
      groups: [],
      works: [],
      total: 0,
      page: 1,
      totalPages: 1
    });

    mockedHandleMixed.mockResolvedValue({
      groups: [],
      works: [],
      total: 0,
      page: 1,
      totalPages: 1
    });

    mockedHandleWork.mockResolvedValue({
      groups: [],
      works: [],
      total: 0,
      page: 1,
      totalPages: 1
    });
  });

  it('opusById should reject unauthenticated requests', async () => {
    await expect(OpusQuery.opusById({}, { id: '1' }, userContext)).rejects.toThrow(
      'You must be logged in to access this resource.'
    );
  });

  it('opusById should call repo.findById and attach compositions', async () => {
    (mockRepo.findById as jest.Mock).mockResolvedValue(mockEntity);

    const result = await OpusQuery.opusById({}, { id: '1' }, adminContext);

    expect(mockRepo.findById).toHaveBeenCalledWith('1');
    expect(mockCompositionsRepo.findByOpusId).toHaveBeenCalledWith('1');
    expect(result).toEqual({ ...mockEntity, compositions: [] });
  });

  it('opusById should return null when opus is not found', async () => {
    (mockRepo.findById as jest.Mock).mockResolvedValue(null);

    const result = await OpusQuery.opusById({}, { id: '1' }, adminContext);

    expect(mockRepo.findById).toHaveBeenCalledWith('1');
    expect(mockCompositionsRepo.findByOpusId).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('opusByNumber should call repo.findByNumber', async () => {
    (mockRepo.findByNumber as jest.Mock).mockResolvedValue(mockEntity);

    const result = await OpusQuery.opusByNumber({}, { number: 'op.1' }, adminContext);

    expect(mockRepo.findByNumber).toHaveBeenCalledWith('op.1');
    expect(result).toEqual(mockEntity);
  });

  it('searchCompositions should call compositionsRepository.searchByTitle with standalone ids', async () => {
    (mockRepo.findAll as jest.Mock).mockResolvedValue([{ compositions: ['c1', 'c2'] }]);
    (mockCompositionsRepo.searchByTitle as jest.Mock).mockResolvedValue([]);

    const result = await OpusQuery.searchCompositions({}, { search: 'Після' }, adminContext);

    expect(mockRepo.findAll).toHaveBeenCalledWith({ numberKind: 'compositions' });
    expect(mockCompositionsRepo.searchByTitle).toHaveBeenCalledWith('Після', ['c1', 'c2']);
    expect(result).toEqual([]);
  });

  it('should call handleGroup for Opus tab', async () => {
    await OpusQuery.paginatedWorks(
      {},
      {
        tab: WorksTab.Opus,
        filters: {
          limit: 10,
          skip: 20
        }
      },
      adminContext
    );

    expect(mockedHandleGroup).toHaveBeenCalledWith(
      WorksTab.Opus,
      mockRepo,
      {
        limit: 10,
        skip: 20
      },
      3,
      mockCompositionsRepo,
      10
    );
  });

  it('should call handleGroup for Woo tab', async () => {
    await OpusQuery.paginatedWorks(
      {},
      {
        tab: WorksTab.Woo,
        filters: {
          limit: 5,
          skip: 5
        }
      },
      adminContext
    );

    expect(mockedHandleGroup).toHaveBeenCalledWith(
      WorksTab.Woo,
      mockRepo,
      {
        limit: 5,
        skip: 5
      },
      2,
      mockCompositionsRepo,
      5
    );
  });

  it('should call handleWork', async () => {
    await OpusQuery.paginatedWorks(
      {},
      {
        tab: WorksTab.Compositions,
        filters: {
          limit: 25,
          skip: 50
        }
      },
      adminContext
    );

    expect(mockedHandleWork).toHaveBeenCalledWith(
      WorksTab.Compositions,
      mockRepo,
      mockCompositionsRepo,
      {
        limit: 25,
        skip: 50
      },
      3,
      25
    );
  });

  it('should call handleMixed when tab is undefined', async () => {
    await OpusQuery.paginatedWorks({}, {}, adminContext);

    expect(mockedHandleMixed).toHaveBeenCalledWith(
      mockRepo,
      mockCompositionsRepo,
      undefined,
      1,
      10
    );
  });

  it('should call handleMixed for All tab', async () => {
    await OpusQuery.paginatedWorks(
      {},
      {
        tab: WorksTab.All,
        filters: {
          limit: 15,
          skip: 15
        }
      },
      adminContext
    );

    expect(mockedHandleMixed).toHaveBeenCalledWith(
      mockRepo,
      mockCompositionsRepo,
      {
        limit: 15,
        skip: 15
      },
      2,
      15
    );
  });
});
