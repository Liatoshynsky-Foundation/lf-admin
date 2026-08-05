import { GraphQLError } from 'graphql';

import { OpusQuery, PaginatedWorksResult } from './opusQuery';
import { handleGroup } from './tab-handlers/handleGroup';
import { handleMixed } from './tab-handlers/handleMixed';
import { handleWork } from './tab-handlers/handleWork';
import { orderCompositionsByIds } from './tab-handlers/tabHandlersHelpers';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import { Composition } from '~/domain/entities/Composition';
import { Opus } from '~/domain/entities/Opus';
import type { ICompositionRepository } from '~/domain/repositories/compositionRepository';
import type { IOpusRepository } from '~/domain/repositories/opusRepository';
import { OpusNumberKind, WorksTab } from '~/types/graphql/generated/graphql';

jest.mock('../helpers', () => ({
  endpointRepositoryHandler: jest.fn(
    () => (fn: (ctx: { args: unknown; repo: unknown; requestContainer: unknown }) => unknown) =>
      (_: unknown, args: unknown, context: GraphQLContext) =>
        fn({
          args,
          repo: context.requestContainer.cradle.opusRepository,
          requestContainer: context.requestContainer,
        })
  ),
  mapFilters: jest.fn(),
}));

jest.mock('./tab-handlers/handleGroup');
jest.mock('./tab-handlers/handleMixed');
jest.mock('./tab-handlers/handleWork');
jest.mock('./tab-handlers/tabHandlersHelpers');

const mockedHandleGroup = handleGroup as jest.MockedFunction<typeof handleGroup>;
const mockedHandleMixed = handleMixed as jest.MockedFunction<typeof handleMixed>;
const mockedHandleWork = handleWork as jest.MockedFunction<typeof handleWork>;
const mockedOrderCompositionsByIds = orderCompositionsByIds as jest.MockedFunction<
  typeof orderCompositionsByIds
>;

