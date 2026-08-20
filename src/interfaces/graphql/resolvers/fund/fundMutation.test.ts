import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';

import { createMockContext } from '../testUtils';
import { FundMutation } from './fundMutation';
import { FundErrorCodes, FundErrors, graphqlErrors } from '~/constants/errors';
import { CreateFundInput, IFundRepository, UpdateFundInput } from '~/src/domain/repositories/fundRepository';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const createMockCreateFundInput = (overrides: Partial<CreateFundInput> = {}): CreateFundInput => ({
  fundNumber: 1,
  name: { uk: 'Архів', en: 'Archive' },
  documentCreationDate: { uk: '1917', en: '1917' },
  chronologicalBoundaries: { uk: '1917–1991', en: '1917–1991' },
  organizationForm: { uk: 'Державна установа', en: 'State Institution' },
  description: undefined,
  status: BaseContentStatuses.Draft,
  ...overrides
});

const createMockUpdateFundInput = (overrides: Partial<UpdateFundInput> = {}): UpdateFundInput => ({
  name: { uk: 'Оновлений Архів', en: 'Updated Archive' },
  ...overrides
});

const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockFindById = jest.fn();
const mockFindByFundNumber = jest.fn();
const mockFindAll = jest.fn();

const mockRepo: Partial<IFundRepository> = {
  create: mockCreate,
  update: mockUpdate,
  delete: mockDelete,
  findById: mockFindById,
  findByFundNumber: mockFindByFundNumber,
  findAll: mockFindAll
};

const adminContext = createMockContext(true, 'fundRepository', mockRepo);
const userContext = createMockContext(false, 'fundRepository', mockRepo);


const runValidationTests = (action: 'create' | 'update') => {
  const isCreate = action === 'create';
  it.each([
    ['non-positive fundNumber', { fundNumber: -5 }],
    ['float fundNumber', { fundNumber: 12.34 }],

    ['name missing uk', { name: { en: 'Archive' } as unknown as CreateFundInput['name'] }],
    ['name missing en', { name: { uk: 'Архів' } as unknown as CreateFundInput['name'] }],
    ['name uk is whitespace', { name: { uk: '   ', en: 'Archive' } }],
    ['name en is whitespace', { name: { uk: 'Архів', en: '   ' } }],
    ['name uk exceeding 40 characters', { name: { uk: 'a'.repeat(41), en: 'Archive' } }],
    ['name en exceeding 40 characters', { name: { uk: 'Архів', en: 'a'.repeat(41) } }],

    ['documentCreationDate uk is empty', { documentCreationDate: { uk: '', en: '1917' } }],
    ['documentCreationDate en is empty', { documentCreationDate: { uk: '1917', en: '' } }],
    ['documentCreationDate uk exceeding 150 characters', { documentCreationDate: { uk: 'a'.repeat(151), en: '1917' } }],
    ['documentCreationDate en exceeding 150 characters', { documentCreationDate: { uk: '1917', en: 'a'.repeat(151) } }],

    ['chronologicalBoundaries uk exceeding 150 characters', { chronologicalBoundaries: { uk: 'a'.repeat(151), en: '1917' } }],
    ['chronologicalBoundaries en exceeding 150 characters', { chronologicalBoundaries: { uk: '1917–1991', en: 'a'.repeat(151) } }],

    ['organizationForm uk exceeding 150 characters', { organizationForm: { uk: 'a'.repeat(151), en: 'State' } }],
    ['organizationForm en exceeding 150 characters', { organizationForm: { uk: 'Державна установа', en: 'a'.repeat(151) } }],

    ['description uk exceeding 1000 characters', { description: { uk: 'a'.repeat(1001), en: 'Valid' } }],
    ['description en exceeding 1000 characters', { description: { uk: 'Опис', en: 'a'.repeat(1001) } }],

    ['invalid status value', { status: 'INVALID_STATUS' as unknown as CreateFundInput['status'] }]
  ])('should reject %s', async (_label, overrides) => {
    if (isCreate) {
      const input = createMockCreateFundInput(overrides);
      await expect(FundMutation.createFund({}, { input }, adminContext)).rejects.toThrow(ZodError);

      expect(mockFindByFundNumber).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();
    } else {
      const input = createMockUpdateFundInput(overrides);
      await expect(FundMutation.updateFund({}, { id: 'id', input }, adminContext)).rejects.toThrow(ZodError);

      expect(mockUpdate).not.toHaveBeenCalled();
    }
  });
};

