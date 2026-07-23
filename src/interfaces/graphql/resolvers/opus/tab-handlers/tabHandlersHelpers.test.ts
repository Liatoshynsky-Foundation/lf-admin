import { mapFilters } from '../../helpers';
import { attachCompositionsToGroups, mappedCompositions, mappedGroups, OpusWithCompositions, orderCompositionsByIds, totalCompositions, totalPages } from './tabHandlersHelpers';
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
  const MOCK_COMPOSITION_1 = { id: MOCK_ID_1 } as Composition;
  const MOCK_COMPOSITION_2 = { id: MOCK_ID_2 } as Composition;
  const MOCK_COMPOSITIONS = [MOCK_COMPOSITION_1, MOCK_COMPOSITION_2];

  const MOCK_OPUS_1 = { id: 'opus-1', compositions: [MOCK_ID_1] } as unknown as Opus;
  const MOCK_OPUS_WITHOUT_COMPS = { id: 'opus-2', compositions: [] } as unknown as Opus;
  const MOCK_OPUS_NULL_COMPS = { id: 'opus-3', compositions: null } as unknown as Opus;

  const compositionsRepoMock: jest.Mocked<ICompositionRepository> = {
    findByIds: jest.fn(),
    findByIdsPaginated: jest.fn(),
    countByIds: jest.fn(),
  } as unknown as jest.Mocked<ICompositionRepository>;

  const opusRepoMock: jest.Mocked<IOpusRepository> = {
    count: jest.fn(),
    findAll: jest.fn(),
  } as unknown as jest.Mocked<IOpusRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('orderCompositionsByIds', () => {
    it('should order compositions according to provided ids', () => {
      const ids = [MOCK_ID_2, MOCK_ID_1];
      const result = orderCompositionsByIds(ids, MOCK_COMPOSITIONS);
      expect(result).toEqual([MOCK_COMPOSITION_2, MOCK_COMPOSITION_1]);
    });

    it('should filter out undefined compositions if id is not found', () => {
      const ids = [MOCK_ID_1, 'non-existent'];
      const result = orderCompositionsByIds(ids, MOCK_COMPOSITIONS);
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
    it('should map groups correctly for Opus tab with filters', async () => {
      const groupsList = [MOCK_OPUS_1];
      opusRepoMock.findAll.mockResolvedValue(groupsList);
      (mapFilters as jest.Mock).mockReturnValueOnce({ search: 'test' });

      const result = await mappedGroups(opusRepoMock, WorksTab.Op, { search: 'test' });

      expect(mapFilters).toHaveBeenCalledWith({ search: 'test' });
      expect(opusRepoMock.findAll).toHaveBeenCalledWith({ search: 'test', numberKind: OpusNumberKind.Op, skip: undefined, limit: undefined });
      expect(result).toEqual(groupsList);
    });

    it('should map groups correctly when filters are undefined', async () => {
      const groupsList = [MOCK_OPUS_1];
      opusRepoMock.findAll.mockResolvedValue(groupsList);
      (mapFilters as jest.Mock).mockReturnValueOnce(undefined);

      const result = await mappedGroups(opusRepoMock, WorksTab.Sineop, undefined);

      expect(mapFilters).toHaveBeenCalledWith(undefined);
      expect(opusRepoMock.findAll).toHaveBeenCalledWith({ numberKind: OpusNumberKind.Sineop, skip: undefined, limit: undefined });
      expect(result).toEqual(groupsList);
    });
  });

  describe('mappedCompositions', () => {
    it('should return paginated compositions with filters', async () => {
      const paginatedResult = [MOCK_COMPOSITION_1];
      compositionsRepoMock.findByIdsPaginated.mockResolvedValue(paginatedResult);
      (mapFilters as jest.Mock).mockReturnValueOnce({ search: 'test' });

      const result = await mappedCompositions(compositionsRepoMock, [MOCK_ID_1], 2, 10, { search: 'test' });

      expect(mapFilters).toHaveBeenCalledWith({ search: 'test' });
      expect(compositionsRepoMock.findByIdsPaginated).toHaveBeenCalledWith(
        [MOCK_ID_1],
        { search: 'test', skip: 10, limit: 10 }
      );
      expect(result).toEqual(paginatedResult);
    });

    it('should return paginated compositions without filters', async () => {
      const paginatedResult = [MOCK_COMPOSITION_1];
      compositionsRepoMock.findByIdsPaginated.mockResolvedValue(paginatedResult);
      (mapFilters as jest.Mock).mockReturnValue(undefined);

      const result = await mappedCompositions(compositionsRepoMock, [MOCK_ID_1], 1, 5, undefined);

      expect(mapFilters).toHaveBeenCalledWith(undefined);
      expect(compositionsRepoMock.findByIdsPaginated).toHaveBeenCalledWith(
        [MOCK_ID_1],
        { skip: 0, limit: 5 }
      );
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('totalCompositions', () => {
    it('should return total count of compositions by ids with filters', async () => {
      const totalCount = 3;
      compositionsRepoMock.countByIds.mockResolvedValue(totalCount);
      (mapFilters as jest.Mock).mockReturnValueOnce({ search: 'test' });

      const result = await totalCompositions(compositionsRepoMock, [MOCK_ID_1], { search: 'test' });

      expect(mapFilters).toHaveBeenCalledWith({ search: 'test' });
      expect(compositionsRepoMock.countByIds).toHaveBeenCalledWith([MOCK_ID_1], { search: 'test' });
      expect(result).toBe(totalCount);
    });

    it('should return total count of compositions by ids without filters', async () => {
      const totalCount = 3;
      compositionsRepoMock.countByIds.mockResolvedValue(totalCount);
      (mapFilters as jest.Mock).mockReturnValue(undefined);

      const result = await totalCompositions(compositionsRepoMock, [MOCK_ID_1], undefined);

      expect(mapFilters).toHaveBeenCalledWith(undefined);
      expect(compositionsRepoMock.countByIds).toHaveBeenCalledWith([MOCK_ID_1], {});
      expect(result).toBe(totalCount);
    });
  });

  describe('totalPages', () => {
    it('should calculate total pages correctly', () => {
      expect(totalPages(15, 10)).toBe(2);
      expect(totalPages(10, 10)).toBe(1);
      expect(totalPages(0, 10)).toBe(0);
    });
  });
});