describe('OpusQuery Resolvers', () => {
  const OPUS_ID = '1';
  const COMPOSITION_ID_1 = 'comp1';
  const COMPOSITION_ID_2 = 'comp2';
  const SEARCH_QUERY = 'Allegro';
  const DEFAULT_PAGE_SIZE = 10;
  const DEFAULT_PAGE = 1;

  const MOCK_PAGINATED_RESULT: PaginatedWorksResult = {
    groups: [],
    works: [],
    total: 0,
    page: 1,
    totalPages: 1,
  };

  const MOCK_RAW_OPUS = {
    id: OPUS_ID,
    compositions: [COMPOSITION_ID_1, COMPOSITION_ID_2],
  } as unknown as Opus;

  const MOCK_FETCHED_COMPOSITIONS = [
    { id: COMPOSITION_ID_1 },
    { id: COMPOSITION_ID_2 },
  ] as Composition[];

  const MOCK_ORDERED_COMPOSITIONS = [
    { id: COMPOSITION_ID_1 },
    { id: COMPOSITION_ID_2 },
  ] as Composition[];

  let mockOpusRepo: jest.Mocked<IOpusRepository>;
  let mockCompositionsRepo: jest.Mocked<ICompositionRepository>;
  let adminContext: GraphQLContext;
  let userContext: GraphQLContext;

  const createMockContext = (isAdmin: boolean): GraphQLContext => {
    return {
      admin: isAdmin,
      requestContainer: {
        cradle: {
          opusRepository: mockOpusRepo,
          compositionsRepository: mockCompositionsRepo,
        },
      },
    } as unknown as GraphQLContext;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockOpusRepo = {
      findById: jest.fn(),
      findByComplexKey: jest.fn(),
      findAll: jest.fn(),
      findPaginated: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      unlink: jest.fn(),
      moveCompositionsToCompositionsOpus: jest.fn(),
      removeCompositionsFromCompositionsOpus: jest.fn(),
      findBySlug: jest.fn(),
    } as jest.Mocked<IOpusRepository>;

    mockCompositionsRepo = {
      findByOpusId: jest.fn(),
      findByOpusIds: jest.fn(),
      findByIds: jest.fn(),
      syncForOpus: jest.fn(),
      deleteByOpusId: jest.fn(),
      searchByTitle: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findByIdsPaginated: jest.fn(),
      countByIds: jest.fn(),
      findBySlug: jest.fn(),
      findPaginated: jest.fn(),
    } as jest.Mocked<ICompositionRepository>;

    adminContext = createMockContext(true);
    userContext = createMockContext(false);

    mockedHandleGroup.mockResolvedValue(MOCK_PAGINATED_RESULT);
    mockedHandleMixed.mockResolvedValue(MOCK_PAGINATED_RESULT);
    mockedHandleWork.mockResolvedValue(MOCK_PAGINATED_RESULT);
  });

  describe('opusById', () => {
    it('should reject unauthenticated requests', async () => {
      await expect(OpusQuery.opusById({}, { id: OPUS_ID }, userContext)).rejects.toThrow(
        new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
          extensions: { code: graphqlErrors.UNAUTHENTICATED.code },
        })
      );
    });

    it('should return null when opus is not found', async () => {
      mockOpusRepo.findById.mockResolvedValue(null);

      const result = await OpusQuery.opusById({}, { id: OPUS_ID }, adminContext);

      expect(mockOpusRepo.findById).toHaveBeenCalledWith(OPUS_ID);
      expect(mockCompositionsRepo.findByIds).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should call repo.findById, fetch compositions by ids, order them, and attach to result', async () => {
      mockOpusRepo.findById.mockResolvedValue(MOCK_RAW_OPUS);
      mockCompositionsRepo.findByIds.mockResolvedValue(MOCK_FETCHED_COMPOSITIONS);
      mockedOrderCompositionsByIds.mockReturnValue(MOCK_ORDERED_COMPOSITIONS);

      const result = await OpusQuery.opusById({}, { id: OPUS_ID }, adminContext);

      expect(mockOpusRepo.findById).toHaveBeenCalledWith(OPUS_ID);
      expect(mockCompositionsRepo.findByIds).toHaveBeenCalledWith([
        COMPOSITION_ID_1,
        COMPOSITION_ID_2,
      ]);
      expect(mockedOrderCompositionsByIds).toHaveBeenCalledWith(
        [COMPOSITION_ID_1, COMPOSITION_ID_2],
        MOCK_FETCHED_COMPOSITIONS
      );
      expect(result).toEqual({ ...MOCK_RAW_OPUS, compositions: MOCK_ORDERED_COMPOSITIONS });
    });

    it('should handle opus with undefined compositions gracefully', async () => {
      const rawOpus = { id: OPUS_ID } as Opus;
      mockOpusRepo.findById.mockResolvedValue(rawOpus);
      mockCompositionsRepo.findByIds.mockResolvedValue([]);
      mockedOrderCompositionsByIds.mockReturnValue([]);

      const result = await OpusQuery.opusById({}, { id: OPUS_ID }, adminContext);

      expect(mockCompositionsRepo.findByIds).toHaveBeenCalledWith([]);
      expect(result).toEqual({ ...rawOpus, compositions: [] });
    });
  });

  describe('searchCompositions', () => {
    it('should reject unauthenticated requests', async () => {
      await expect(
        OpusQuery.searchCompositions({}, { search: SEARCH_QUERY }, userContext)
      ).rejects.toThrow(
        new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
          extensions: { code: graphqlErrors.UNAUTHENTICATED.code },
        })
      );
    });

    it('should return empty array if compOpuses is empty', async () => {
      mockOpusRepo.findAll.mockResolvedValue([]);

      const result = await OpusQuery.searchCompositions({}, { search: SEARCH_QUERY }, adminContext);

      expect(mockOpusRepo.findAll).toHaveBeenCalledWith({ numberKind: OpusNumberKind.Compositions });
      expect(mockCompositionsRepo.searchByTitle).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should return empty array if compositionIds length is 0', async () => {
      mockOpusRepo.findAll.mockResolvedValue([{ compositions: [] } as unknown as Opus]);

      const result = await OpusQuery.searchCompositions({}, { search: SEARCH_QUERY }, adminContext);

      expect(mockCompositionsRepo.searchByTitle).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should return empty array if compOpuses has undefined compositions', async () => {
      mockOpusRepo.findAll.mockResolvedValue([{ id: OPUS_ID } as Opus]);

      const result = await OpusQuery.searchCompositions({}, { search: SEARCH_QUERY }, adminContext);

      expect(mockCompositionsRepo.searchByTitle).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should search compositions by title when compositionIds are present', async () => {
      mockOpusRepo.findAll.mockResolvedValue([MOCK_RAW_OPUS]);
      mockCompositionsRepo.searchByTitle.mockResolvedValue(MOCK_FETCHED_COMPOSITIONS);

      const result = await OpusQuery.searchCompositions({}, { search: SEARCH_QUERY }, adminContext);

      expect(mockOpusRepo.findAll).toHaveBeenCalledWith({ numberKind: OpusNumberKind.Compositions });
      expect(mockCompositionsRepo.searchByTitle).toHaveBeenCalledWith(SEARCH_QUERY, [
        COMPOSITION_ID_1,
        COMPOSITION_ID_2,
      ]);
      expect(result).toEqual(MOCK_FETCHED_COMPOSITIONS);
    });
  });

  describe('paginatedWorks', () => {
    it('should call handleGroup when tab is WorksTab.Op', async () => {
      const filters = { limit: 10, skip: 20 };
      await OpusQuery.paginatedWorks(
        {},
        { tab: WorksTab.Op, filters },
        adminContext
      );

      expect(mockedHandleGroup).toHaveBeenCalledWith(
        WorksTab.Op,
        mockOpusRepo,
        mockCompositionsRepo,
        filters,
        3,
        10
      );
    });

    it('should call handleGroup when tab is WorksTab.Sineop', async () => {
      const filters = { limit: 5, skip: 5 };
      await OpusQuery.paginatedWorks(
        {},
        { tab: WorksTab.Sineop, filters },
        adminContext
      );

      expect(mockedHandleGroup).toHaveBeenCalledWith(
        WorksTab.Sineop,
        mockOpusRepo,
        mockCompositionsRepo,
        filters,
        2,
        5
      );
    });

    it('should call handleWork when tab is WorksTab.Compositions', async () => {
      const filters = { limit: 25, skip: 50 };
      await OpusQuery.paginatedWorks(
        {},
        { tab: WorksTab.Compositions, filters },
        adminContext
      );

      expect(mockedHandleWork).toHaveBeenCalledWith(
        WorksTab.Compositions,
        mockOpusRepo,
        mockCompositionsRepo,
        filters,
        3,
        25
      );
    });

    it('should call handleMixed when tab is not Op, Sineop, or Compositions', async () => {
      const filters = { limit: 15, skip: 15 };
      await OpusQuery.paginatedWorks(
        {},
        { tab: WorksTab.All, filters },
        adminContext
      );

      expect(mockedHandleMixed).toHaveBeenCalledWith(
        mockOpusRepo,
        mockCompositionsRepo,
        filters,
        2,
        15
      );
    });

    it('should use default page size and skip when filters are omitted', async () => {
      await OpusQuery.paginatedWorks({}, {}, adminContext);

      expect(mockedHandleMixed).toHaveBeenCalledWith(
        mockOpusRepo,
        mockCompositionsRepo,
        undefined,
        DEFAULT_PAGE,
        DEFAULT_PAGE_SIZE
      );
    });
  });
});