import { GraphQLError } from 'graphql';

import { FondErrorCodes, FondErrors, graphqlErrors } from '~/constants/errors';
import { Fond } from '~/src/domain/entities/Fond';
import { CreateFondInput, UpdateFondInput } from '~/src/domain/repositories/fondRepository';
import { GraphQLContext } from '~/src/shared/types/container/types';
import { zFondSchema, zFondUpdateSchema } from '~/src/validators/fond.schema';

export type CreateFondGQLInput = Omit<CreateFondInput, 'status'> & { status?: Fond['status'] };
export type UpdateFondGQLInput = UpdateFondInput;

type CreateFondArgs = { input: CreateFondGQLInput };
type UpdateFondArgs = { id: string; input: UpdateFondGQLInput };
type DeleteFondArgs = { id: string; };

const assertAuthenticated = (context: GraphQLContext) => {
  if (!context.admin) {
    throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
      extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
    });
  }
};


export const FondMutation = {
  createFond: async (_: unknown, { input }: CreateFondArgs, context: GraphQLContext): Promise<Fond> => {
    assertAuthenticated(context);
    const repo = context.requestContainer.cradle.fondRepository;
    const validatedInput = zFondSchema.parse(input);

    const { fondNumber } = validatedInput;

    const existing = await repo.findByFondNumber(fondNumber);
    if (existing) {
      throw new GraphQLError(FondErrors.NUMBER_ALREADY_EXISTS(fondNumber), {
        extensions: {
          code: FondErrorCodes.NUMBER_ALREADY_EXISTS
        }
      });
    }

    const res = await repo.create(validatedInput);

    return res;
  },

  updateFond: async (_: unknown, { id, input }: UpdateFondArgs, context: GraphQLContext): Promise<Fond> => {
    assertAuthenticated(context);
    const repo = context.requestContainer.cradle.fondRepository;

    const validateInput = zFondUpdateSchema.parse(input);

    if (validateInput.fondNumber !== undefined) {
      const existing = await repo.findByFondNumber(validateInput.fondNumber);
      if (existing && existing.id !== id) {
        throw new GraphQLError(FondErrors.NUMBER_ALREADY_EXISTS(validateInput.fondNumber), {
          extensions: {
            code: FondErrorCodes.NUMBER_ALREADY_EXISTS
          }
        });
      }
    }

    const updatedFond = await repo.update(id, validateInput);

    if (!updatedFond) {
      throw new GraphQLError(FondErrors.FOND_NOT_FOUND(id), {
        extensions: {
          code: FondErrorCodes.FOND_NOT_FOUND
        }
      });
    }

    return updatedFond;
  },

  deleteFond: async (_: unknown, { id }: DeleteFondArgs, context: GraphQLContext): Promise<boolean> => {
    assertAuthenticated(context);
    const repo = context.requestContainer.cradle.fondRepository;

    return await repo.delete(id);
  }
};
