import { Model } from 'mongoose';

import { CaseRepository, DbCase } from './caseRepository';
import { Case } from '~/src/domain/entities/Case';
import { CreateCaseInput } from '~/src/domain/repositories/caseRepository';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const mockId = '65eddf5e2f1a2b3c4d5e6f7a';
const mockFondId = '65eddf5e2f1a2b3c4d5e6f7b';

const createMockCaseDoc = (overrides: Partial<DbCase> = {}): DbCase => ({
  _id: { toString: () => mockId },
  fondId: mockFondId,
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
      fondId: mockFondId,
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

  it('should NOT create a case if the fondId+descriptionNumber+caseNumber combination already exists', async () => {
    const duplicateCase = createMockCaseDoc();
    saveMock.mockRejectedValue(new Error('E11000 duplicate key error'));

    await expect(repository.create(duplicateCase)).rejects.toThrow();
  });

  it('should find a case by fondId, descriptionNumber and caseNumber and return the mapped entity', async () => {
    const existedCase = createMockCaseDoc();
    findOneMock.mockResolvedValue({ toObject: () => existedCase });

    const result = await repository.findByFondAndNumbers(
      existedCase.fondId,
      existedCase.descriptionNumber,
      existedCase.caseNumber
    );

    expect(findOneMock).toHaveBeenCalledWith({
      fondId: existedCase.fondId,
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

  it('should return null if no case found by fondId, descriptionNumber and caseNumber', async () => {
    findOneMock.mockResolvedValue(null);
    const result = await repository.findByFondAndNumbers(mockFondId, 999, 999);

    expect(result).toBeNull();
  });

  it('should map fondId, detailedCaseDescription and pdfFile fallbacks correctly', async () => {
    const doc = createMockCaseDoc({
      fondId: undefined as unknown as string,
      detailedCaseDescription: undefined,
      pdfFile: { filename: 'archive.pdf', url: 'https://cdn/archive.pdf', mimeType: 'application/pdf' }
    });
    findOneMock.mockResolvedValue({ toObject: () => doc });

    const result = await repository.findByFondAndNumbers(mockFondId, 1, 1);

    expect(result?.fondId).toBeUndefined();
    expect(result?.detailedCaseDescription).toBeUndefined();
    expect(result?.pdfFile).toStrictEqual(doc.pdfFile);
  });

  describe('countDistinctDescriptionNumbers', () => {
    it('should return the number of distinct descriptionNumber values for a fond', async () => {
      distinctMock.mockResolvedValue([1, 2, 3]);

      const result = await repository.countDistinctDescriptionNumbers(mockFondId);

      expect(distinctMock).toHaveBeenCalledWith('descriptionNumber', { fondId: mockFondId });
      expect(result).toBe(3);
    });

    it('should return 0 when the fond has no cases', async () => {
      distinctMock.mockResolvedValue([]);

      const result = await repository.countDistinctDescriptionNumbers(mockFondId);

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

    it('should query without a fondId condition when the fondId filter is not provided', async () => {
      findAllMock.mockReturnValue(createMockQueryBuilder([]));

      await repository.findAll({ search: 'Справа' });

      expect(findAllMock).toHaveBeenCalledWith({
        $or: [{ 'caseName.uk': expect.any(RegExp) }, { 'caseName.en': expect.any(RegExp) }]
      });
    });

    it('should add a fondId condition to the query when the fondId filter is provided', async () => {
      findAllMock.mockReturnValue(createMockQueryBuilder([]));

      await repository.findAll({ fondId: mockFondId });

      expect(findAllMock).toHaveBeenCalledWith({ fondId: mockFondId });
    });

    it('should combine the fondId condition with other filters using $and', async () => {
      findAllMock.mockReturnValue(createMockQueryBuilder([]));

      await repository.findAll({ fondId: mockFondId, search: 'Справа' });

      expect(findAllMock).toHaveBeenCalledWith({
        $and: [
          { $or: [{ 'caseName.uk': expect.any(RegExp) }, { 'caseName.en': expect.any(RegExp) }] },
          { fondId: mockFondId }
        ]
      });
    });
  });
});
