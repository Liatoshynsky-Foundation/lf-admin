import { Model } from 'mongoose';

import { CompositionRepository, DbComposition } from './compositionRepository';
import { CompositionFilters, CompositionInput } from '~/domain/repositories/compositionRepository';
import { SortOrder } from '~/types/enums/common.enums';

jest.mock('mongoose', () => {
  const MockObjectId = function (this: { toString: () => string }, id: string) {
    this.toString = () => id;
  };

  type ObjectIdMock = typeof MockObjectId & { isValid: (id: string) => boolean };

  (MockObjectId as unknown as ObjectIdMock).isValid = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

  return {
    Types: {
      ObjectId: MockObjectId
    }
  };
});

jest.mock('~/infrastructure/db/connect', () => jest.fn());

const EXISTING_COMPOSITION_ID = '65eddf5e2f1a2b3c4d5e6f7b';
const INVALID_ID = 'not-a-valid-object-id';
const VALID_OBJECT_ID_1 = '65eddf5e2f1a2b3c4d5e6f7a';
const VALID_OBJECT_ID_2 = '65eddf5e2f1a2b3c4d5e6f7b';
const SEARCH_QUERY = 'Після';
const BLANK_SEARCH_QUERY = '    ';

const MOCK_DB_COMPOSITION: DbComposition = {
  _id: { toString: (): string => 'c1' },
  name: { uk: 'Після бою', en: 'After Battle' },
  year: 1920,
  genre: 'Романс',
  audioAvailable: false,
  sheetAvailable: false,
  sheetMusic: [],
  audios: [],
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01'
};

const createMockDoc = (overrides: Partial<DbComposition> = {}): DbComposition => ({
  ...MOCK_DB_COMPOSITION,
  ...overrides
});

const createCompositionInput = (id?: string): CompositionInput => ({
  id,
  name: { uk: 'Після бою', en: 'After Battle' },
  year: 1920,
  genre: 'Романс',
  audioAvailable: false,
  sheetAvailable: false,
  sheetMusic: [],
  audios: []
});

