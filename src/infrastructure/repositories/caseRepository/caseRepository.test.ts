import { Model } from 'mongoose';

import { CaseRepository, DbCase } from './caseRepository';
import { Case } from '~/src/domain/entities/Case';
import { CreateCaseInput } from '~/src/domain/repositories/caseRepository';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const mockId = '65eddf5e2f1a2b3c4d5e6f7a';
const mockFundId = '65eddf5e2f1a2b3c4d5e6f7b';

const createMockCaseDoc = (overrides: Partial<DbCase> = {}): DbCase => ({
  _id: { toString: () => mockId },
  fundId: mockFundId,
  descriptionNumber: 1,
  caseNumber: 1,
  order: 1,
  caseName: { uk: 'Справа', en: 'Case' },
  caseDate: { uk: '1917-1918', en: '1917-1918' },
  sheetsNumber: 10,
  caseDescriptions: { uk: 'Опис', en: 'Description' },
  detailedCaseDescription: { uk: 'Детальний опис', en: 'Detailed description' },
  pdfFile: null,
  status: BaseContentStatuses.Draft,
  createdAt: '2026-07-29T10:00:00.000Z',
  updatedAt: '2026-07-29T10:00:00.000Z',
  ...overrides
});

jest.mock('../../db/connect', () => jest.fn());

const saveMock = jest.fn();
const findOneMock = jest.fn();
const findAllMock = jest.fn();
const distinctMock = jest.fn();

