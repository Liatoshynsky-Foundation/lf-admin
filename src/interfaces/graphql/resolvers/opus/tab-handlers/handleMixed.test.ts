import { WorksFilter } from '../opusQuery';
import { handleMixed } from './handleMixed';
import {
  attachCompositionsToGroups,
  mappedCompositions,
  mappedGroups,
  totalCompositions,
  totalPages,
} from './tabHandlersHelpers';
import { ICompositionRepository } from '~/domain/repositories/compositionRepository';
import { IOpusRepository } from '~/src/domain/repositories/opusRepository';
import { OpusNumberKind, WorksTab } from '~/types/graphql/generated/graphql';

jest.mock('./tabHandlersHelpers', () => ({
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

    repoMock.findAll.mockResolvedValue([
      { compositions: MOCK_COMPOSITION_IDS },
    ] as Awaited<ReturnType<IOpusRepository['findAll']>>);

    mockMappedGroups.mockImplementation((_repo, tab) => {
      if (tab === WorksTab.Op) {
        return Promise.resolve({
          groups: [MOCK_OP_GROUP],
          total: 5,
        } as unknown as MappedGroupsResult);
      }
      return Promise.resolve({
        groups: [MOCK_SINEOP_GROUP],
        total: 5,
      } as unknown as MappedGroupsResult);
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
    expect(mockMappedGroups).toHaveBeenCalledWith(repoMock, WorksTab.Op, MOCK_FILTERS);
    expect(mockMappedGroups).toHaveBeenCalledWith(repoMock, WorksTab.Sineop, MOCK_FILTERS);
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

    mockMappedGroups.mockImplementation((_repo, tab) => {
      if (tab === WorksTab.Op) {
        return Promise.resolve({
          groups: [opGroup1, opGroup2],
          total: 2,
        } as unknown as MappedGroupsResult);
      }
      return Promise.resolve({
        groups: [sineopGroup1],
        total: 1,
      } as unknown as MappedGroupsResult);
    });

    mockAttachCompositionsToGroups.mockResolvedValue([
      { id: 'attached' },
    ] as unknown as AttachResult);

    // Page 1, size 4: Op(2) + Sineop(1) = 3 groups. Remaining = 1 for Works.
    const result = await handleMixed(repoMock, compositionsRepoMock, undefined, 1, 4);

    expect(mockAttachCompositionsToGroups).toHaveBeenCalledWith([opGroup1, opGroup2], compositionsRepoMock);
    expect(mockAttachCompositionsToGroups).toHaveBeenCalledWith([sineopGroup1], compositionsRepoMock);
    expect(mockMappedCompositions).toHaveBeenCalledWith(compositionsRepoMock, MOCK_COMPOSITION_IDS, 1, 1, undefined);

    expect(result.groups).toHaveLength(2); // 2 calls pushed to groups array
    expect(result.works).toEqual([MOCK_WORK]);
  });

  it('should process page spanning into works when remaining > 0', async () => {
    mockMappedGroups.mockImplementation((_repo, tab) => {
      if (tab === WorksTab.Op) {
        return Promise.resolve({
          groups: [MOCK_OP_GROUP],
          total: 1,
        } as unknown as MappedGroupsResult);
      }
      return Promise.resolve({
        groups: [MOCK_SINEOP_GROUP],
        total: 1,
      } as unknown as MappedGroupsResult);
    });

    const result = await handleMixed(repoMock, compositionsRepoMock, undefined, 1, 5);

    expect(mockMappedCompositions).toHaveBeenCalledWith(
      compositionsRepoMock,
      MOCK_COMPOSITION_IDS,
      1,
      3,
      undefined
    );

    expect(result.works).toEqual([MOCK_WORK]);
    expect(result.total).toBe(12);
  });

  it('should process page containing only works when offset exceeds total groups', async () => {
    mockMappedGroups.mockImplementation((_repo, tab) => {
      if (tab === WorksTab.Op) {
        return Promise.resolve({
          groups: [],
          total: 2,
        } as unknown as MappedGroupsResult);
      }
      return Promise.resolve({
        groups: [],
        total: 3,
      } as unknown as MappedGroupsResult);
    });

    // Total groups = 5. Offset for page 4 with size 2 is 6. 
    // Since offset (6) >= totalGroups (5), no groups will be attached.
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

  it('should handle looseOpuses being empty array', async () => {
    repoMock.findAll.mockResolvedValue([]);
    mockTotalCompositions.mockResolvedValue(0);

    mockMappedGroups.mockImplementation(() => {
      return Promise.resolve({
        groups: [],
        total: 0,
      } as unknown as MappedGroupsResult);
    });

    const result = await handleMixed(repoMock, compositionsRepoMock, undefined, 1, 10);

    expect(mockTotalCompositions).toHaveBeenCalledWith(compositionsRepoMock, [], undefined);
    expect(result.total).toBe(0);
    expect(result.groups).toEqual([]);
    expect(result.works).toEqual([]);
  });

  it('should handle case when remaining is zero before evaluating works offset', async () => {
    mockMappedGroups.mockImplementation((_repo, tab) => {
      if (tab === WorksTab.Op) {
        return Promise.resolve({
          groups: [MOCK_OP_GROUP],
          total: 10,
        } as unknown as MappedGroupsResult);
      }
      return Promise.resolve({
        groups: [MOCK_SINEOP_GROUP],
        total: 10,
      } as unknown as MappedGroupsResult);
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
