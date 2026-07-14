import { Model } from 'mongoose';

import { CompositionRepository, DbComposition } from './compositionRepository';

jest.mock('mongoose', () => ({
  Types: {
    ObjectId: {
      isValid: (id: string) => /^[0-9a-fA-F]{24}$/.test(id)
    }
  }
}));

jest.mock('~/infrastructure/db/connect', () => jest.fn());

const opusId = '65eddf5e2f1a2b3c4d5e6f7a';
const existingCompositionId = '65eddf5e2f1a2b3c4d5e6f7b';

const createMockDoc = (overrides: Partial<DbComposition> = {}): DbComposition => ({
  _id: { toString: () => 'c1' },
  opusId: { toString: () => opusId },
  title: { uk: 'Після бою', en: 'After Battle' },
  year: 1920,
  genre: 'Романс',
  genres: [],
  categories: [],
  audioAvailable: false,
  sheetAvailable: false,
  sheetMusic: [],
  audios: [],
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
  ...overrides
});

const compositionInput = (id?: string) => ({
  id,
  opusId: null,
  title: { uk: 'Після бою', en: 'After Battle' },
  year: 1920,
  genre: 'Романс',
  genres: [],
  categories: [],
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

  const MockModel = jest.fn().mockImplementation(() => ({ save: saveMock })) as unknown as Model<DbComposition> & {
    find: jest.Mock;
    updateMany: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    deleteMany: jest.Mock;
  };

  MockModel.find = findMock;
  MockModel.updateMany = updateManyMock;
  MockModel.findByIdAndUpdate = findByIdAndUpdateMock;
  MockModel.deleteMany = deleteManyMock;

  const repository = CompositionRepository({ CompositionModel: MockModel });

  beforeEach(() => {
    jest.clearAllMocks();
    updateManyMock.mockResolvedValue({});
    deleteManyMock.mockResolvedValue(undefined);
  });

  it('findByOpusId returns compositions for the opus ordered by drag position', async () => {
    const sortMock = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([createMockDoc()]) });
    findMock.mockReturnValue({ sort: sortMock });

    const result = await repository.findByOpusId(opusId);

    expect(findMock).toHaveBeenCalledWith({ opusId });
    expect(sortMock).toHaveBeenCalledWith({ order: 1, _id: 1 });
    expect(result).toHaveLength(1);
    expect(result[0].title.uk).toBe('Після бою');
    expect(result[0].opusId).toBe(opusId);
  });

  it('syncForOpus creates new compositions and unlinks removed ones', async () => {
    saveMock.mockResolvedValue({ toObject: () => createMockDoc() });

    const result = await repository.syncForOpus(opusId, [compositionInput()]);

    expect(updateManyMock).toHaveBeenCalledWith({ opusId, _id: { $nin: [] } }, { $set: { opusId: null } });
    expect(saveMock).toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  it('syncForOpus links an existing composition by id instead of duplicating', async () => {
    findByIdAndUpdateMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(createMockDoc()) });

    const result = await repository.syncForOpus(opusId, [compositionInput(existingCompositionId)]);

    expect(updateManyMock).toHaveBeenCalledWith(
      { opusId, _id: { $nin: [existingCompositionId] } },
      { $set: { opusId: null } }
    );
    expect(findByIdAndUpdateMock).toHaveBeenCalledWith(existingCompositionId, expect.objectContaining({ opusId }), {
      new: true
    });
    expect(saveMock).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  it('searchByTitle returns an empty array for a blank search', async () => {
    const result = await repository.searchByTitle('   ');

    expect(result).toEqual([]);
  });

  it('findByOpusId applies fallback defaults for nullish document fields', async (): Promise<void> => {
    const doc = createMockDoc({
      opusId: null,
      order: null,
      year: null,
      genre: null,
      genres: undefined,
      categories: undefined,
      audioAvailable: undefined,
      sheetAvailable: undefined,
      sheetMusic: undefined,
      audios: undefined
    });
    const sortMock = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([doc]) });
    findMock.mockReturnValue({ sort: sortMock });

    const [result] = await repository.findByOpusId(opusId);

    expect(result.opusId).toBeNull();
    expect(result.order).toBe(0);
    expect(result.year).toBeUndefined();
    expect(result.genre).toBeUndefined();
    expect(result.genres).toEqual([]);
    expect(result.categories).toEqual([]);
    expect(result.audioAvailable).toBe(false);
    expect(result.sheetAvailable).toBe(false);
    expect(result.sheetMusic).toEqual([]);
    expect(result.audios).toEqual([]);
  });

  it('findByOpusId maps genre and category refs to string ids', async (): Promise<void> => {
    const doc = createMockDoc({
      genres: [{ toString: (): string => 'genre-1' }],
      categories: [{ toString: (): string => 'category-1' }]
    });
    const sortMock = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([doc]) });
    findMock.mockReturnValue({ sort: sortMock });

    const [result] = await repository.findByOpusId(opusId);

    expect(result.genres).toEqual(['genre-1']);
    expect(result.categories).toEqual(['category-1']);
  });

  it('findByOpusId returns an empty array for an invalid opusId', async (): Promise<void> => {
    const result = await repository.findByOpusId('not-a-valid-object-id');

    expect(result).toEqual([]);
    expect(findMock).not.toHaveBeenCalled();
  });

  it('syncForOpus returns an empty array for an invalid opusId', async (): Promise<void> => {
    const result = await repository.syncForOpus('not-a-valid-object-id', [compositionInput()]);

    expect(result).toEqual([]);
    expect(updateManyMock).not.toHaveBeenCalled();
  });

  it('syncForOpus creates a new composition when the input id is not a valid object id', async (): Promise<void> => {
    saveMock.mockResolvedValue({ toObject: () => createMockDoc() });

    const result = await repository.syncForOpus(opusId, [compositionInput('invalid-id')]);

    expect(updateManyMock).toHaveBeenCalledWith({ opusId, _id: { $nin: [] } }, { $set: { opusId: null } });
    expect(findByIdAndUpdateMock).not.toHaveBeenCalled();
    expect(saveMock).toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  it('syncForOpus skips a linked composition when the update returns null', async (): Promise<void> => {
    findByIdAndUpdateMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

    const result = await repository.syncForOpus(opusId, [compositionInput(existingCompositionId)]);

    expect(findByIdAndUpdateMock).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('searchByTitle returns matching compositions for a non-blank search', async (): Promise<void> => {
    const limitMock = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([createMockDoc()]) });
    findMock.mockReturnValue({ limit: limitMock });

    const result = await repository.searchByTitle('  Після  ');

    expect(findMock).toHaveBeenCalledWith({
      $or: [{ 'title.uk': { $regex: 'Після', $options: 'i' } }, { 'title.en': { $regex: 'Після', $options: 'i' } }]
    });
    expect(limitMock).toHaveBeenCalledWith(10);
    expect(result).toHaveLength(1);
    expect(result[0].title.uk).toBe('Після бою');
  });

  it('deleteByOpusId removes compositions for a valid opusId', async (): Promise<void> => {
    await repository.deleteByOpusId(opusId);

    expect(deleteManyMock).toHaveBeenCalledWith({ opusId });
  });

  it('deleteByOpusId does nothing for an invalid opusId', async (): Promise<void> => {
    await repository.deleteByOpusId('not-a-valid-object-id');

    expect(deleteManyMock).not.toHaveBeenCalled();
  });

  it('unlinkByOpusId sets opusId to null for a valid opusId', async (): Promise<void> => {
    await repository.unlinckByOpusId(opusId);

    expect(updateManyMock).toHaveBeenCalledWith({ opusId }, { $set: { opusId: null } });
  });

  it('unlinkByOpusId does nothing for an invalid opusId', async (): Promise<void> => {
    await repository.unlinckByOpusId('not-a-valid-object-id');

    expect(updateManyMock).not.toHaveBeenCalled();
  });
});
