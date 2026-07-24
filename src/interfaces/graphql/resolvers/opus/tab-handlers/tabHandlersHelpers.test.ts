import { mapFilters } from '../../helpers';
import {
  attachCompositionsToGroups,
  mappedCompositions,
  mappedGroups,
  OpusWithCompositions,
  orderCompositionsByIds,
  totalCompositions,
  totalGroups,
  totalPages,
} from './tabHandlersHelpers';
import { Composition } from '~/domain/entities/Composition';
import { Opus } from '~/src/domain/entities/Opus';
import { ICompositionRepository } from '~/src/domain/repositories/compositionRepository';
import { IOpusRepository } from '~/src/domain/repositories/opusRepository';
import { OpusNumberKind, WorksTab } from '~/types/graphql/generated/graphql';

jest.mock('../../helpers', () => ({
  mapFilters: jest.fn((filters) => filters),
}));

describe('tabHandlersHelpers', () => {
  const MOCK_ID_1 = 'comp-1';
  const MOCK_ID_2 = 'comp-2';
  const MOCK_NON_EXISTENT_ID = 'non-existent';
  const MOCK_COMPOSITION_1: Composition = { id: MOCK_ID_1 } as unknown as Composition;
  const MOCK_COMPOSITION_2: Composition = { id: MOCK_ID_2 } as unknown as Composition;
  const MOCK_COMPOSITIONS: Composition[] = [MOCK_COMPOSITION_1, MOCK_COMPOSITION_2];

  const MOCK_OPUS_1: Opus = { id: 'opus-1', compositions: [MOCK_ID_1] } as unknown as Opus;
  const MOCK_OPUS_WITHOUT_COMPS: Opus = { id: 'opus-2', compositions: [] } as unknown as Opus;
  const MOCK_OPUS_NULL_COMPS: Opus = { id: 'opus-3', compositions: null } as unknown as Opus;

  const MOCK_FILTER_SEARCH = { search: 'test' };
  const MOCK_TOTAL_COUNT = 3;
  const MOCK_SKIP = 0;
  const MOCK_LIMIT = 10;
  const MOCK_TOTAL_ITEMS = 15;
  const MOCK_PAGE_SIZE = 10;

  const compositionsRepoMock = {
    findByIds: jest.fn(),
    findByIdsPaginated: jest.fn(),
    countByIds: jest.fn(),
  } as unknown as jest.Mocked<ICompositionRepository>;

  const opusRepoMock = {
    count: jest.fn(),
    findAll: jest.fn(),
  } as unknown as jest.Mocked<IOpusRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('orderCompositionsByIds', () => {
    const MOCK_IDS = [MOCK_ID_2, MOCK_ID_1];
    const MOCK_IDS_WITH_MISSING = [MOCK_ID_1, MOCK_NON_EXISTENT_ID];

    it('should order compositions according to provided ids', () => {
      const result = orderCompositionsByIds(MOCK_IDS, MOCK_COMPOSITIONS);
      expect(result).toEqual([MOCK_COMPOSITION_2, MOCK_COMPOSITION_1]);
    });

    it('should filter out undefined compositions if id is not found', () => {
      const result = orderCompositionsByIds(MOCK_IDS_WITH_MISSING, MOCK_COMPOSITIONS);
      expect(result).toEqual([MOCK_COMPOSITION_1]);
    });
  });

  describe('attachCompositionsToGroups', () => {
    it('should attach compositions to groups successfully', async () => {
      compositionsRepoMock.findByIds.mockResolvedValue(MOCK_COMPOSITIONS);

      const result = await attachCompositionsToGroups([MOCK_OPUS_1], compositionsRepoMock);

      expect(compositionsRepoMock.findByIds).toHaveBeenCalledWith([MOCK_ID_1]);
      const expected: OpusWithCompositions[] = [{ ...MOCK_OPUS_1, compositions: [MOCK_COMPOSITION_1] }];
      expect(result).toEqual(expected);
    });

    it('should return groups with empty compositions if uniqueIds length is zero', async () => {
      const result = await attachCompositionsToGroups([MOCK_OPUS_WITHOUT_COMPS, MOCK_OPUS_NULL_COMPS], compositionsRepoMock);

      expect(compositionsRepoMock.findByIds).not.toHaveBeenCalled();
      expect(result).toEqual([
        { ...MOCK_OPUS_WITHOUT_COMPS, compositions: [] },
        { ...MOCK_OPUS_NULL_COMPS, compositions: [] },
      ]);
    });
  });

  describe('mappedGroups', () => {
    const MOCK_GROUPS_LIST = [MOCK_OPUS_1];

    it('should map groups correctly for Opus tab with filters', async () => {
      opusRepoMock.findAll.mockResolvedValue(MOCK_GROUPS_LIST);
      (mapFilters as jest.Mock).mockReturnValueOnce(MOCK_FILTER_SEARCH);

      const result = await mappedGroups(opusRepoMock, WorksTab.Op, MOCK_FILTER_SEARCH);

      expect(mapFilters).toHaveBeenCalledWith(MOCK_FILTER_SEARCH);
      expect(opusRepoMock.findAll).toHaveBeenCalledWith({ ...MOCK_FILTER_SEARCH, numberKind: OpusNumberKind.Op, skip: undefined, limit: undefined });
      expect(result).toEqual(MOCK_GROUPS_LIST);
    });

    it('should map groups correctly when filters are undefined', async () => {
      opusRepoMock.findAll.mockResolvedValue(MOCK_GROUPS_LIST);
      (mapFilters as jest.Mock).mockReturnValueOnce(undefined);

      const result = await mappedGroups(opusRepoMock, WorksTab.Sineop, undefined);

      expect(mapFilters).toHaveBeenCalledWith(undefined);
      expect(opusRepoMock.findAll).toHaveBeenCalledWith({ numberKind: OpusNumberKind.Sineop, skip: undefined, limit: undefined });
      expect(result).toEqual(MOCK_GROUPS_LIST);
    });
  });

  describe('totalGroups', () => {
    it('should return total count of groups correctly', async () => {
      opusRepoMock.count.mockResolvedValue(MOCK_TOTAL_COUNT);
      (mapFilters as jest.Mock).mockReturnValueOnce(MOCK_FILTER_SEARCH);

      const result = await totalGroups(opusRepoMock, WorksTab.Compositions, MOCK_FILTER_SEARCH);

      expect(mapFilters).toHaveBeenCalledWith(MOCK_FILTER_SEARCH);
      expect(opusRepoMock.count).toHaveBeenCalledWith({ ...MOCK_FILTER_SEARCH, numberKind: OpusNumberKind.Compositions });
      expect(result).toBe(MOCK_TOTAL_COUNT);
    });
  });

  describe('mappedCompositions', () => {
    const MOCK_PAGINATED_RESULT = [MOCK_COMPOSITION_1];

    it('should return paginated compositions with filters', async () => {
      compositionsRepoMock.findByIdsPaginated.mockResolvedValue(MOCK_PAGINATED_RESULT);
      (mapFilters as jest.Mock).mockReturnValueOnce(MOCK_FILTER_SEARCH);

      const result = await mappedCompositions(compositionsRepoMock, [MOCK_ID_1], MOCK_SKIP, MOCK_LIMIT, MOCK_FILTER_SEARCH);

      expect(mapFilters).toHaveBeenCalledWith(MOCK_FILTER_SEARCH);
      expect(compositionsRepoMock.findByIdsPaginated).toHaveBeenCalledWith(
        [MOCK_ID_1],
        { ...MOCK_FILTER_SEARCH, skip: MOCK_SKIP, limit: MOCK_LIMIT }
      );
      expect(result).toEqual(MOCK_PAGINATED_RESULT);
    });

    it('should return paginated compositions without filters', async () => {
      compositionsRepoMock.findByIdsPaginated.mockResolvedValue(MOCK_PAGINATED_RESULT);
      (mapFilters as jest.Mock).mockReturnValue(undefined);

      const result = await mappedCompositions(compositionsRepoMock, [MOCK_ID_1], MOCK_SKIP, MOCK_LIMIT, undefined);

      expect(mapFilters).toHaveBeenCalledWith(undefined);
      expect(compositionsRepoMock.findByIdsPaginated).toHaveBeenCalledWith(
        [MOCK_ID_1],
        { skip: MOCK_SKIP, limit: MOCK_LIMIT }
      );
      expect(result).toEqual(MOCK_PAGINATED_RESULT);
    });
  });

  describe('totalCompositions', () => {
    it('should return total count of compositions by ids with filters', async () => {
      compositionsRepoMock.countByIds.mockResolvedValue(MOCK_TOTAL_COUNT);
      (mapFilters as jest.Mock).mockReturnValueOnce(MOCK_FILTER_SEARCH);

      const result = await totalCompositions(compositionsRepoMock, [MOCK_ID_1], MOCK_FILTER_SEARCH);

      expect(mapFilters).toHaveBeenCalledWith(MOCK_FILTER_SEARCH);
      expect(compositionsRepoMock.countByIds).toHaveBeenCalledWith([MOCK_ID_1], MOCK_FILTER_SEARCH);
      expect(result).toBe(MOCK_TOTAL_COUNT);
    });

    it('should return total count of compositions by ids without filters', async () => {
      compositionsRepoMock.countByIds.mockResolvedValue(MOCK_TOTAL_COUNT);
      (mapFilters as jest.Mock).mockReturnValue(undefined);

      const result = await totalCompositions(compositionsRepoMock, [MOCK_ID_1], undefined);

      expect(mapFilters).toHaveBeenCalledWith(undefined);
      expect(compositionsRepoMock.countByIds).toHaveBeenCalledWith([MOCK_ID_1], {});
      expect(result).toBe(MOCK_TOTAL_COUNT);
    });
  });

  describe('totalPages', () => {
    it('should calculate total pages correctly', () => {
      expect(totalPages(MOCK_TOTAL_ITEMS, MOCK_PAGE_SIZE)).toBe(2);
      expect(totalPages(10, MOCK_PAGE_SIZE)).toBe(1);
      expect(totalPages(0, MOCK_PAGE_SIZE)).toBe(0);
    });
  });
});
