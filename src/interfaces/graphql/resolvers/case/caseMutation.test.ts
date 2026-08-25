import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';

import { createMockContext } from '../testUtils';
import { CaseMutation } from './caseMutation';
import { CaseErrorCodes, CaseErrors, graphqlErrors } from '~/constants/errors';
import { CreateCaseInput, ICaseRepository, UpdateCaseInput } from '~/src/domain/repositories/caseRepository';
import { IFundRepository } from '~/src/domain/repositories/fundRepository';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const mockFundId = '65eddf5e2f1a2b3c4d5e6f7b';

const createMockCreateCaseInput = (overrides: Partial<CreateCaseInput> = {}): CreateCaseInput => ({
  fundId: mockFundId,
  descriptionNumber: 1,
  caseNumber: 1,
  caseName: { uk: 'Справа', en: 'Case' },
  caseDate: { uk: '1917-1918', en: '1917-1918' },
  sheetsNumber: 10,
  caseDescriptions: { uk: 'Опис', en: 'Description' },
  detailedCaseDescription: undefined,
  pdfFile: undefined,
  status: BaseContentStatuses.Hidden,
  ...overrides
});

const createMockUpdateCaseInput = (overrides: Partial<UpdateCaseInput> = {}): UpdateCaseInput => ({
  caseName: { uk: 'Оновлена справа', en: 'Updated case' },
  ...overrides
});

const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockFindById = jest.fn();
const mockFindByFundAndNumbers = jest.fn();
const mockCount = jest.fn();
const mockCountDistinctDescriptionNumbers = jest.fn();

const mockCaseRepo: Partial<ICaseRepository> = {
  create: mockCreate,
  update: mockUpdate,
  delete: mockDelete,
  findById: mockFindById,
  findByFundAndNumbers: mockFindByFundAndNumbers,
  count: mockCount,
  countDistinctDescriptionNumbers: mockCountDistinctDescriptionNumbers
};

const mockFundFindById = jest.fn();
const mockFundUpdate = jest.fn();

const mockFundRepo: Partial<IFundRepository> = {
  findById: mockFundFindById,
  update: mockFundUpdate
};

const createContext = (isAdmin: boolean) => ({
  admin: isAdmin,
  requestContainer: {
    cradle: {
      caseRepository: mockCaseRepo,
      fundRepository: mockFundRepo
    }
  }
} as unknown as ReturnType<typeof createMockContext>);

const adminContext = createContext(true);
const userContext = createContext(false);