describe('CompositionRepository', () => {
  const findMock = jest.fn();
  const updateManyMock = jest.fn();
  const findByIdAndUpdateMock = jest.fn();
  const deleteManyMock = jest.fn();
  const saveMock = jest.fn();
  const countDocumentsMock = jest.fn();
  const findOneMock = jest.fn();

  const createChainableQueryMock = (resolvedValue: unknown) => {
    const queryMock: Record<string, jest.Mock> = {};

    queryMock.collation = jest.fn().mockReturnValue(queryMock);
    queryMock.lean = jest.fn().mockReturnValue(queryMock);
    queryMock.limit = jest.fn().mockReturnValue(queryMock);
    queryMock.skip = jest.fn().mockReturnValue(queryMock);
    queryMock.sort = jest.fn().mockReturnValue(queryMock);
    queryMock.then = jest.fn((resolve: (val: unknown) => void) => resolve(resolvedValue));

    return queryMock;
  };

  const MockModel = jest.fn().mockImplementation(() => ({ save: saveMock })) as unknown as Model<DbComposition> & {
    find: jest.Mock;
    updateMany: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    deleteMany: jest.Mock;
    countDocuments: jest.Mock;
    findOne: jest.Mock;
  };

  MockModel.find = findMock;
  MockModel.updateMany = updateManyMock;
  MockModel.findByIdAndUpdate = findByIdAndUpdateMock;
  MockModel.deleteMany = deleteManyMock;
  MockModel.countDocuments = countDocumentsMock;
  MockModel.findOne = findOneMock;

  const repository = CompositionRepository({ CompositionModel: MockModel });

  beforeEach(() => {
    jest.clearAllMocks();
    updateManyMock.mockResolvedValue({});
    deleteManyMock.mockResolvedValue(undefined);
  });

  it('syncForOpus creates new compositions', async (): Promise<void> => {
    saveMock.mockResolvedValue({ toObject: () => createMockDoc() });

    const result = await repository.syncForOpus([createCompositionInput()]);

    expect(saveMock).toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  it('trims localized names before creating and syncing a composition', async (): Promise<void> => {
    saveMock.mockResolvedValue({ toObject: () => createMockDoc({ name: { uk: ' Соната ', en: ' Sonata ' } }) });

    await repository.create(createCompositionInput());
    expect(MockModel).toHaveBeenCalledWith(expect.objectContaining({ name: { uk: 'Після бою', en: 'After Battle' } }));

    await repository.syncForOpus([{ ...createCompositionInput(), name: { uk: '  Соната  ', en: '  Sonata  ' } }]);
    expect(saveMock).toHaveBeenCalledWith();
    expect(MockModel).toHaveBeenLastCalledWith(expect.objectContaining({ name: { uk: 'Соната', en: 'Sonata' } }));
  });

  it('findByName trims the search name and maps the matching document', async (): Promise<void> => {
    const queryChain = createChainableQueryMock(createMockDoc());
    findOneMock.mockReturnValue(queryChain);

    const result = await repository.findByName('  Соната  ');

    expect(findOneMock).toHaveBeenCalledWith({ 'name.uk': 'Соната' });
    expect(queryChain.collation).toHaveBeenCalledWith({ locale: 'uk', strength: 2 });
    expect(result?.id).toBe('c1');
  });

  it('findByName returns null when no document matches', async (): Promise<void> => {
    findOneMock.mockReturnValue(createChainableQueryMock(null));

    await expect(repository.findByName('Missing')).resolves.toBeNull();
  });

  it('syncForOpus links an existing composition by id instead of duplicating', async (): Promise<void> => {
    findByIdAndUpdateMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(createMockDoc()) });

    const result = await repository.syncForOpus([createCompositionInput(EXISTING_COMPOSITION_ID)]);

    expect(findByIdAndUpdateMock).toHaveBeenCalledWith(EXISTING_COMPOSITION_ID, expect.any(Object), {
      new: true
    });
    expect(saveMock).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  it('searchByTitle returns matching compositions for empty/blank search query', async (): Promise<void> => {
    const queryChain = createChainableQueryMock([createMockDoc()]);
    findMock.mockReturnValue(queryChain);

    const result = await repository.searchByTitle(BLANK_SEARCH_QUERY);

    expect(findMock).toHaveBeenCalled();
    expect(queryChain.limit).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0].name.uk).toBe('Після бою');
  });

  it('toEntity applies fallback defaults for nullish document fields', async (): Promise<void> => {
    const doc = createMockDoc({
      year: null,
      genre: null,
      audioAvailable: undefined,
      sheetAvailable: undefined,
      sheetMusic: undefined,
      audios: undefined
    });
    const queryChain = createChainableQueryMock([doc]);
    findMock.mockReturnValue(queryChain);

    const [result] = await repository.findByIds([VALID_OBJECT_ID_1]);

    expect(result.year).toBeUndefined();
    expect(result.genre).toBeUndefined();
    expect(result.audioAvailable).toBe(false);
    expect(result.sheetAvailable).toBe(false);
    expect(result.sheetMusic).toEqual([]);
    expect(result.audios).toEqual([]);
  });

  it('searchByTitle returns an empty array when invalid ids are provided', async (): Promise<void> => {
    const result = await repository.searchByTitle(SEARCH_QUERY, [INVALID_ID]);

    expect(result).toEqual([]);
    expect(findMock).not.toHaveBeenCalled();
  });

  it('syncForOpus creates a new composition when the input id is not a valid object id', async (): Promise<void> => {
    saveMock.mockResolvedValue({ toObject: () => createMockDoc() });

    const result = await repository.syncForOpus([createCompositionInput(INVALID_ID)]);

    expect(findByIdAndUpdateMock).not.toHaveBeenCalled();
    expect(saveMock).toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  it('syncForOpus skips a linked composition when the update returns null', async (): Promise<void> => {
    findByIdAndUpdateMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

    const result = await repository.syncForOpus([createCompositionInput(EXISTING_COMPOSITION_ID)]);

    expect(findByIdAndUpdateMock).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('searchByTitle returns matching compositions for a non-blank search', async (): Promise<void> => {
    const queryChain = createChainableQueryMock([createMockDoc()]);
    findMock.mockReturnValue(queryChain);

    const result = await repository.searchByTitle(`  ${SEARCH_QUERY}  `);

    expect(findMock).toHaveBeenCalled();
    expect(queryChain.limit).toHaveBeenCalledWith(10);
    expect(result).toHaveLength(1);
    expect(result[0].name.uk).toBe('Після бою');
  });

  it('searchByTitle filters by ids when provided', async (): Promise<void> => {
    const queryChain = createChainableQueryMock([createMockDoc()]);
    findMock.mockReturnValue(queryChain);

    const result = await repository.searchByTitle(SEARCH_QUERY, [VALID_OBJECT_ID_1]);

    expect(findMock).toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  it('should return an empty array if no valid ids are provided to findByIds', async (): Promise<void> => {
    const result = await repository.findByIds([INVALID_ID]);

    expect(result).toEqual([]);
    expect(findMock).not.toHaveBeenCalled();
  });

  it('should fetch and map compositions for valid ids in findByIds', async (): Promise<void> => {
    const queryChain = createChainableQueryMock([createMockDoc()]);
    findMock.mockReturnValue(queryChain);

    const result = await repository.findByIds([VALID_OBJECT_ID_1, VALID_OBJECT_ID_2, INVALID_ID]);

    expect(findMock).toHaveBeenCalled();
    expect(queryChain.sort).toHaveBeenCalledWith({ order: 1, _id: 1 });
    expect(result).toHaveLength(1);
  });

  it('countByIds returns 0 for invalid ids', async (): Promise<void> => {
    const result = await repository.countByIds([INVALID_ID]);

    expect(result).toBe(0);
    expect(countDocumentsMock).not.toHaveBeenCalled();
  });

  it('countByIds returns document count for valid ids', async (): Promise<void> => {
    countDocumentsMock.mockResolvedValue(5);

    const result = await repository.countByIds([VALID_OBJECT_ID_1]);

    expect(result).toBe(5);
    expect(countDocumentsMock).toHaveBeenCalled();
  });

  it('findByIdsPaginated returns empty array for invalid ids', async (): Promise<void> => {
    const result = await repository.findByIdsPaginated([INVALID_ID]);

    expect(result).toEqual([]);
    expect(findMock).not.toHaveBeenCalled();
  });

  it('findByIdsPaginated returns paginated compositions with sorting, skip, and limit', async (): Promise<void> => {
    const queryChain = createChainableQueryMock([createMockDoc()]);
    findMock.mockReturnValue(queryChain);

    const filters: CompositionFilters = {
      skip: 5,
      limit: 10,
      sort: [{ sortBy: 'number', sortOrder: SortOrder.Asc }]
    };

    const result = await repository.findByIdsPaginated([VALID_OBJECT_ID_1], filters);

    expect(findMock).toHaveBeenCalled();
    expect(queryChain.sort).toHaveBeenCalled();
    expect(queryChain.collation).toHaveBeenCalledWith({ locale: 'uk', numericOrdering: true });
    expect(queryChain.skip).toHaveBeenCalledWith(5);
    expect(queryChain.limit).toHaveBeenCalledWith(10);
    expect(result).toHaveLength(1);
  });

  it('findByIdsPaginated works correctly without skip and limit filters', async (): Promise<void> => {
    const queryChain = createChainableQueryMock([createMockDoc()]);
    findMock.mockReturnValue(queryChain);

    const result = await repository.findByIdsPaginated([VALID_OBJECT_ID_1]);

    expect(queryChain.skip).not.toHaveBeenCalled();
    expect(queryChain.limit).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  it('syncForOpus returns empty array when given an empty inputs array', async (): Promise<void> => {
    const result = await repository.syncForOpus([]);
    expect(result).toEqual([]);
  });

  it('should execute baseRepo buildQuery and getDefaultSort when findAll is called', async (): Promise<void> => {
    const queryChain = createChainableQueryMock([createMockDoc()]);
    findMock.mockReturnValue(queryChain);

    const result = await repository.findAll({ search: 'тест' });

    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({
        $and: expect.arrayContaining([{ 'name.uk': { $exists: true, $ne: null } }])
      })
    );
    expect(result).toHaveLength(1);
  });

  it('should trigger default extraConditions parameter in buildCompositionQuery', async (): Promise<void> => {
    const queryChain = createChainableQueryMock([createMockDoc()]);
    findMock.mockReturnValue(queryChain);

    await repository.findAll({});

    expect(findMock).toHaveBeenCalled();
  });
});
