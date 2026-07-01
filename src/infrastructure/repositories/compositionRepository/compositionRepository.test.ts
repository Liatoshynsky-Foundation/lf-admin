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
  const saveMock = jest.fn();

  const MockModel = jest.fn().mockImplementation(() => ({ save: saveMock })) as unknown as Model<DbComposition> & {
    find: jest.Mock;
    updateMany: jest.Mock;
    findByIdAndUpdate: jest.Mock;
  };

  MockModel.find = findMock;
  MockModel.updateMany = updateManyMock;
  MockModel.findByIdAndUpdate = findByIdAndUpdateMock;

  const repository = CompositionRepository({ CompositionModel: MockModel });

  beforeEach(() => {
    jest.clearAllMocks();
    updateManyMock.mockResolvedValue({});
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
    expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
      existingCompositionId,
      expect.objectContaining({ opusId }),
      { new: true }
    );
    expect(saveMock).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  it('searchByTitle returns an empty array for a blank search', async () => {
    const result = await repository.searchByTitle('   ');

    expect(result).toEqual([]);
  });
});
