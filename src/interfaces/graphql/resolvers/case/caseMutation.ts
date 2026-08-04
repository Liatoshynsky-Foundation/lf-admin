import { GraphQLError } from 'graphql';

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

const fondNotFoundError = (fondId: string): GraphQLError =>
  new GraphQLError(CaseErrors.FOND_NOT_FOUND(fondId), {
    extensions: { code: CaseErrorCodes.FOND_NOT_FOUND }
  });

const duplicateNumbersError = (): GraphQLError =>
  new GraphQLError(CaseErrors.DUPLICATE_NUMBERS(), {
    extensions: { code: CaseErrorCodes.DUPLICATE_NUMBERS }
  });

const caseNotFoundError = (id: string): GraphQLError =>
  new GraphQLError(CaseErrors.CASE_NOT_FOUND(id), {
    extensions: { code: CaseErrorCodes.CASE_NOT_FOUND }
  });

export const CaseMutation = {
  createCase: async (_: unknown, { input }: CreateCaseArgs, context: GraphQLContext): Promise<Case> => {
    assertAuthenticated(context);

    const { caseRepository: repo, fondRepository } = context.requestContainer.cradle;
    const validatedInput = zCaseSchema.parse(input);

    const { fondId, descriptionNumber, caseNumber } = validatedInput;

    const fond = await fondRepository.findById(fondId);
    if (!fond) {
      throw fondNotFoundError(fondId);
    }

    const existing = await repo.findByFondAndNumbers(fondId, descriptionNumber, caseNumber);
    if (existing) {
      throw duplicateNumbersError();
    }

    return repo.create(validatedInput);
  },

  updateCase: async (_: unknown, { id, input }: UpdateCaseArgs, context: GraphQLContext): Promise<Case> => {
    assertAuthenticated(context);

    const { caseRepository: repo, fondRepository } = context.requestContainer.cradle;
    const validatedInput = zCaseUpdateSchema.parse(input);

    const current = await repo.findById(id);
    if (!current) {
      throw caseNotFoundError(id);
    }

    if (validatedInput.fondId !== undefined) {
      const fond = await fondRepository.findById(validatedInput.fondId);
      if (!fond) {
        throw fondNotFoundError(validatedInput.fondId);
      }
    }

    const numbersChanged =
      validatedInput.fondId !== undefined ||
      validatedInput.descriptionNumber !== undefined ||
      validatedInput.caseNumber !== undefined;

    if (numbersChanged) {
      const effectiveFondId = validatedInput.fondId ?? current.fondId;
      const effectiveDescriptionNumber = validatedInput.descriptionNumber ?? current.descriptionNumber;
      const effectiveCaseNumber = validatedInput.caseNumber ?? current.caseNumber;

      const existing = await repo.findByFondAndNumbers(effectiveFondId, effectiveDescriptionNumber, effectiveCaseNumber);
      if (existing && existing.id !== id) {
        throw duplicateNumbersError();
      }
    }

    const updatedCase = await repo.update(id, validatedInput);

    if (!updatedCase) {
      throw caseNotFoundError(id);
    }

    return updatedCase;
  },

  deleteCase: async (_: unknown, { id }: DeleteCaseArgs, context: GraphQLContext): Promise<boolean> => {
    assertAuthenticated(context);
    const repo = context.requestContainer.cradle.caseRepository;

    return repo.delete(id);
  }
};