describe('CaseMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFundFindById.mockResolvedValue({ id: mockFundId });
    mockCount.mockResolvedValue(0);
    mockCountDistinctDescriptionNumbers.mockResolvedValue(0);
    mockFundUpdate.mockResolvedValue({ id: mockFundId });
  });

  describe('createCase', () => {
    it('should throw GraphQLError if user is not an admin', async () => {
      const input = createMockCreateCaseInput();
      await expect(CaseMutation.createCase({}, { input }, userContext)).rejects.toEqual(
        new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
          extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
        })
      );

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should throw ZodError for invalid input', async () => {
      const input = createMockCreateCaseInput({ descriptionNumber: -1 });

      await expect(CaseMutation.createCase({}, { input }, adminContext)).rejects.toThrow(ZodError);
      expect(mockFundFindById).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should throw custom error if fundId does not reference an existing Fund', async () => {
      const input = createMockCreateCaseInput();
      mockFundFindById.mockResolvedValue(null);

      await expect(CaseMutation.createCase({}, { input }, adminContext)).rejects.toEqual(
        new GraphQLError(CaseErrors.FUND_NOT_FOUND(mockFundId), {
          extensions: { code: CaseErrorCodes.FUND_NOT_FOUND }
        })
      );

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should throw custom error if descriptionNumber+caseNumber combination already exists within the Fund', async () => {
      const input = createMockCreateCaseInput();
      mockFindByFundAndNumbers.mockResolvedValue({ id: 'existing-case' });

      await expect(CaseMutation.createCase({}, { input }, adminContext)).rejects.toEqual(
        new GraphQLError(CaseErrors.DUPLICATE_NUMBERS(), {
          extensions: { code: CaseErrorCodes.DUPLICATE_NUMBERS }
        })
      );

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should reject a pdfFile that is not a PDF', async () => {
      const input = createMockCreateCaseInput({
        pdfFile: { filename: 'scan.png', url: 'https://cdn/scan.png', mimeType: 'image/png' }
      });

      await expect(CaseMutation.createCase({}, { input }, adminContext)).rejects.toThrow(ZodError);
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should successfully call repo create method and return the new case', async () => {
      const input = createMockCreateCaseInput();
      mockFindByFundAndNumbers.mockResolvedValue(null);

      await CaseMutation.createCase({}, { input }, adminContext);

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith(input);
    });

    it('should recalculate and persist the parent Fund stats after a successful create', async () => {
      const input = createMockCreateCaseInput();
      mockFindByFundAndNumbers.mockResolvedValue(null);
      mockCount.mockResolvedValue(3);
      mockCountDistinctDescriptionNumbers.mockResolvedValue(2);

      await CaseMutation.createCase({}, { input }, adminContext);

      expect(mockCount).toHaveBeenCalledWith({ fundId: mockFundId });
      expect(mockCountDistinctDescriptionNumbers).toHaveBeenCalledWith(mockFundId);
      expect(mockFundUpdate).toHaveBeenCalledWith(mockFundId, {
        casesCount: 3,
        descriptionsCount: 2
      });
    });

    it('should provide a fallback hidden status when missing', async () => {
      const { status: _status, ...inputWithoutStatus } = createMockCreateCaseInput();
      mockFindByFundAndNumbers.mockResolvedValue(null);

      await CaseMutation.createCase({}, { input: inputWithoutStatus }, adminContext);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ status: BaseContentStatuses.Hidden })
      );
    });

    it('should convert a MongoDB duplicate key error (race condition) from repo.create into the friendly duplicate error', async () => {
      const input = createMockCreateCaseInput();
      mockFindByFundAndNumbers.mockResolvedValue(null);
      mockCreate.mockRejectedValue(Object.assign(new Error('E11000 duplicate key error'), { code: 11000 }));

      await expect(CaseMutation.createCase({}, { input }, adminContext)).rejects.toEqual(
        new GraphQLError(CaseErrors.DUPLICATE_NUMBERS(), {
          extensions: { code: CaseErrorCodes.DUPLICATE_NUMBERS }
        })
      );
    });

    it('should rethrow unrelated errors from repo.create as-is', async () => {
      const input = createMockCreateCaseInput();
      mockFindByFundAndNumbers.mockResolvedValue(null);
      const unrelatedError = new Error('Database connection lost');
      mockCreate.mockRejectedValue(unrelatedError);

      await expect(CaseMutation.createCase({}, { input }, adminContext)).rejects.toThrow(unrelatedError);
    });

    it('should rethrow a non-object rejection from repo.create as-is', async () => {
      const input = createMockCreateCaseInput();
      mockFindByFundAndNumbers.mockResolvedValue(null);
      mockCreate.mockRejectedValue('unexpected string rejection');

      await expect(CaseMutation.createCase({}, { input }, adminContext)).rejects.toBe('unexpected string rejection');
    });
  });

  describe('updateCase', () => {
    const id = 'case-id';

    it('should throw GraphQLError if user is not an admin', async () => {
      const input = createMockUpdateCaseInput();
      await expect(CaseMutation.updateCase({}, { id, input }, userContext)).rejects.toEqual(
        new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
          extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
        })
      );

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should throw custom error if the case does not exist', async () => {
      mockFindById.mockResolvedValue(null);
      const input = createMockUpdateCaseInput();

      await expect(CaseMutation.updateCase({}, { id, input }, adminContext)).rejects.toEqual(
        new GraphQLError(CaseErrors.CASE_NOT_FOUND(id), {
          extensions: { code: CaseErrorCodes.CASE_NOT_FOUND }
        })
      );

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should throw custom error if new fundId does not reference an existing Fund', async () => {
      mockFindById.mockResolvedValue({ id, fundId: mockFundId, descriptionNumber: 1, caseNumber: 1 });
      mockFundFindById.mockResolvedValue(null);
      const input = createMockUpdateCaseInput({ fundId: 'other-fund-id' });

      await expect(CaseMutation.updateCase({}, { id, input }, adminContext)).rejects.toEqual(
        new GraphQLError(CaseErrors.FUND_NOT_FOUND('other-fund-id'), {
          extensions: { code: CaseErrorCodes.FUND_NOT_FOUND }
        })
      );

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should throw custom error when the updated descriptionNumber+caseNumber duplicates another case in the same Fund', async () => {
      mockFindById.mockResolvedValue({ id, fundId: mockFundId, descriptionNumber: 1, caseNumber: 1 });
      mockFindByFundAndNumbers.mockResolvedValue({ id: 'another-case-id' });
      const input = createMockUpdateCaseInput({ caseNumber: 2 });

      await expect(CaseMutation.updateCase({}, { id, input }, adminContext)).rejects.toEqual(
        new GraphQLError(CaseErrors.DUPLICATE_NUMBERS(), {
          extensions: { code: CaseErrorCodes.DUPLICATE_NUMBERS }
        })
      );

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should NOT treat the case itself as a duplicate when numbers are unchanged', async () => {
      mockFindById.mockResolvedValue({ id, fundId: mockFundId, descriptionNumber: 1, caseNumber: 1 });
      mockFindByFundAndNumbers.mockResolvedValue({ id });
      mockUpdate.mockResolvedValue({ id, fundId: mockFundId, descriptionNumber: 1, caseNumber: 1 });
      const input = createMockUpdateCaseInput({ caseNumber: 1 });

      await expect(CaseMutation.updateCase({}, { id, input }, adminContext)).resolves.toBeDefined();
      expect(mockUpdate).toHaveBeenCalledTimes(1);
    });

    it('should not re-check numbers when neither fundId, descriptionNumber, nor caseNumber change', async () => {
      mockFindById.mockResolvedValue({ id, fundId: mockFundId, descriptionNumber: 1, caseNumber: 1 });
      mockUpdate.mockResolvedValue({ id, fundId: mockFundId, descriptionNumber: 1, caseNumber: 1 });
      const input = createMockUpdateCaseInput();

      await CaseMutation.updateCase({}, { id, input }, adminContext);

      expect(mockFindByFundAndNumbers).not.toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalledWith(id, input);
    });

    it('should successfully call repo update method and return the updated case', async () => {
      mockFindById.mockResolvedValue({ id, fundId: mockFundId, descriptionNumber: 1, caseNumber: 1 });
      const updatedCase = { id, caseName: { uk: 'Оновлена справа', en: 'Updated case' } };
      mockUpdate.mockResolvedValue(updatedCase);
      const input = createMockUpdateCaseInput();

      const result = await CaseMutation.updateCase({}, { id, input }, adminContext);

      expect(mockUpdate).toHaveBeenCalledWith(id, input);
      expect(result).toStrictEqual(updatedCase);
    });

    it('should throw custom error if the case is deleted concurrently and the update finds no document', async () => {
      mockFindById.mockResolvedValue({ id, fundId: mockFundId, descriptionNumber: 1, caseNumber: 1 });
      mockUpdate.mockResolvedValue(null);
      const input = createMockUpdateCaseInput();

      await expect(CaseMutation.updateCase({}, { id, input }, adminContext)).rejects.toEqual(
        new GraphQLError(CaseErrors.CASE_NOT_FOUND(id), {
          extensions: { code: CaseErrorCodes.CASE_NOT_FOUND }
        })
      );
    });

    it('should convert a MongoDB duplicate key error (race condition) from repo.update into the friendly duplicate error', async () => {
      mockFindById.mockResolvedValue({ id, fundId: mockFundId, descriptionNumber: 1, caseNumber: 1 });
      mockUpdate.mockRejectedValue(Object.assign(new Error('E11000 duplicate key error'), { code: 11000 }));
      const input = createMockUpdateCaseInput();

      await expect(CaseMutation.updateCase({}, { id, input }, adminContext)).rejects.toEqual(
        new GraphQLError(CaseErrors.DUPLICATE_NUMBERS(), {
          extensions: { code: CaseErrorCodes.DUPLICATE_NUMBERS }
        })
      );
    });

    it('should rethrow unrelated errors from repo.update as-is', async () => {
      mockFindById.mockResolvedValue({ id, fundId: mockFundId, descriptionNumber: 1, caseNumber: 1 });
      const unrelatedError = new Error('Database connection lost');
      mockUpdate.mockRejectedValue(unrelatedError);
      const input = createMockUpdateCaseInput();

      await expect(CaseMutation.updateCase({}, { id, input }, adminContext)).rejects.toThrow(unrelatedError);
    });

    describe('Fund stats recalculation', () => {
      const otherFundId = 'other-fund-id';

      it('should recalculate stats for both the old and new Fund when the case is reassigned', async () => {
        mockFindById.mockResolvedValue({ id, fundId: mockFundId, descriptionNumber: 1, caseNumber: 1 });
        mockFindByFundAndNumbers.mockResolvedValue(null);
        mockUpdate.mockResolvedValue({ id, fundId: otherFundId, descriptionNumber: 1, caseNumber: 1 });
        const input = createMockUpdateCaseInput({ fundId: otherFundId });

        await CaseMutation.updateCase({}, { id, input }, adminContext);

        expect(mockFundUpdate).toHaveBeenCalledWith(mockFundId, expect.any(Object));
        expect(mockFundUpdate).toHaveBeenCalledWith(otherFundId, expect.any(Object));
        expect(mockFundUpdate).toHaveBeenCalledTimes(2);
      });

      it('should recalculate stats once for the same Fund when only descriptionNumber changes', async () => {
        mockFindById.mockResolvedValue({ id, fundId: mockFundId, descriptionNumber: 1, caseNumber: 1 });
        mockFindByFundAndNumbers.mockResolvedValue(null);
        mockUpdate.mockResolvedValue({ id, fundId: mockFundId, descriptionNumber: 2, caseNumber: 1 });
        const input = createMockUpdateCaseInput({ descriptionNumber: 2 });

        await CaseMutation.updateCase({}, { id, input }, adminContext);

        expect(mockFundUpdate).toHaveBeenCalledTimes(1);
        expect(mockFundUpdate).toHaveBeenCalledWith(mockFundId, expect.any(Object));
      });

      it('should NOT recalculate stats when neither fundId nor descriptionNumber changed', async () => {
        mockFindById.mockResolvedValue({ id, fundId: mockFundId, descriptionNumber: 1, caseNumber: 1 });
        mockUpdate.mockResolvedValue({ id, fundId: mockFundId, descriptionNumber: 1, caseNumber: 1 });
        const input = createMockUpdateCaseInput();

        await CaseMutation.updateCase({}, { id, input }, adminContext);

        expect(mockFundUpdate).not.toHaveBeenCalled();
      });
    });
  });

  describe('validation', () => {
    beforeEach(() => {
      mockFindByFundAndNumbers.mockResolvedValue(null);
    });

    it.each([
      ['missing fundId', { fundId: '' }],

      ['non-positive descriptionNumber', { descriptionNumber: -1 }],
      ['float descriptionNumber', { descriptionNumber: 1.5 }],
      ['missing descriptionNumber', { descriptionNumber: undefined as unknown as number }],

      ['non-positive caseNumber', { caseNumber: -1 }],
      ['float caseNumber', { caseNumber: 1.5 }],
      ['missing caseNumber', { caseNumber: undefined as unknown as number }],

      ['caseName uk empty', { caseName: { uk: '', en: 'Case' } }],
      ['caseName en empty', { caseName: { uk: 'Справа', en: '' } }],
      ['caseName uk exceeding 150 characters', { caseName: { uk: 'a'.repeat(151), en: 'Case' } }],

      ['caseDate uk empty', { caseDate: { uk: '', en: '1917' } }],
      ['caseDate uk exceeding 150 characters', { caseDate: { uk: 'a'.repeat(151), en: '1917' } }],

      ['non-positive sheetsNumber', { sheetsNumber: -1 }],
      ['float sheetsNumber', { sheetsNumber: 1.5 }],

      ['caseDescriptions uk empty', { caseDescriptions: { uk: '', en: 'Description' } }],
      ['caseDescriptions uk exceeding 300 characters', { caseDescriptions: { uk: 'a'.repeat(301), en: 'Description' } }],

      ['detailedCaseDescription uk exceeding 1000 characters', { detailedCaseDescription: { uk: 'a'.repeat(1001), en: 'Valid' } }],

      ['pdfFile with a non-pdf extension', { pdfFile: { filename: 'scan.jpg', url: 'https://cdn/scan.jpg', mimeType: 'application/pdf' } }],
      ['pdfFile with a non-pdf mimetype', { pdfFile: { filename: 'scan.pdf', url: 'https://cdn/scan.pdf', mimeType: 'image/jpeg' } }],

      ['invalid status value', { status: 'INVALID_STATUS' as unknown as CreateCaseInput['status'] }]
    ])('should reject %s on create', async (_label, overrides) => {
      const input = createMockCreateCaseInput(overrides);

      await expect(CaseMutation.createCase({}, { input }, adminContext)).rejects.toThrow(ZodError);
      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe('deleteCase', () => {
    it('should throw GraphQLError if user is not an admin', async () => {
      await expect(CaseMutation.deleteCase({}, { id: 'some-id' }, userContext)).rejects.toThrow(GraphQLError);
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('should return false when the case could not be deleted', async () => {
      mockFindById.mockResolvedValue({ id: 'non-existent', fundId: mockFundId });
      mockDelete.mockResolvedValue(false);
      const result = await CaseMutation.deleteCase({}, { id: 'non-existent' }, adminContext);
      expect(result).toBe(false);
      expect(mockFundUpdate).not.toHaveBeenCalled();
    });

    it('should return true on successful delete and recalculate the parent Fund stats', async () => {
      mockFindById.mockResolvedValue({ id: 'some-id', fundId: mockFundId });
      mockDelete.mockResolvedValue(true);
      mockCount.mockResolvedValue(1);
      mockCountDistinctDescriptionNumbers.mockResolvedValue(1);

      const result = await CaseMutation.deleteCase({}, { id: 'some-id' }, adminContext);

      expect(result).toBe(true);
      expect(mockFundUpdate).toHaveBeenCalledWith(mockFundId, {
        casesCount: 1,
        descriptionsCount: 1
      });
    });

    it('should NOT recalculate Fund stats when the case to delete cannot be found', async () => {
      mockFindById.mockResolvedValue(null);
      mockDelete.mockResolvedValue(false);

      const result = await CaseMutation.deleteCase({}, { id: 'non-existent' }, adminContext);

      expect(result).toBe(false);
      expect(mockFundUpdate).not.toHaveBeenCalled();
    });
  });
});
