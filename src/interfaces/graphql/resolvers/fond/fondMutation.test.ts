import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';

import { createMockContext } from '../testUtils';
import { FondMutation } from './fondMutation';
import { FondErrorCodes,FondErrors, graphqlErrors } from '~/constants/errors';
import { CreateFondInput, IFondRepository, UpdateFondInput } from '~/src/domain/repositories/fondRepository';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const createMockCreateFondInput = (overrides: Partial<CreateFondInput> = {}): CreateFondInput => ({
  fondNumber: 1,
  name: { uk: 'Архів', en: 'Archive' },
  documentCreationDate: { uk: '1917', en: '1917' },
  chronologicalBoundaries: { uk: '1917–1991', en: '1917–1991' },
  organizationForm: { uk: 'Державна установа', en: 'State Institution' },
  description: undefined,
  status: BaseContentStatuses.Draft,
  ...overrides
});

const createMockUpdateFondInput = (overrides: Partial<UpdateFondInput> = {}): UpdateFondInput => ({
  name: { uk: 'Оновлений Архів', en: 'Updated Archive' },
  ...overrides
});

const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockFindById = jest.fn();
const mockFindByFondNumber = jest.fn();
const mockFindAll = jest.fn();

const mockRepo: Partial<IFondRepository> = {
  create: mockCreate,
  update: mockUpdate,
  delete: mockDelete,
  findById: mockFindById,
  findByFondNumber: mockFindByFondNumber,
  findAll: mockFindAll
};
describe('FondMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const adminContext = createMockContext(true, 'fondRepository', mockRepo);
  const userContext = createMockContext(false, 'fondRepository', mockRepo);

  describe('createFond', () => {
    it('should throw GraphQLError if user is not an admin', async () => {
      const input = createMockCreateFondInput();
      await expect(FondMutation.createFond({}, { input }, userContext)).rejects.toEqual(
        new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
          extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
        })
      );

      expect(mockFindByFondNumber).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should throw ZodError if input fails validation', async () => {
      const invalidInput = createMockCreateFondInput({ fondNumber: -1 });

      await expect(FondMutation.createFond({}, { input: invalidInput }, adminContext)).rejects.toThrow(ZodError);

      expect(mockFindByFondNumber).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should throw custom error msg if fond with this fondNumber already exists', async () => {
      const input = createMockCreateFondInput();

      mockFindByFondNumber.mockResolvedValue(input);

      await expect(FondMutation.createFond({}, { input }, adminContext)).rejects.toEqual(
        new GraphQLError(FondErrors.NUMBER_ALREADY_EXISTS(input.fondNumber), {
          extensions: { code: FondErrorCodes.NUMBER_ALREADY_EXISTS }
        })
      );
    });

    it('should successfully call repo create method and return new fond instance', async () => {
      const input = createMockCreateFondInput();

      mockFindByFondNumber.mockResolvedValue(null);

      await FondMutation.createFond({}, { input }, adminContext);

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith(input);
    });

    it('should successfully provide a fallback status value if it is missing', async () => {
      const input = {
        fondNumber: 1,
        name: { uk: 'Архів', en: 'Archive' },
        documentCreationDate: { uk: '1917', en: '1917' },
        chronologicalBoundaries: { uk: '1917–1991', en: '1917–1991' },
        organizationForm: { uk: 'Державна установа', en: 'State Institution' },
        description: undefined,
      };

      mockFindByFondNumber.mockResolvedValue(null);

      await FondMutation.createFond({}, { input }, adminContext);

      expect(mockCreate).toHaveBeenCalledWith({
        ...input,
        status: BaseContentStatuses.Hidden
      });
    });
  });

  describe('updateFond', () => {
    it('should throw GraphQLError if user is not an admin', async () => {
      const update = createMockUpdateFondInput();
      await expect(FondMutation.updateFond({}, { id: 'some-id', input: update }, userContext)).rejects.toEqual(
        new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
          extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
        })
      );

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should throw ZodError if input fails validation', async () => {
      const invalidUpdateInput = createMockUpdateFondInput({ fondNumber: -1 });

      await expect(FondMutation.updateFond({}, { id: 'some-id', input: invalidUpdateInput }, adminContext)).rejects.toThrow(ZodError);

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should throw custom error msg if fond with this fondNumber is not found', async () => {
      const update = createMockUpdateFondInput();

      mockUpdate.mockResolvedValue(null);

      await expect(FondMutation.updateFond({}, { id: 'non-existed-id', input: update }, adminContext)).rejects.toEqual(
        new GraphQLError(FondErrors.FOND_NOT_FOUND('non-existed-id'), {
          extensions: { code: FondErrorCodes.FOND_NOT_FOUND }
        })
      );
    });

    it('should successfully partially update the fond & call repo update method & return updated fond', async () => {
      const update = createMockUpdateFondInput();
      const existedUpdated = createMockCreateFondInput({ name: update.name });
      const id = '121';

      mockUpdate.mockResolvedValue(existedUpdated);

      const result = await FondMutation.updateFond({}, { id, input: update }, adminContext);

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith(id, update);

      expect(result.name).toStrictEqual(update.name);

      expect(result.fondNumber).toBe(existedUpdated.fondNumber);
      expect(result.status).toBe(existedUpdated.status);
    });
  });

  describe('deleteFond', () => {
    it('should throw GraphQLError if user is not an admin', async () => {
      const deleteId = 'some-id';
      await expect(FondMutation.deleteFond({}, { id: deleteId }, userContext)).rejects.toThrow(GraphQLError);

      expect(mockDelete).not.toHaveBeenCalled();
    });
    it('should successfully call repo delete method and return false - unsuccessfull delete', async () => {
      const deleteId = 'non-exitested-id';
      mockDelete.mockResolvedValue(false);

      const isDeleted = await FondMutation.deleteFond({}, { id: deleteId }, adminContext);
      expect(isDeleted).toBe(false);
    });

    it('should successfully call repo delete method and return true - successfull delete', async () => {
      const deleteId = 'some-id';
      mockDelete.mockResolvedValue(true);

      const isDeleted = await FondMutation.deleteFond({}, { id: deleteId }, adminContext);
      expect(isDeleted).toBe(true);
    });
  });
});