import { WorksFilter } from '../opusQuery';
import { handleMixed } from './handleMixed';
import {
  attachCompositionsToGroups,
  mappedCompositions,
  mappedGroups,
  totalCompositions,
  totalGroups,
  totalPages,
} from './tabHandlersHelpers';
import { ICompositionRepository } from '~/domain/repositories/compositionRepository';
import { IOpusRepository } from '~/src/domain/repositories/opusRepository';
import { OpusNumberKind, WorksTab } from '~/types/graphql/generated/graphql';

jest.mock('./tabHandlersHelpers', () => ({
  totalGroups: jest.fn((_repo, tab) => (tab === WorksTab.Op ? 10 : 10)),
  mappedGroups: jest.fn(),
  attachCompositionsToGroups: jest.fn(),
  totalCompositions: jest.fn(),
  mappedCompositions: jest.fn(),
  totalPages: jest.fn((total: number, pageSize: number) => Math.ceil(total / pageSize)),
}));

type MappedGroupsResult = Awaited<ReturnType<typeof mappedGroups>>;
type MappedCompositionsResult = Awaited<ReturnType<typeof mappedCompositions>>;
type AttachResult = Awaited<ReturnType<typeof attachCompositionsToGroups>>;

describe('handleMixed', () => {
  const MOCK_OP_GROUP = { id: 'op-1', compositions: [] };
  const MOCK_SINEOP_GROUP = { id: 'sineop-1', compositions: [] };
  const MOCK_ATTACHED_OP_GROUP = { id: 'op-1', compositions: [{ id: 'c1' }] };
  const MOCK_ATTACHED_SINEOP_GROUP = { id: 'sineop-1', compositions: [{ id: 'c2' }] };
  const MOCK_WORK = { id: 'w1' };
  const MOCK_COMPOSITION_IDS = ['comp-1', 'comp-2'];
  const MOCK_FILTERS: WorksFilter = { search: 'test' };

  const mockTotalGroups = totalGroups as jest.MockedFunction<typeof totalGroups>;
  const mockMappedGroups = mappedGroups as jest.MockedFunction<typeof mappedGroups>;
  const mockAttachCompositionsToGroups = attachCompositionsToGroups as jest.MockedFunction<
    typeof attachCompositionsToGroups
  >;
  const mockTotalCompositions = totalCompositions as jest.MockedFunction<
    typeof totalCompositions
  >;
  const mockMappedCompositions = mappedCompositions as jest.MockedFunction<
    typeof mappedCompositions
  >;
  const mockTotalPages = totalPages as jest.MockedFunction<typeof totalPages>;

  const repoMock = {
    findAll: jest.fn(),
  } as unknown as jest.Mocked<IOpusRepository>;

  const compositionsRepoMock = {} as jest.Mocked<ICompositionRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTotalGroups.mockImplementation((_repo, tab) => Promise.resolve(tab === WorksTab.Op ? 5 : 5));

    repoMock.findAll.mockResolvedValue([
      { compositions: MOCK_COMPOSITION_IDS },
    ] as Awaited<ReturnType<IOpusRepository['findAll']>>);

    mockMappedGroups.mockImplementation((_repo, tab, _filters, _skip, _limit) => {
      if (tab === WorksTab.Op) {
        return Promise.resolve([MOCK_OP_GROUP] as unknown as MappedGroupsResult);
      }
      return Promise.resolve([MOCK_SINEOP_GROUP] as unknown as MappedGroupsResult);
    });

    mockAttachCompositionsToGroups.mockImplementation((groups) => {
      if (groups.some((g) => (g as unknown as { id: string }).id === MOCK_OP_GROUP.id)) {
        return Promise.resolve([MOCK_ATTACHED_OP_GROUP] as unknown as AttachResult);
      }
      return Promise.resolve([MOCK_ATTACHED_SINEOP_GROUP] as unknown as AttachResult);
    });

    mockTotalCompositions.mockResolvedValue(10);
    mockMappedCompositions.mockResolvedValue([MOCK_WORK] as unknown as MappedCompositionsResult);
  });

  it('should process first page containing only Op groups', async () => {
    const result = await handleMixed(repoMock, compositionsRepoMock, MOCK_FILTERS, 1, 2);

    expect(repoMock.findAll).toHaveBeenCalledWith({ numberKind: OpusNumberKind.Compositions });
    expect(mockMappedGroups).toHaveBeenCalledWith(repoMock, WorksTab.Op, MOCK_FILTERS, 0, 2);
    expect(mockTotalCompositions).toHaveBeenCalledWith(compositionsRepoMock, MOCK_COMPOSITION_IDS, MOCK_FILTERS);

    expect(mockAttachCompositionsToGroups).toHaveBeenCalledWith([MOCK_OP_GROUP], compositionsRepoMock);
    expect(mockMappedCompositions).not.toHaveBeenCalled();

    expect(result).toEqual({
      groups: [MOCK_ATTACHED_OP_GROUP],
      works: [],
      total: 20,
      page: 1,
      totalPages: 10,
    });
  });

  it('should process page spanning from Op groups into Sineop groups', async () => {
    const opGroup1 = { id: 'op-1', compositions: [] };
    const opGroup2 = { id: 'op-2', compositions: [] };
    const sineopGroup1 = { id: 'sineop-1', compositions: [] };

    mockTotalGroups.mockImplementation((_repo, tab) => Promise.resolve(tab === WorksTab.Op ? 2 : 1));

    mockMappedGroups.mockImplementation((_repo, tab, _filters, skip) => {
      if (tab === WorksTab.Op) {
        return Promise.resolve([opGroup1, opGroup2] as unknown as MappedGroupsResult);
      }
      if (skip === 0) {
        return Promise.resolve([sineopGroup1] as unknown as MappedGroupsResult);
      }
      return Promise.resolve([] as unknown as MappedGroupsResult);
    });

    mockAttachCompositionsToGroups.mockResolvedValue([
      { id: 'attached' },
    ] as unknown as AttachResult);

    const result = await handleMixed(repoMock, compositionsRepoMock, undefined, 1, 4);

    expect(mockAttachCompositionsToGroups).toHaveBeenCalledWith([opGroup1, opGroup2], compositionsRepoMock);
    expect(mockAttachCompositionsToGroups).toHaveBeenCalledWith([sineopGroup1], compositionsRepoMock);
    expect(mockMappedCompositions).toHaveBeenCalledWith(compositionsRepoMock, MOCK_COMPOSITION_IDS, 0, 1, undefined);

    expect(result.groups).toHaveLength(2);
    expect(result.works).toEqual([MOCK_WORK]);
  });

  it('should process page spanning into works when remaining > 0', async () => {
    mockTotalGroups.mockImplementation((_repo, tab) => Promise.resolve(tab === WorksTab.Op ? 1 : 1));

    mockMappedGroups.mockImplementation((_repo, tab, _filters, skip) => {
      if (tab === WorksTab.Op) {
        return Promise.resolve([MOCK_OP_GROUP] as unknown as MappedGroupsResult);
      }
      if (skip === 0) {
        return Promise.resolve([MOCK_SINEOP_GROUP] as unknown as MappedGroupsResult);
      }
      return Promise.resolve([] as unknown as MappedGroupsResult);
    });

    const result = await handleMixed(repoMock, compositionsRepoMock, undefined, 1, 5);

    expect(mockMappedCompositions).toHaveBeenCalledWith(
      compositionsRepoMock,
      MOCK_COMPOSITION_IDS,
      0,
      3,
      undefined
    );

    expect(result.works).toEqual([MOCK_WORK]);
    expect(result.total).toBe(12);
  });

  it('should process page containing only works when offset exceeds total groups', async () => {
    mockTotalGroups.mockImplementation((_repo, tab) => Promise.resolve(tab === WorksTab.Op ? 2 : 3));

    mockMappedGroups.mockImplementation(() => {
      return Promise.resolve([] as unknown as MappedGroupsResult);
    });

    const result = await handleMixed(repoMock, compositionsRepoMock, undefined, 4, 2);

    expect(mockAttachCompositionsToGroups).not.toHaveBeenCalled();
    expect(mockMappedCompositions).toHaveBeenCalledWith(
      compositionsRepoMock,
      MOCK_COMPOSITION_IDS,
      1,
      2,
      undefined
    );

    expect(result.groups).toEqual([]);
    expect(result.works).toEqual([MOCK_WORK]);
  });

  it('should handle compositionsOpuses being empty array', async () => {
    repoMock.findAll.mockResolvedValue([]);
    mockTotalGroups.mockImplementation(() => Promise.resolve(0));
    mockTotalCompositions.mockResolvedValue(0);

    mockMappedGroups.mockImplementation(() => {
      return Promise.resolve([] as unknown as MappedGroupsResult);
    });

    const result = await handleMixed(repoMock, compositionsRepoMock, undefined, 1, 10);

    expect(mockTotalCompositions).toHaveBeenCalledWith(compositionsRepoMock, [], undefined);
    expect(result.total).toBe(0);
    expect(result.groups).toEqual([]);
    expect(result.works).toEqual([]);
  });

  it('should handle case when remaining is zero before evaluating works offset', async () => {
    mockTotalGroups.mockImplementation(() => Promise.resolve(10));

    mockMappedGroups.mockImplementation((_repo, tab) => {
      if (tab === WorksTab.Op) {
        return Promise.resolve([MOCK_OP_GROUP] as unknown as MappedGroupsResult);
      }
      return Promise.resolve([MOCK_SINEOP_GROUP] as unknown as MappedGroupsResult);
    });

    const result = await handleMixed(repoMock, compositionsRepoMock, undefined, 1, 1);

    expect(mockAttachCompositionsToGroups).toHaveBeenCalledTimes(1);
    expect(mockMappedCompositions).not.toHaveBeenCalled();
    expect(result.groups).toEqual([MOCK_ATTACHED_OP_GROUP]);
    expect(result.works).toEqual([]);
  });

  it('should call totalPages and calculate pagination parameters correctly', async () => {
    await handleMixed(repoMock, compositionsRepoMock, undefined, 2, 5);

    expect(mockTotalPages).toHaveBeenCalledWith(20, 5);
  });
});
