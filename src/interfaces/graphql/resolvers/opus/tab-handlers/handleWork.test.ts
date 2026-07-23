import { handleWork } from './handleWork';
import { mappedCompositions, mappedGroups, totalCompositions } from './tabHandlersHelpers';
import { Composition } from '~/domain/entities/Composition';
import { Opus } from '~/src/domain/entities/Opus';
import { ICompositionRepository } from '~/src/domain/repositories/compositionRepository';
import { IOpusRepository } from '~/src/domain/repositories/opusRepository';
import { WorksTab } from '~/types/graphql/generated/graphql';

jest.mock('./tabHandlersHelpers', () => ({
  mappedGroups: jest.fn(),
  totalCompositions: jest.fn(),
  mappedCompositions: jest.fn(),
  totalPages: jest.fn((total: number, pageSize: number) => Math.ceil(total / pageSize)),
}));

describe('handleWork', () => {
  const MOCK_TAB = WorksTab.Compositions;
  const MOCK_COMPOSITION_IDS = ['comp-1', 'comp-2'];
  const MOCK_WORKS = [{ id: 'work-1' }] as unknown as Composition[];
  const MOCK_TOTAL = 10;
  const MOCK_PAGE = 1;
  const MOCK_PAGE_SIZE = 5;
  const MOCK_FILTERS = { search: 'test' };

  const opusRepoMock: jest.Mocked<IOpusRepository> = {
    count: jest.fn(),
    findAll: jest.fn(),
  } as unknown as jest.Mocked<IOpusRepository>;

  const compositionRepoMock: jest.Mocked<ICompositionRepository> = {
    findByIds: jest.fn(),
    findByIdsPaginated: jest.fn(),
    countByIds: jest.fn(),
  } as unknown as jest.Mocked<ICompositionRepository>;

  const mockMappedGroups = mappedGroups as jest.MockedFunction<typeof mappedGroups>;
  const mockTotalCompositions = totalCompositions as jest.MockedFunction<typeof totalCompositions>;
  const mockMappedCompositions = mappedCompositions as jest.MockedFunction<typeof mappedCompositions>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle work and return paginated result successfully', async () => {
    mockMappedGroups.mockResolvedValue([
      { compositions: MOCK_COMPOSITION_IDS } as unknown as Opus,
    ]);
    mockTotalCompositions.mockResolvedValue(MOCK_TOTAL);
    mockMappedCompositions.mockResolvedValue(MOCK_WORKS);

    const result = await handleWork(
      MOCK_TAB,
      opusRepoMock,
      compositionRepoMock,
      MOCK_FILTERS,
      MOCK_PAGE,
      MOCK_PAGE_SIZE
    );

    expect(mockMappedGroups).toHaveBeenCalledWith(opusRepoMock, MOCK_TAB);
    expect(mockTotalCompositions).toHaveBeenCalledWith(compositionRepoMock, MOCK_COMPOSITION_IDS, MOCK_FILTERS);
    expect(mockMappedCompositions).toHaveBeenCalledWith(
      compositionRepoMock,
      MOCK_COMPOSITION_IDS,
      MOCK_PAGE,
      MOCK_PAGE_SIZE,
      MOCK_FILTERS
    );

    expect(result).toEqual({
      groups: [],
      works: MOCK_WORKS,
      total: MOCK_TOTAL,
      page: MOCK_PAGE,
      totalPages: 2,
    });
  });

  it('should handle empty compositions array when groups result is empty', async () => {
    mockMappedGroups.mockResolvedValue([]);
    mockTotalCompositions.mockResolvedValue(0);
    mockMappedCompositions.mockResolvedValue([]);

    const result = await handleWork(
      MOCK_TAB,
      opusRepoMock,
      compositionRepoMock,
      undefined,
      MOCK_PAGE,
      MOCK_PAGE_SIZE
    );

    expect(mockTotalCompositions).toHaveBeenCalledWith(compositionRepoMock, [], undefined);
    expect(mockMappedCompositions).toHaveBeenCalledWith(compositionRepoMock, [], MOCK_PAGE, MOCK_PAGE_SIZE, undefined);

    expect(result).toEqual({
      groups: [],
      works: [],
      total: 0,
      page: MOCK_PAGE,
      totalPages: 0,
    });
  });
});