describe('caseRepository', () => {
  const MockCaseModel = jest.fn().mockImplementation(() => ({
    save: saveMock
  })) as unknown as Model<DbCase>;

  Object.assign(MockCaseModel, {
    findOne: findOneMock,
    find: findAllMock,
    distinct: distinctMock
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const repository = CaseRepository({ CaseModel: MockCaseModel });

  it('should create a case and return the mapped entity', async () => {
    const newCase: CreateCaseInput = {
      fundId: mockFundId,
      descriptionNumber: 2,
      caseNumber: 3,
      caseName: { uk: 'Справа 2', en: 'Case 2' },
      caseDate: { uk: '1918', en: '1918' },
      sheetsNumber: 20,
      caseDescriptions: { uk: 'Опис 2', en: 'Description 2' },
      detailedCaseDescription: { uk: 'Деталі', en: 'Details' },
      status: BaseContentStatuses.Hidden,
      order: 0
    };

    findOneMock.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(null)
    });
    saveMock.mockResolvedValue({ toObject: () => createMockCaseDoc({ ...newCase }) });
    const result = await repository.create(newCase);

    expect(findOneMock).toHaveBeenCalledWith({ fundId: newCase.fundId });
    expect(saveMock).toHaveBeenCalled();

    expect(result.descriptionNumber).toEqual(newCase.descriptionNumber);
    expect(result.caseNumber).toEqual(newCase.caseNumber);
    expect(result.caseName).toStrictEqual(newCase.caseName);

    expect(result.id).toBeDefined();
    expect(result.updatedAt).toBeDefined();
    expect(result.createdAt).toBeDefined();
  });

  it('should NOT create a case if the fundId+descriptionNumber+caseNumber combination already exists', async () => {
    const duplicateCase = createMockCaseDoc();
    findOneMock.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(null)
    });
    saveMock.mockRejectedValue(new Error('E11000 duplicate key error'));

    await expect(repository.create(duplicateCase)).rejects.toThrow();
  });

  describe('create - order assignment (nextOrder branch)', () => {
    it('uses input.order when it is greater than 0, ignoring the last case order', async () => {
      const newCase: CreateCaseInput = {
        fundId: mockFundId,
        descriptionNumber: 2,
        caseNumber: 3,
        caseName: { uk: 'Справа 2', en: 'Case 2' },
        caseDate: { uk: '1918', en: '1918' },
        sheetsNumber: 20,
        caseDescriptions: { uk: 'Опис 2', en: 'Description 2' },
        detailedCaseDescription: { uk: 'Деталі', en: 'Details' },
        status: BaseContentStatuses.Hidden,
        order: 5
      };

      findOneMock.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ order: 99 })
      });
      saveMock.mockResolvedValue({ toObject: () => createMockCaseDoc({ order: 5 }) });

      await repository.create(newCase);

      expect(MockCaseModel).toHaveBeenCalledWith(expect.objectContaining({ order: 5 }));
    });

    it('falls back to lastCase.order + 1 when input.order is 0', async () => {
      const newCase: CreateCaseInput = {
        fundId: mockFundId,
        descriptionNumber: 2,
        caseNumber: 3,
        caseName: { uk: 'Справа 2', en: 'Case 2' },
        caseDate: { uk: '1918', en: '1918' },
        sheetsNumber: 20,
        caseDescriptions: { uk: 'Опис 2', en: 'Description 2' },
        detailedCaseDescription: { uk: 'Деталі', en: 'Details' },
        status: BaseContentStatuses.Hidden,
        order: 0
      };

      findOneMock.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ order: 7 })
      });
      saveMock.mockResolvedValue({ toObject: () => createMockCaseDoc({ order: 8 }) });

      await repository.create(newCase);

      expect(MockCaseModel).toHaveBeenCalledWith(expect.objectContaining({ order: 8 }));
    });

    it('falls back to 1 when input.order is 0 and there is no last case for the fund', async () => {
      const newCase: CreateCaseInput = {
        fundId: mockFundId,
        descriptionNumber: 2,
        caseNumber: 3,
        caseName: { uk: 'Справа 2', en: 'Case 2' },
        caseDate: { uk: '1918', en: '1918' },
        sheetsNumber: 20,
        caseDescriptions: { uk: 'Опис 2', en: 'Description 2' },
        detailedCaseDescription: { uk: 'Деталі', en: 'Details' },
        status: BaseContentStatuses.Hidden,
        order: 0
      };

      findOneMock.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null)
      });
      saveMock.mockResolvedValue({ toObject: () => createMockCaseDoc({ order: 1 }) });

      await repository.create(newCase);

      expect(MockCaseModel).toHaveBeenCalledWith(expect.objectContaining({ order: 1 }));
    });

    it('falls back to lastCase.order + 1 when input.order is negative', async () => {
      const newCase: CreateCaseInput = {
        fundId: mockFundId,
        descriptionNumber: 2,
        caseNumber: 3,
        caseName: { uk: 'Справа 2', en: 'Case 2' },
        caseDate: { uk: '1918', en: '1918' },
        sheetsNumber: 20,
        caseDescriptions: { uk: 'Опис 2', en: 'Description 2' },
        detailedCaseDescription: { uk: 'Деталі', en: 'Details' },
        status: BaseContentStatuses.Hidden,
        order: -3
      };

      findOneMock.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ order: 4 })
      });
      saveMock.mockResolvedValue({ toObject: () => createMockCaseDoc({ order: 5 }) });

      await repository.create(newCase);

      expect(MockCaseModel).toHaveBeenCalledWith(expect.objectContaining({ order: 5 }));
    });
  });

  it('should find a case by fundId, descriptionNumber and caseNumber and return the mapped entity', async () => {
    const existedCase = createMockCaseDoc();
    findOneMock.mockResolvedValue({ toObject: () => existedCase });

    const result = await repository.findByFundAndNumbers(
      existedCase.fundId,
      existedCase.descriptionNumber,
      existedCase.caseNumber
    );

    expect(findOneMock).toHaveBeenCalledWith({
      fundId: existedCase.fundId,
      descriptionNumber: existedCase.descriptionNumber,
      caseNumber: existedCase.caseNumber
    });

    expect(result).not.toBeNull();
    expect((result as Case).caseNumber).toEqual(existedCase.caseNumber);
    expect((result as Case).descriptionNumber).toEqual(existedCase.descriptionNumber);

    expect((result as Case).id).toBeDefined();
    expect((result as Case).updatedAt).toBeDefined();
    expect((result as Case).createdAt).toBeDefined();
  });

  it('should return null if no case found by fundId, descriptionNumber and caseNumber', async () => {
    findOneMock.mockResolvedValue(null);
    const result = await repository.findByFundAndNumbers(mockFundId, 999, 999);

    expect(result).toBeNull();
  });

  it('should map fundId, detailedCaseDescription and pdfFile fallbacks correctly', async () => {
    const doc = createMockCaseDoc({
      fundId: undefined as unknown as string,
      detailedCaseDescription: undefined,
      pdfFile: { filename: 'archive.pdf', url: 'https://cdn/archive.pdf', mimeType: 'application/pdf' }
    });
    findOneMock.mockResolvedValue({ toObject: () => doc });

    const result = await repository.findByFundAndNumbers(mockFundId, 1, 1);

    expect(result?.fundId).toBeUndefined();
    expect(result?.detailedCaseDescription).toBeUndefined();
    expect(result?.pdfFile).toStrictEqual(doc.pdfFile);
  });

  describe('toEntity defaults (status/order fallbacks)', () => {
    it('defaults status to Hidden when the document has no status', async () => {
      const doc = createMockCaseDoc({ status: undefined as unknown as BaseContentStatuses });
      findOneMock.mockResolvedValue({ toObject: () => doc });

      const result = await repository.findByFundAndNumbers(mockFundId, 1, 1);

      expect(result?.status).toBe(BaseContentStatuses.Hidden);
    });

    it('keeps the document status when it is present', async () => {
      const doc = createMockCaseDoc({ status: BaseContentStatuses.Draft });
      findOneMock.mockResolvedValue({ toObject: () => doc });

      const result = await repository.findByFundAndNumbers(mockFundId, 1, 1);

      expect(result?.status).toBe(BaseContentStatuses.Draft);
    });

    it('defaults order to 0 when the document has no order', async () => {
      const doc = createMockCaseDoc({ order: undefined as unknown as number });
      findOneMock.mockResolvedValue({ toObject: () => doc });

      const result = await repository.findByFundAndNumbers(mockFundId, 1, 1);

      expect(result?.order).toBe(0);
    });

    it('keeps the document order when it is present (including 0)', async () => {
      const doc = createMockCaseDoc({ order: 0 });
      findOneMock.mockResolvedValue({ toObject: () => doc });

      const result = await repository.findByFundAndNumbers(mockFundId, 1, 1);

      expect(result?.order).toBe(0);
    });

    it('defaults createdAt/updatedAt to the current time when missing', async () => {
      const doc = createMockCaseDoc({
        createdAt: undefined as unknown as string,
        updatedAt: undefined as unknown as string
      });
      findOneMock.mockResolvedValue({ toObject: () => doc });

      const before = Date.now();
      const result = await repository.findByFundAndNumbers(mockFundId, 1, 1);
      const after = Date.now();

      expect(result?.createdAt).toBeDefined();
      expect(result?.updatedAt).toBeDefined();
      const createdAtMs = new Date(result!.createdAt as unknown as string).getTime();
      const updatedAtMs = new Date(result!.updatedAt as unknown as string).getTime();
      expect(createdAtMs).toBeGreaterThanOrEqual(before);
      expect(createdAtMs).toBeLessThanOrEqual(after);
      expect(updatedAtMs).toBeGreaterThanOrEqual(before);
      expect(updatedAtMs).toBeLessThanOrEqual(after);
    });
  });

  describe('toEntity legacy cipher fallback (getNumberFromCipher)', () => {
    it('uses descriptionNumber/caseNumber from the document when both are present, ignoring any cipher', async () => {
      const doc = {
        ...createMockCaseDoc({ descriptionNumber: 4, caseNumber: 9 }),
        cipher: 'ф.1, оп. 2, спр. 3'
      };
      findOneMock.mockResolvedValue({ toObject: () => doc });

      const result = await repository.findByFundAndNumbers(mockFundId, 4, 9);

      expect(result?.descriptionNumber).toBe(4);
      expect(result?.caseNumber).toBe(9);
    });

    it('derives descriptionNumber and caseNumber from a legacy cipher when both are missing on the document', async () => {
      const doc = {
        ...createMockCaseDoc({
          descriptionNumber: undefined as unknown as number,
          caseNumber: undefined as unknown as number
        }),
        cipher: 'ф. 12, оп. 34, спр. 56'
      };
      findOneMock.mockResolvedValue({ toObject: () => doc });

      const result = await repository.findByFundAndNumbers(mockFundId, 34, 56);

      expect(result?.descriptionNumber).toBe(34);
      expect(result?.caseNumber).toBe(56);
    });

    it('derives only descriptionNumber from cipher when caseNumber is present on the document', async () => {
      const doc = {
        ...createMockCaseDoc({
          descriptionNumber: undefined as unknown as number,
          caseNumber: 7
        }),
        cipher: 'оп. 21'
      };
      findOneMock.mockResolvedValue({ toObject: () => doc });

      const result = await repository.findByFundAndNumbers(mockFundId, 21, 7);

      expect(result?.descriptionNumber).toBe(21);
      expect(result?.caseNumber).toBe(7);
    });

    it('derives only caseNumber from cipher when descriptionNumber is present on the document', async () => {
      const doc = {
        ...createMockCaseDoc({
          descriptionNumber: 5,
          caseNumber: undefined as unknown as number
        }),
        cipher: 'спр. 42'
      };
      findOneMock.mockResolvedValue({ toObject: () => doc });

      const result = await repository.findByFundAndNumbers(mockFundId, 5, 42);

      expect(result?.descriptionNumber).toBe(5);
      expect(result?.caseNumber).toBe(42);
    });

    it('falls back to 1 for both numbers when descriptionNumber/caseNumber are missing and there is no cipher at all', async () => {
      const doc = createMockCaseDoc({
        descriptionNumber: undefined as unknown as number,
        caseNumber: undefined as unknown as number
      });
      findOneMock.mockResolvedValue({ toObject: () => doc });

      const result = await repository.findByFundAndNumbers(mockFundId, 1, 1);

      expect(result?.descriptionNumber).toBe(1);
      expect(result?.caseNumber).toBe(1);
    });

    it('falls back to 1 for both numbers when the cipher does not match the expected pattern', async () => {
      const doc = {
        ...createMockCaseDoc({
          descriptionNumber: undefined as unknown as number,
          caseNumber: undefined as unknown as number
        }),
        cipher: 'this cipher has no recognizable pattern'
      };
      findOneMock.mockResolvedValue({ toObject: () => doc });

      const result = await repository.findByFundAndNumbers(mockFundId, 1, 1);

      expect(result?.descriptionNumber).toBe(1);
      expect(result?.caseNumber).toBe(1);
    });

    it('matches the cipher pattern case-insensitively', async () => {
      const doc = {
        ...createMockCaseDoc({
          descriptionNumber: undefined as unknown as number,
          caseNumber: undefined as unknown as number
        }),
        cipher: 'ОП. 11, СПР. 22'
      };
      findOneMock.mockResolvedValue({ toObject: () => doc });

      const result = await repository.findByFundAndNumbers(mockFundId, 11, 22);

      expect(result?.descriptionNumber).toBe(11);
      expect(result?.caseNumber).toBe(22);
    });
  });

  describe('countDistinctDescriptionNumbers', () => {
    it('should return the number of distinct descriptionNumber values for a fund', async () => {
      distinctMock.mockResolvedValue([1, 2, 3]);

      const result = await repository.countDistinctDescriptionNumbers(mockFundId);

      expect(distinctMock).toHaveBeenCalledWith('descriptionNumber', { fundId: mockFundId });
      expect(result).toBe(3);
    });

    it('should return 0 when the fund has no cases', async () => {
      distinctMock.mockResolvedValue([]);

      const result = await repository.countDistinctDescriptionNumbers(mockFundId);

      expect(result).toBe(0);
    });
  });

  describe('findAll (buildCaseQuery)', () => {
    const createMockQueryBuilder = (resolvedValue: DbCase[]) => ({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(resolvedValue)
    });

    it('should query without a fundId condition when the fundId filter is not provided', async () => {
      findAllMock.mockReturnValue(createMockQueryBuilder([]));

      await repository.findAll({ search: 'Справа' });

      expect(findAllMock).toHaveBeenCalledWith({
        $or: [{ 'caseName.uk': expect.any(RegExp) }, { 'caseName.en': expect.any(RegExp) }]
      });
    });

    it('should add a fundId condition to the query when the fundId filter is provided', async () => {
      findAllMock.mockReturnValue(createMockQueryBuilder([]));

      await repository.findAll({ fundId: mockFundId });

      expect(findAllMock).toHaveBeenCalledWith({ fundId: mockFundId });
    });

    it('should combine the fundId condition with other filters using $and', async () => {
      findAllMock.mockReturnValue(createMockQueryBuilder([]));

      await repository.findAll({ fundId: mockFundId, search: 'Справа' });

      expect(findAllMock).toHaveBeenCalledWith({
        $and: [
          { $or: [{ 'caseName.uk': expect.any(RegExp) }, { 'caseName.en': expect.any(RegExp) }] },
          { fundId: mockFundId }
        ]
      });
    });

    it('should query with no conditions at all when no filters are provided', async () => {
      findAllMock.mockReturnValue(createMockQueryBuilder([]));

      await repository.findAll();

      expect(findAllMock).toHaveBeenCalledWith({});
    });
  });
});
