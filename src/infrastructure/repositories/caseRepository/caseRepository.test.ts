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
  caseName: { uk: 'Справа', en: 'Case' },
  caseDate: { uk: '1917-1918', en: '1917-1918' },
  sheetsNumber: 10,
  caseDescriptions: { uk: 'Опис', en: 'Description' },
  detailedCaseDescription: { uk: 'Детальний опис', en: 'Detailed description' },
  pdfFile: null,
  status: BaseContentStatuses.Hidden,
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
      status: BaseContentStatuses.Hidden
    };

    saveMock.mockResolvedValue({ toObject: () => createMockCaseDoc({ ...newCase }) });
    const result = await repository.create(newCase);

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
    saveMock.mockRejectedValue(new Error('E11000 duplicate key error'));

    await expect(repository.create(duplicateCase)).rejects.toThrow();
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

    const expectedSearchCondition = {
      $or: [
        { 'caseName.uk': expect.any(RegExp) },
        { 'caseName.en': expect.any(RegExp) },
        { 'caseDescriptions.uk': expect.any(RegExp) },
        { 'caseDescriptions.en': expect.any(RegExp) },
        { 'detailedCaseDescription.uk': expect.any(RegExp) },
        { 'detailedCaseDescription.en': expect.any(RegExp) }
      ]
    };

    it('should query without a fundId condition when the fundId filter is not provided', async () => {
      findAllMock.mockReturnValue(createMockQueryBuilder([]));

      await repository.findAll({ search: 'Справа' });

      expect(findAllMock).toHaveBeenCalledWith(expectedSearchCondition);
    });

    it('should search with a case-insensitive regex', async () => {
      findAllMock.mockReturnValue(createMockQueryBuilder([]));

      await repository.findAll({ search: 'справа' });

      const query = findAllMock.mock.calls[0][0] as { $or: Record<string, RegExp>[] };
      query.$or.forEach((condition) => {
        expect(Object.values(condition)[0].flags).toContain('i');
      });
    });

    it('should add a fundId condition to the query when the fundId filter is provided', async () => {
      findAllMock.mockReturnValue(createMockQueryBuilder([]));

      await repository.findAll({ fundId: mockFundId });

      expect(findAllMock).toHaveBeenCalledWith({ fundId: mockFundId });
    });

    it('should add a status condition to the query when the statuses filter is provided', async () => {
      findAllMock.mockReturnValue(createMockQueryBuilder([]));

      await repository.findAll({ statuses: [BaseContentStatuses.Published] });

      expect(findAllMock).toHaveBeenCalledWith({ status: { $in: [BaseContentStatuses.Published] } });
    });

    it('should combine the fundId condition with other filters using $and', async () => {
      findAllMock.mockReturnValue(createMockQueryBuilder([]));

      await repository.findAll({ fundId: mockFundId, search: 'Справа' });

      expect(findAllMock).toHaveBeenCalledWith({
        $and: [expectedSearchCondition, { fundId: mockFundId }]
      });
    });

    it('should apply both the status and the search conditions when they are combined', async () => {
      findAllMock.mockReturnValue(createMockQueryBuilder([]));

      await repository.findAll({ search: 'Справа', statuses: [BaseContentStatuses.Published] });

      expect(findAllMock).toHaveBeenCalledWith({
        $and: [{ status: { $in: [BaseContentStatuses.Published] } }, expectedSearchCondition]
      });
    });
  });
});
