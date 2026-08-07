import { Model } from 'mongoose';

import { DbFond, FondRepository } from './fondRepository';
import { LocalizedString } from '~/src/domain/entities/BaseContent';
import { Fond } from '~/src/domain/entities/Fond';
import { CreateFondInput } from '~/src/domain/repositories/fondRepository';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const mockId = '65eddf5e2f1a2b3c4d5e6f7a';

const createMockFondDoc = (overrides: Partial<DbFond> = {}): DbFond => ({
  _id: { toString: () => mockId },
  fondNumber: 1,
  name: { uk: 'Архів', en: 'Archive' },
  documentCreationDate: { uk: '1917', en: '1917' },
  status: BaseContentStatuses.Draft,
  chronologicalBoundaries: { uk: '1918', en: '1918' },
  description: { uk: 'опис', en: 'desc' },
  organizationForm: { uk: 'оргФорм', en: 'orgForm' },
  casesCount: 0,
  descriptionsCount: 0,
  createdAt: '2026-07-29T10:00:00.000Z',
  updatedAt: '2026-07-29T10:00:00.000Z',
  ...overrides
});

jest.mock('../../db/connect', () => jest.fn());

const saveMock = jest.fn();
const findOneMock = jest.fn();
const findAllMock = jest.fn();

describe('fondRepository', () => {
  const MockFondModel = jest.fn().mockImplementation(() => ({
    save: saveMock,
  })) as unknown as Model<DbFond>;

  Object.assign(MockFondModel, {
    findOne: findOneMock,
    find: findAllMock,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const repository = FondRepository({ FondModel: MockFondModel });

  it('should create a fond and return the mapped entity', async () => {
    const newFond: CreateFondInput = {
      fondNumber: 2,
      name: { uk: 'Архів 2', en: 'Archive 2' },
      documentCreationDate: { uk: '1918', en: '1918' },
      chronologicalBoundaries: { uk: '1918', en: '1918' },
      description: { uk: 'опис', en: 'desc' } as unknown as LocalizedString,
      organizationForm: { uk: 'оргФорм', en: 'orgForm' },
      status: BaseContentStatuses.Draft
    };

    saveMock.mockResolvedValue({ toObject: () => createMockFondDoc({ ...newFond }) });
    const result = await repository.create(newFond);

    expect(saveMock).toHaveBeenCalled();

    expect(result.fondNumber).toEqual(newFond.fondNumber);
    expect(result.name).toStrictEqual(newFond.name);

    expect(result.id).toBeDefined();
    expect(result.updatedAt).toBeDefined();
    expect(result.createdAt).toBeDefined();
  });

  it('should NOT create a fond if it already exists', async () => {
    const duplicateFond = createMockFondDoc();
    saveMock.mockRejectedValue(new Error('E11000 duplicate key error'));

    await expect(repository.create(duplicateFond)).rejects.toThrow();
  });

  it('should find a fond by fondNumber and return the mapped entity', async () => {
    const existedFond = createMockFondDoc();
    findOneMock.mockResolvedValue({ toObject: () => existedFond });
    const result = await repository.findByFondNumber(existedFond.fondNumber);

    expect(result).not.toBeNull();
    expect((result as Fond).fondNumber).toEqual(existedFond.fondNumber);

    expect((result as Fond).id).toBeDefined();
    expect((result as Fond).updatedAt).toBeDefined();
    expect((result as Fond).createdAt).toBeDefined();
  });

  it('should return null if find not find by fondNumber', async () => {
    findOneMock.mockResolvedValue(null);
    const result = await repository.findByFondNumber(999);

    expect(result).toBeNull();
  });

  it('should default casesCount and descriptionsCount to 0 when missing on the document', async () => {
    const doc = createMockFondDoc({
      casesCount: undefined as unknown as number,
      descriptionsCount: undefined as unknown as number
    });
    findOneMock.mockResolvedValue({ toObject: () => doc });

    const result = await repository.findByFondNumber(doc.fondNumber);

    expect((result as Fond).casesCount).toBe(0);
    expect((result as Fond).descriptionsCount).toBe(0);
  });

  it('should map casesCount and descriptionsCount when present on the document', async () => {
    const doc = createMockFondDoc({ casesCount: 5, descriptionsCount: 2 });
    findOneMock.mockResolvedValue({ toObject: () => doc });

    const result = await repository.findByFondNumber(doc.fondNumber);

    expect((result as Fond).casesCount).toBe(5);
    expect((result as Fond).descriptionsCount).toBe(2);
  });

  describe('findByIds', () => {
    const otherId = '65eddf5e2f1a2b3c4d5e6f7b';

    it('should query only by the valid ObjectIds and return the mapped entities', async () => {
      const docs = [createMockFondDoc(), createMockFondDoc({ _id: { toString: () => otherId }, fondNumber: 2 })];
      const leanMock = jest.fn().mockResolvedValue(docs);
      findAllMock.mockReturnValue({ lean: leanMock });

      const result = await repository.findByIds([mockId, otherId]);

      expect(findAllMock).toHaveBeenCalledWith({ _id: { $in: [mockId, otherId] } });
      expect(result).toHaveLength(2);
      expect(result[0].fondNumber).toBe(1);
      expect(result[1].fondNumber).toBe(2);
    });

    it('should filter out invalid ObjectIds before querying', async () => {
      const leanMock = jest.fn().mockResolvedValue([createMockFondDoc()]);
      findAllMock.mockReturnValue({ lean: leanMock });

      await repository.findByIds([mockId, 'not-a-valid-object-id']);

      expect(findAllMock).toHaveBeenCalledWith({ _id: { $in: [mockId] } });
    });

    it('should return an empty array without querying when no valid ids are provided', async () => {
      const result = await repository.findByIds(['not-a-valid-object-id']);

      expect(findAllMock).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});