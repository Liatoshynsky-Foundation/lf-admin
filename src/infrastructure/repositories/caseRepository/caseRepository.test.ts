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

  const baseNewCaseInput: CreateCaseInput = {
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

  const mockAndFetchCase = async (overrides: any, cipher?: string, reqDesc = 1, reqCase = 1) => {
    const doc = { ...createMockCaseDoc(overrides), ...(cipher !== undefined && { cipher }) };
    findOneMock.mockResolvedValue({ toObject: () => doc });
    return await repository.findByFundAndNumbers(mockFundId, reqDesc, reqCase);
  };
  it('should create a case and return the mapped entity', async () => {
    findOneMock.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(null)
    });
    saveMock.mockResolvedValue({ toObject: () => createMockCaseDoc({ ...baseNewCaseInput }) });
    const result = await repository.create(baseNewCaseInput);

    expect(findOneMock).toHaveBeenCalledWith({ fundId: baseNewCaseInput.fundId });
    expect(saveMock).toHaveBeenCalled();

    expect(result.descriptionNumber).toEqual(baseNewCaseInput.descriptionNumber);
    expect(result.caseNumber).toEqual(baseNewCaseInput.caseNumber);
    expect(result.caseName).toStrictEqual(baseNewCaseInput.caseName);

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
    it.each([
      {
        desc: 'uses input.order when it is greater than 0, ignoring the last case order',
        inputOrder: 5,
        lastOrder: 99,
        expected: 5
      },
      { desc: 'falls back to lastCase.order + 1 when input.order is 0', inputOrder: 0, lastOrder: 7, expected: 8 },
      {
        desc: 'falls back to 1 when input.order is 0 and there is no last case for the fund',
        inputOrder: 0,
        lastOrder: null,
        expected: 1
      },
      {
        desc: 'falls back to lastCase.order + 1 when input.order is negative',
        inputOrder: -3,
        lastOrder: 4,
        expected: 5
      }
    ])('$desc', async ({ inputOrder, lastOrder, expected }) => {
      const newCase = { ...baseNewCaseInput, order: inputOrder };

      findOneMock.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(lastOrder !== null ? { order: lastOrder } : null)
      });
      saveMock.mockResolvedValue({ toObject: () => createMockCaseDoc({ order: expected }) });

      await repository.create(newCase);

      expect(MockCaseModel).toHaveBeenCalledWith(expect.objectContaining({ order: expected }));
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
    const docOverrides = {
      fundId: undefined as unknown as string,
      detailedCaseDescription: undefined,
      pdfFile: { filename: 'archive.pdf', url: 'https://cdn/archive.pdf', mimeType: 'application/pdf' }
    };
    const result = await mockAndFetchCase(docOverrides);

    expect(result?.fundId).toBeUndefined();
    expect(result?.detailedCaseDescription).toBeUndefined();
    expect(result?.pdfFile).toStrictEqual(docOverrides.pdfFile);
  });

  describe('toEntity defaults (status/order fallbacks)', () => {
    it('defaults status to Hidden when the document has no status', async () => {
      const result = await mockAndFetchCase({ status: undefined });
      expect(result?.status).toBe(BaseContentStatuses.Hidden);
    });

    it('keeps the document status when it is present', async () => {
      const result = await mockAndFetchCase({ status: BaseContentStatuses.Draft });
      expect(result?.status).toBe(BaseContentStatuses.Draft);
    });

    it('defaults order to 0 when the document has no order', async () => {

      const result = await mockAndFetchCase({ order: undefined });

      expect(result?.order).toBe(0);
    });

    it('keeps the document order when it is present (including 0)', async () => {

      const result = await mockAndFetchCase({ order: 0 });

      expect(result?.order).toBe(0);
    });

    it('defaults createdAt/updatedAt to the current time when missing', async () => {
      const before = Date.now();
      const result = await mockAndFetchCase({ createdAt: undefined, updatedAt: undefined });
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
    it.each([
      {
        desc: 'uses descriptionNumber/caseNumber from the document when both are present, ignoring any cipher',
        overrides: { descriptionNumber: 4, caseNumber: 9 },
        cipher: 'ф.1, оп. 2, спр. 3',
        expDesc: 4,
        expCase: 9
      },
      {
        desc: 'derives descriptionNumber and caseNumber from a legacy cipher when both are missing on the document',
        overrides: { descriptionNumber: undefined, caseNumber: undefined },
        cipher: 'ф. 12, оп. 34, спр. 56',
        expDesc: 34,
        expCase: 56
      },
      {
        desc: 'derives only descriptionNumber from cipher when caseNumber is present on the document',
        overrides: { descriptionNumber: undefined, caseNumber: 7 },
        cipher: 'оп. 21',
        expDesc: 21,
        expCase: 7
      },
      {
        desc: 'derives only caseNumber from cipher when descriptionNumber is present on the document',
        overrides: { descriptionNumber: 5, caseNumber: undefined },
        cipher: 'спр. 42',
        expDesc: 5,
        expCase: 42
      },
      {
        desc: 'falls back to 1 for both numbers when descriptionNumber/caseNumber are missing and there is no cipher at all',
        overrides: { descriptionNumber: undefined, caseNumber: undefined },
        cipher: undefined,
        expDesc: 1,
        expCase: 1
      },
      {
        desc: 'falls back to 1 for both numbers when the cipher does not match the expected pattern',
        overrides: { descriptionNumber: undefined, caseNumber: undefined },
        cipher: 'this cipher has no recognizable pattern',
        expDesc: 1,
        expCase: 1
      },
      {
        desc: 'matches the cipher pattern case-insensitively',
        overrides: { descriptionNumber: undefined, caseNumber: undefined },
        cipher: 'ОП. 11, СПР. 22',
        expDesc: 11,
        expCase: 22
      }
    ])('$desc', async ({ overrides, cipher, expDesc, expCase }) => {
      const result = await mockAndFetchCase(overrides, cipher, expDesc, expCase);

      expect(result?.descriptionNumber).toBe(expDesc);
      expect(result?.caseNumber).toBe(expCase);
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

    beforeEach(() => {
      findAllMock.mockReturnValue(createMockQueryBuilder([]));
    });

    it('should query without a fundId condition when the fundId filter is not provided', async () => {
      await repository.findAll({ search: 'Справа' });
      expect(findAllMock).toHaveBeenCalledWith({
        $or: [{ 'caseName.uk': expect.any(RegExp) }, { 'caseName.en': expect.any(RegExp) }]
      });
    });

    it('should add a fundId condition to the query when the fundId filter is provided', async () => {
      await repository.findAll({ fundId: mockFundId });

      expect(findAllMock).toHaveBeenCalledWith({ fundId: mockFundId });
    });

    it('should add a status condition to the query when the statuses filter is provided', async () => {
      await repository.findAll({ statuses: [BaseContentStatuses.Published] });

      expect(findAllMock).toHaveBeenCalledWith({ status: { $in: [BaseContentStatuses.Published] } });
    });

    it('should combine the fundId condition with other filters using $and', async () => {
      await repository.findAll({ fundId: mockFundId, search: 'Справа' });

      expect(findAllMock).toHaveBeenCalledWith({
        $and: [
          { $or: [{ 'caseName.uk': expect.any(RegExp) }, { 'caseName.en': expect.any(RegExp) }] },
          { fundId: mockFundId }
        ]
      });
    });

    it('should query with no conditions at all when no filters are provided', async () => {

      await repository.findAll();

      expect(findAllMock).toHaveBeenCalledWith({});
    });
  });
});
