import { Model } from 'mongoose';

import { createBaseRepository } from '../baseRepository/baseRepository';
import { DbFond, FondRepository } from './fondRepository';
import { LocalizedString } from '~/src/domain/entities/BaseContent';
import { CreateFondInput, FondFilters, UpdateFondInput } from '~/src/domain/repositories/fondRepository';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const mockId = '65eddf5e2f1a2b3c4d5e6f7a';

const createMockFondDoc = (overrides: Partial<DbFond> = {}): DbFond => ({
  _id: { toString: () => mockId },
  id: 1,
  title: { uk: 'Архів', en: 'Archive' },
  documentCreationDate: '1917',
  status: BaseContentStatuses.Draft,
  chronologicalBoundaries: '1918',
  characterAndContent: { uk: { type: 'doc' }, en: { type: 'doc' } },
  organizationForm: { uk: 'оргФорм', en: 'orgForm' },
  numberOfCases: 0,
  numberOfDescriptions: 0,
  createdAt: '2026-07-29T10:00:00.000Z',
  updatedAt: '2026-07-29T10:00:00.000Z',
  ...overrides
});

jest.mock('../../db/connect', () => jest.fn());

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

jest.mock('../baseRepository/baseRepository', () => ({
  createBaseRepository: jest.fn().mockReturnValue({})
}));

jest.mock('~/src/middleware/logger/logger', () => ({
  __esModule: true,
  default: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  }
}));

const saveMock = jest.fn();
const findOneMock = jest.fn();
const findAllMock = jest.fn();
const findByIdAndUpdateMock = jest.fn();