describe('FundMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createFund', () => {
    it('should throw GraphQLError if user is not an admin', async () => {
      const input = createMockCreateFundInput();
      await expect(FundMutation.createFund({}, { input }, userContext)).rejects.toEqual(
        new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
          extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
        })
      );

      expect(mockFindByFundNumber).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();
    });


    it('should throw custom error msg if fund with this fundNumber already exists', async () => {
      const input = createMockCreateFundInput();

      mockFindByFundNumber.mockResolvedValue(input);

      await expect(FundMutation.createFund({}, { input }, adminContext)).rejects.toEqual(
        new GraphQLError(FundErrors.NUMBER_ALREADY_EXISTS(input.fundNumber), {
          extensions: { code: FundErrorCodes.NUMBER_ALREADY_EXISTS }
        })
      );
    });

    it('should successfully call repo create method and return new fund instance', async () => {
      const input = createMockCreateFundInput();

      mockFindByFundNumber.mockResolvedValue(null);

      await FundMutation.createFund({}, { input }, adminContext);

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith(input);
    });

    it('should successfully provide a fallback status value if it is missing', async () => {
      const input = {
        fundNumber: 1,
        name: { uk: 'Архів', en: 'Archive' },
        documentCreationDate: { uk: '1917', en: '1917' },
        chronologicalBoundaries: { uk: '1917–1991', en: '1917–1991' },
        organizationForm: { uk: 'Державна установа', en: 'State Institution' },
        description: undefined,
      };

      mockFindByFundNumber.mockResolvedValue(null);

      await FundMutation.createFund({}, { input }, adminContext);

      expect(mockCreate).toHaveBeenCalledWith({
        ...input,
        status: BaseContentStatuses.Hidden
      });
    });
  });

  describe('updateFund', () => {
    it('should throw GraphQLError if user is not an admin', async () => {
      const update = createMockUpdateFundInput();
      await expect(FundMutation.updateFund({}, { id: 'some-id', input: update }, userContext)).rejects.toEqual(
        new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
          extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
        })
      );

      expect(mockUpdate).not.toHaveBeenCalled();
    });


    it('should throw custom error msg if fund with this fundNumber is not found', async () => {
      const update = createMockUpdateFundInput();

      mockUpdate.mockResolvedValue(null);

      await expect(FundMutation.updateFund({}, { id: 'non-existed-id', input: update }, adminContext)).rejects.toEqual(
        new GraphQLError(FundErrors.FUND_NOT_FOUND('non-existed-id'), {
          extensions: { code: FundErrorCodes.FUND_NOT_FOUND }
        })
      );
    });

    it('should throw custom error msg if updating to a fundNumber that already exists on a different fund', async () => {
      const update = createMockUpdateFundInput({ fundNumber: 2 });
      const existingFund = { id: 'different-id', fundNumber: 2 };

      mockFindByFundNumber.mockResolvedValue(existingFund);

      await expect(FundMutation.updateFund({}, { id: 'current-id', input: update }, adminContext)).rejects.toEqual(
        new GraphQLError(FundErrors.NUMBER_ALREADY_EXISTS(2), {
          extensions: { code: FundErrorCodes.NUMBER_ALREADY_EXISTS }
        })
      );

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should successfully partially update the fund & call repo update method & return updated fund', async () => {
      const update = createMockUpdateFundInput();
      const existedUpdated = createMockCreateFundInput({ name: update.name });
      const id = '121';

      mockUpdate.mockResolvedValue(existedUpdated);

      const result = await FundMutation.updateFund({}, { id, input: update }, adminContext);

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith(id, update);

      expect(result.name).toStrictEqual(update.name);

      expect(result.fundNumber).toBe(existedUpdated.fundNumber);
      expect(result.status).toBe(existedUpdated.status);
    });
  });

  describe('deleteFund', () => {
    it('should throw GraphQLError if user is not an admin', async () => {
      const deleteId = 'some-id';
      await expect(FundMutation.deleteFund({}, { id: deleteId }, userContext)).rejects.toThrow(GraphQLError);

      expect(mockDelete).not.toHaveBeenCalled();
    });
    it('should successfully call repo delete method and return false - unsuccessful delete', async () => {
      const deleteId = 'non-exitested-id';
      mockDelete.mockResolvedValue(false);

      const isDeleted = await FundMutation.deleteFund({}, { id: deleteId }, adminContext);
      expect(isDeleted).toBe(false);
    });

    it('should successfully call repo delete method and return true - successfull delete', async () => {
      const deleteId = 'some-id';
      mockDelete.mockResolvedValue(true);

      const isDeleted = await FundMutation.deleteFund({}, { id: deleteId }, adminContext);
      expect(isDeleted).toBe(true);
    });
  });

  describe('validation', () => {
    describe('createFund', () => {
      it('should reject missing fundNumber', async () => {
        const input = {
          name: { uk: 'Архів', en: 'Archive' },
          documentCreationDate: { uk: '1917', en: '1917' },
          chronologicalBoundaries: { uk: '1917–1991', en: '1917–1991' },
          organizationForm: { uk: 'Державна установа', en: 'State Institution' },
          description: undefined,
          status: BaseContentStatuses.Draft,
        } as CreateFundInput;
        
        await expect(FundMutation.createFund({}, { input }, adminContext)).rejects.toThrow(ZodError);
        
        
        expect(mockFindByFundNumber).not.toHaveBeenCalled();
        expect(mockCreate).not.toHaveBeenCalled();
      });
      
      runValidationTests('create');
    });

    describe('updateFund', () => {
      runValidationTests('update');
    });
  });
});