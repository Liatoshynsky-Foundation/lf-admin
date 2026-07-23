import { WorksFilter } from '../opusQuery';
import { handleGroup } from './handleGroup';
import { attachCompositionsToGroups, mappedGroups, totalPages } from './tabHandlersHelpers';
import { ICompositionRepository } from '~/src/domain/repositories/compositionRepository';
import { IOpusRepository } from '~/src/domain/repositories/opusRepository';
import { WorksTab } from '~/types/graphql/generated/graphql';

jest.mock('./tabHandlersHelpers', () => ({
  mappedGroups: jest.fn(),
  attachCompositionsToGroups: jest.fn(),
  totalPages: jest.fn((total: number, pageSize: number) => Math.ceil(total / pageSize)),
}));

type MappedGroupsResult = Awaited<ReturnType<typeof mappedGroups>>;
type AttachResult = Awaited<ReturnType<typeof attachCompositionsToGroups>>;

describe('handleGroup', () => {
  const MOCK_GROUPS = [{ id: '1', number: 'op.1' }, { id: '2', number: 'op.2' }];
  const MOCK_ATTACHED_GROUPS = [
    { id: '1', number: 'op.1', compositions: [{ id: 'c1' }] },
    { id: '2', number: 'op.2', compositions: [] },
  ];
  const MOCK_FILTERS: WorksFilter = { search: 'test' };
  const DEFAULT_PAGE = 1;
  const DEFAULT_PAGE_SIZE = 10;
  const TOTAL_ITEMS = 2;

  const mockMappedGroups = mappedGroups as jest.MockedFunction<typeof mappedGroups>;
  const mockAttachCompositionsToGroups = attachCompositionsToGroups as jest.MockedFunction<
    typeof attachCompositionsToGroups
  >;
  const mockTotalPages = totalPages as jest.MockedFunction<typeof totalPages>;

  const repoMock = {} as jest.Mocked<IOpusRepository>;
  const compositionsRepoMock = {} as jest.Mocked<ICompositionRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockMappedGroups.mockResolvedValue({
      groups: MOCK_GROUPS,
      total: TOTAL_ITEMS,
    } as unknown as MappedGroupsResult);

    mockAttachCompositionsToGroups.mockResolvedValue(
      MOCK_ATTACHED_GROUPS as unknown as AttachResult
    );
  });

  it('should return opus groups with compositions', async () => {
    const result = await handleGroup(
      WorksTab.Op,
      repoMock,
      compositionsRepoMock,
      undefined,
      DEFAULT_PAGE,
      DEFAULT_PAGE_SIZE
    );

    expect(mockMappedGroups).toHaveBeenCalledWith(repoMock, WorksTab.Op, undefined);
    expect(mockAttachCompositionsToGroups).toHaveBeenCalledWith(
      MOCK_GROUPS,
      compositionsRepoMock
    );
    expect(mockTotalPages).toHaveBeenCalledWith(TOTAL_ITEMS, DEFAULT_PAGE_SIZE);

    expect(result).toEqual({
      groups: MOCK_ATTACHED_GROUPS,
      works: [],
      total: TOTAL_ITEMS,
      page: DEFAULT_PAGE,
      totalPages: 1,
    });
  });

  it('should process Sineop tab correctly', async () => {
    mockMappedGroups.mockResolvedValue({
      groups: [],
      total: 0,
    } as unknown as MappedGroupsResult);
    mockAttachCompositionsToGroups.mockResolvedValue([] as unknown as AttachResult);

    const result = await handleGroup(
      WorksTab.Sineop,
      repoMock,
      compositionsRepoMock,
      undefined,
      DEFAULT_PAGE,
      DEFAULT_PAGE_SIZE
    );

    expect(mockMappedGroups).toHaveBeenCalledWith(repoMock, WorksTab.Sineop, undefined);
    expect(result.groups).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('should return empty groups when mappedGroups returns no items', async () => {
    mockMappedGroups.mockResolvedValue({
      groups: [],
      total: 0,
    } as unknown as MappedGroupsResult);
    mockAttachCompositionsToGroups.mockResolvedValue([] as unknown as AttachResult);

    const result = await handleGroup(
      WorksTab.Op,
      repoMock,
      compositionsRepoMock,
      undefined,
      DEFAULT_PAGE,
      DEFAULT_PAGE_SIZE
    );

    expect(result).toEqual({
      groups: [],
      works: [],
      total: 0,
      page: DEFAULT_PAGE,
      totalPages: 0,
    });
  });

  it('should calculate totalPages accurately for pagination', async () => {
    const page = 3;
    const pageSize = 10;
    const total = 21;

    mockMappedGroups.mockResolvedValue({
      groups: [],
      total,
    } as unknown as MappedGroupsResult);
    mockAttachCompositionsToGroups.mockResolvedValue([] as unknown as AttachResult);

    const result = await handleGroup(
      WorksTab.Op,
      repoMock,
      compositionsRepoMock,
      undefined,
      page,
      pageSize
    );

    expect(mockTotalPages).toHaveBeenCalledWith(total, pageSize);
    expect(result.page).toBe(page);
    expect(result.totalPages).toBe(3);
  });

  it('should pass filters to mappedGroups helper', async () => {
    await handleGroup(
      WorksTab.Op,
      repoMock,
      compositionsRepoMock,
      MOCK_FILTERS,
      DEFAULT_PAGE,
      DEFAULT_PAGE_SIZE
    );

    expect(mockMappedGroups).toHaveBeenCalledWith(repoMock, WorksTab.Op, MOCK_FILTERS);
  });
});