describe('fondRepository', () => {
  const MockFondModel = jest.fn().mockImplementation(() => ({
    save: saveMock,
  })) as unknown as Model<DbFond>;

  Object.assign(MockFondModel, {
    findOne: findOneMock,
    find: findAllMock,
    findByIdAndUpdate: findByIdAndUpdateMock,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const repository = FondRepository({ FondModel: MockFondModel });

  describe('create', () => {
    it('should create a fond and return the mapped entity with correctly parsed JSON', async () => {
      const newFond: CreateFondInput = {
        fondNumber: 2,
        name: { uk: 'Архів 2', en: 'Archive 2' },
        documentCreationDate: { uk: '1918', en: '1918' },
        chronologicalBoundaries: { uk: '1918', en: '1918' },
        description: { uk: '{"type":"doc"}', en: 'invalid json' } as unknown as LocalizedString,
        organizationForm: { uk: 'оргФорм', en: 'orgForm' },
        status: BaseContentStatuses.Draft
      };

      saveMock.mockResolvedValue({
        toObject: () => createMockFondDoc({
          id: newFond.fondNumber,
          title: newFond.name,
          documentCreationDate: newFond.documentCreationDate.uk,
          chronologicalBoundaries: newFond.chronologicalBoundaries?.uk,
          organizationForm: newFond.organizationForm,
          characterAndContent: { uk: { type: 'doc' }, en: {} },
          status: newFond.status
        })
      });

      const result = await repository.create(newFond);

      expect(saveMock).toHaveBeenCalled();
      expect(result.fondNumber).toEqual(newFond.fondNumber);
      expect(result.name).toStrictEqual(newFond.name);

      expect(result.description?.uk).toEqual({ type: 'doc' });
      expect(result.description?.en).toEqual({});

      expect(result.id).toBeDefined();
    });

    it('should create a fond without optional fields', async () => {
      const newFond: CreateFondInput = {
        fondNumber: 3,
        name: { uk: 'Архів 3', en: 'Archive 3' },
        documentCreationDate: { uk: '1919', en: '1919' },
        status: BaseContentStatuses.Draft
      };

      saveMock.mockResolvedValue({
        toObject: () => createMockFondDoc({
          id: newFond.fondNumber,
          title: newFond.name,
          documentCreationDate: newFond.documentCreationDate.uk,
          chronologicalBoundaries: undefined,
          characterAndContent: undefined
        })
      });

      const result = await repository.create(newFond);
      expect(result.chronologicalBoundaries).toBeUndefined();
      expect(result.description).toBeUndefined();
    });

    it('should handle falsy values and arrays in description JSON parsing correctly', async () => {
      const newFond: CreateFondInput = {
        fondNumber: 4,
        name: { uk: '4', en: '4' },
        documentCreationDate: { uk: '4', en: '4' },
        description: { uk: '', en: '[]' } as unknown as LocalizedString,
        status: BaseContentStatuses.Draft
      };

      saveMock.mockResolvedValue({
        toObject: () => createMockFondDoc({ characterAndContent: { uk: {}, en: {} } })
      });

      const result = await repository.create(newFond);
      expect(result.description?.uk).toEqual({});
      expect(result.description?.en).toEqual({});
    });

    it('should default status to Hidden when input.status is not provided', async () => {
      const newFond = {
        fondNumber: 5,
        name: { uk: '5', en: '5' },
        documentCreationDate: { uk: '5', en: '5' }
      } as CreateFondInput;

      saveMock.mockResolvedValue({
        toObject: () => createMockFondDoc({ id: newFond.fondNumber, status: BaseContentStatuses.Hidden })
      });

      await repository.create(newFond);

      expect(MockFondModel).toHaveBeenCalledWith(
        expect.objectContaining({ status: BaseContentStatuses.Hidden })
      );
    });

    it('should NOT create a fond if it already exists', async () => {
      const duplicateFond: CreateFondInput = {
        fondNumber: 1,
        name: { uk: '1', en: '1' },
        documentCreationDate: { uk: '1', en: '1' },
        status: BaseContentStatuses.Draft
      };
      saveMock.mockRejectedValue(new Error('E11000 duplicate key error'));

      await expect(repository.create(duplicateFond)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a fond successfully mapping all fields', async () => {
      const updateInput = {
        name: { uk: 'Оновлено', en: 'Updated' },
        documentCreationDate: { uk: '1920', en: '1920' },
        chronologicalBoundaries: { uk: '1921', en: '1921' },
        organizationForm: { uk: 'Нова Форма', en: 'New Form' },
        description: { uk: '{"valid":"json"}', en: 'null' },
        status: BaseContentStatuses.Published,
        casesCount: 10,
        descriptionsCount: 5,
      } as unknown as UpdateFondInput;

      const leanMock = jest.fn().mockResolvedValue(createMockFondDoc({
        title: updateInput.name,
        documentCreationDate: updateInput.documentCreationDate?.uk as string,
        chronologicalBoundaries: updateInput.chronologicalBoundaries?.uk,
        organizationForm: updateInput.organizationForm,
        characterAndContent: { uk: { valid: 'json' }, en: {} },
        status: updateInput.status,
        numberOfCases: (updateInput as UpdateFondInput & { casesCount?: number }).casesCount,
        numberOfDescriptions: (updateInput as UpdateFondInput & { descriptionsCount?: number }).descriptionsCount,
      }));
      findByIdAndUpdateMock.mockReturnValue({ lean: leanMock });

      const result = await repository.update(mockId, updateInput);

      expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
        mockId,
        expect.objectContaining({
          title: updateInput.name,
          numberOfCases: 10,
          numberOfDescriptions: 5,
          characterAndContent: { uk: { valid: 'json' }, en: {} }
        }),
        expect.any(Object)
      );

      expect(result?.name).toEqual(updateInput.name);
      expect(result?.casesCount).toBe(10);
      expect(result?.description?.uk).toEqual({ valid: 'json' });
    });

    it('should update only the fields explicitly present on the input (partial update)', async () => {
      const updateInput: UpdateFondInput = {
        chronologicalBoundaries: undefined
      } as UpdateFondInput;

      const leanMock = jest.fn().mockResolvedValue(createMockFondDoc());
      findByIdAndUpdateMock.mockReturnValue({ lean: leanMock });

      await repository.update(mockId, {});

      expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
        mockId,
        expect.not.objectContaining({
          title: expect.anything(),
          documentCreationDate: expect.anything(),
          chronologicalBoundaries: expect.anything(),
          organizationForm: expect.anything(),
          characterAndContent: expect.anything(),
          status: expect.anything(),
          numberOfCases: expect.anything(),
          numberOfDescriptions: expect.anything()
        }),
        expect.objectContaining({})
      );

      expect(updateInput.chronologicalBoundaries).toBeUndefined();
    });

    it('should return null if the id is invalid', async () => {
      const result = await repository.update('invalid-id', {});
      expect(result).toBeNull();
      expect(findByIdAndUpdateMock).not.toHaveBeenCalled();
    });

    it('should return null if fond is not found during update', async () => {
      const leanMock = jest.fn().mockResolvedValue(null);
      findByIdAndUpdateMock.mockReturnValue({ lean: leanMock });

      const result = await repository.update(mockId, {});
      expect(result).toBeNull();
    });
  });

  describe('findByFondNumber & entity mapping logic', () => {
    it('should find a fond by fondNumber and return the mapped entity', async () => {
      const existedFond = createMockFondDoc();
      findOneMock.mockResolvedValue({ toObject: () => existedFond });
      const result = await repository.findByFondNumber(existedFond.id);

      expect(result).not.toBeNull();
      expect(result?.fondNumber).toEqual(existedFond.id);
      expect(result?.id).toBeDefined();
    });

    it('should return null if not found by fondNumber', async () => {
      findOneMock.mockResolvedValue(null);
      const result = await repository.findByFondNumber(999);
      expect(result).toBeNull();
    });

    it('should default casesCount and descriptionsCount to 0 when missing', async () => {
      const doc = createMockFondDoc({
        numberOfCases: undefined as unknown as number,
        numberOfDescriptions: undefined as unknown as number
      });
      findOneMock.mockResolvedValue({ toObject: () => doc });

      const result = await repository.findByFondNumber(doc.id);

      expect(result?.casesCount).toBe(0);
      expect(result?.descriptionsCount).toBe(0);
    });

    it('should map casesCount and descriptionsCount when present', async () => {
      const doc = createMockFondDoc({ numberOfCases: 5, numberOfDescriptions: 2 });
      findOneMock.mockResolvedValue({ toObject: () => doc });

      const result = await repository.findByFondNumber(doc.id);

      expect(result?.casesCount).toBe(5);
      expect(result?.descriptionsCount).toBe(2);
    });

    it('should resolve invalid or missing status to Hidden', async () => {
      const doc = createMockFondDoc({ status: 'invalid_status' });
      findOneMock.mockResolvedValue({ toObject: () => doc });

      const result = await repository.findByFondNumber(doc.id);

      expect(result?.status).toBe(BaseContentStatuses.Hidden);
    });

    it('should resolve an undefined status to Hidden', async () => {
      const doc = createMockFondDoc({ status: undefined });
      findOneMock.mockResolvedValue({ toObject: () => doc });

      const result = await repository.findByFondNumber(doc.id);

      expect(result?.status).toBe(BaseContentStatuses.Hidden);
    });

    it('should fallback to current date if createdAt and updatedAt are missing', async () => {
      const doc = createMockFondDoc({ createdAt: '', updatedAt: '' });
      findOneMock.mockResolvedValue({ toObject: () => doc });

      const result = await repository.findByFondNumber(doc.id);

      expect(result?.createdAt).toBeDefined();
      expect(result?.updatedAt).toBeDefined();
    });

    it('should not treat missing chronologicalBoundaries/organizationForm as present', async () => {
      const doc = createMockFondDoc({ chronologicalBoundaries: undefined, organizationForm: undefined });
      findOneMock.mockResolvedValue({ toObject: () => doc });

      const result = await repository.findByFondNumber(doc.id);

      expect(result?.chronologicalBoundaries).toBeUndefined();
      expect(result?.organizationForm).toBeUndefined();
    });
  });

  describe('findByIds', () => {
    const otherId = '65eddf5e2f1a2b3c4d5e6f7b';

    it('should query only by the valid ObjectIds and return the mapped entities', async () => {
      const docs = [createMockFondDoc(), createMockFondDoc({ _id: { toString: () => otherId }, id: 2 })];
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

  describe('buildQuery config passed to createBaseRepository', () => {
    const mockedCreateBaseRepository = createBaseRepository as jest.MockedFunction<typeof createBaseRepository>;

    const latestBuildQuery = (): ((filters: FondFilters) => Record<string, unknown>) => {
      const calls = mockedCreateBaseRepository.mock.calls;
      const config = calls[calls.length - 1][0];
      return config.buildQuery as (filters: FondFilters) => Record<string, unknown>;
    };

    it('should build a base title query and add no status filter when statuses are absent', () => {
      FondRepository({ FondModel: MockFondModel });
      const buildQuery = latestBuildQuery();

      const query = buildQuery({} as FondFilters);

      expect(query).not.toHaveProperty('status');
    });

    it('should add a status $in filter when statuses are provided', () => {
      FondRepository({ FondModel: MockFondModel });
      const buildQuery = latestBuildQuery();

      const query = buildQuery({ statuses: [BaseContentStatuses.Published] } as FondFilters);

      expect(query.status).toEqual({ $in: [BaseContentStatuses.Published] });
    });

    it('should NOT add a status filter when statuses is an empty array', () => {
      FondRepository({ FondModel: MockFondModel });
      const buildQuery = latestBuildQuery();

      const query = buildQuery({ statuses: [] } as unknown as FondFilters);

      expect(query).not.toHaveProperty('status');
    });
  });
});