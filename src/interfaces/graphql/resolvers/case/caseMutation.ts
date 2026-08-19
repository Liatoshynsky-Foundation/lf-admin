import { GraphQLError } from 'graphql';

import { recalculateFundStats } from './recalculateFundStats';
import { CaseErrorCodes, CaseErrors, graphqlErrors } from '~/constants/errors';
import { Case } from '~/src/domain/entities/Case';
import { CreateCaseInput, UpdateCaseInput } from '~/src/domain/repositories/caseRepository';
import { GraphQLContext } from '~/src/shared/types/container/types';
import { zCaseSchema, zCaseUpdateSchema } from '~/src/validators/case.schema';

export type CreateCaseGQLInput = Omit<CreateCaseInput, 'status'> & { status?: Case['status'] };
export type UpdateCaseGQLInput = UpdateCaseInput;

type CreateCaseArgs = { input: CreateCaseGQLInput };
type UpdateCaseArgs = { id: string; input: UpdateCaseGQLInput };
type DeleteCaseArgs = { id: string };

const assertAuthenticated = (context: GraphQLContext) => {
  if (!context.admin) {
    throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
      extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
    });
  }
};

const fundNotFoundError = (fundId: string): GraphQLError =>
  new GraphQLError(CaseErrors.FUND_NOT_FOUND(fundId), {
    extensions: { code: CaseErrorCodes.FUND_NOT_FOUND }
  });

const duplicateNumbersError = (): GraphQLError =>
  new GraphQLError(CaseErrors.DUPLICATE_NUMBERS(), {
    extensions: { code: CaseErrorCodes.DUPLICATE_NUMBERS }
  });

const caseNotFoundError = (id: string): GraphQLError =>
  new GraphQLError(CaseErrors.CASE_NOT_FOUND(id), {
    extensions: { code: CaseErrorCodes.CASE_NOT_FOUND }
  });

const MONGO_DUPLICATE_KEY_ERROR_CODE = 11000;

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code: unknown }).code === MONGO_DUPLICATE_KEY_ERROR_CODE;

export const CaseMutation = {
  createCase: async (_: unknown, { input }: CreateCaseArgs, context: GraphQLContext): Promise<Case> => {
    assertAuthenticated(context);

    const { caseRepository: repo, fundRepository } = context.requestContainer.cradle;
    const validatedInput = zCaseSchema.parse(input);

    const { fundId, descriptionNumber, caseNumber } = validatedInput;

    const fund = await fundRepository.findById(fundId);
    if (!fund) {
      throw fundNotFoundError(fundId);
    }

    const existing = await repo.findByFundAndNumbers(fundId, descriptionNumber, caseNumber);
    if (existing) {
      throw duplicateNumbersError();
    }

    try {
      const createdCase = await repo.create(validatedInput);
      await recalculateFundStats(fundId, { caseRepository: repo, fundRepository });
      return createdCase;
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw duplicateNumbersError();
      }
      throw error;
    }
  },

  updateCase: async (_: unknown, { id, input }: UpdateCaseArgs, context: GraphQLContext): Promise<Case> => {
    assertAuthenticated(context);

    const { caseRepository: repo, fundRepository } = context.requestContainer.cradle;
    const validatedInput = zCaseUpdateSchema.parse(input);

    const current = await repo.findById(id);
    if (!current) {
      throw caseNotFoundError(id);
    }

    if (validatedInput.fundId !== undefined) {
      const fund = await fundRepository.findById(validatedInput.fundId);
      if (!fund) {
        throw fundNotFoundError(validatedInput.fundId);
      }
    }

    const numbersChanged =
      validatedInput.fundId !== undefined ||
      validatedInput.descriptionNumber !== undefined ||
      validatedInput.caseNumber !== undefined;

    if (numbersChanged) {
      const effectiveFundId = validatedInput.fundId ?? current.fundId;
      const effectiveDescriptionNumber = validatedInput.descriptionNumber ?? current.descriptionNumber;
      const effectiveCaseNumber = validatedInput.caseNumber ?? current.caseNumber;

      const existing = await repo.findByFundAndNumbers(effectiveFundId, effectiveDescriptionNumber, effectiveCaseNumber);
      if (existing && existing.id !== id) {
        throw duplicateNumbersError();
      }
    }

    let updatedCase: Case | null;
    try {
      updatedCase = await repo.update(id, validatedInput);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw duplicateNumbersError();
      }
      throw error;
    }

    if (!updatedCase) {
      throw caseNotFoundError(id);
    }

    const statsAffectingChange =
      validatedInput.fundId !== undefined || validatedInput.descriptionNumber !== undefined;

    if (statsAffectingChange) {
      const affectedFundIds = new Set([current.fundId, updatedCase.fundId]);

      await Promise.all(
        Array.from(affectedFundIds).map((affectedFundId) =>
          recalculateFundStats(affectedFundId, { caseRepository: repo, fundRepository })
        )
      );
    }

    return updatedCase;
  },

  deleteCase: async (_: unknown, { id }: DeleteCaseArgs, context: GraphQLContext): Promise<boolean> => {
    assertAuthenticated(context);
    const { caseRepository: repo, fundRepository } = context.requestContainer.cradle;

    const existingCase = await repo.findById(id);
    const deleted = await repo.delete(id);

    if (deleted && existingCase) {
      await recalculateFundStats(existingCase.fundId, { caseRepository: repo, fundRepository });
    }

    return deleted;
  }
};
