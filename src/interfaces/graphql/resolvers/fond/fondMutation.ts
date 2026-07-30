import { GraphQLError } from 'graphql';

import { FondErrorCodes, FondErrors, graphqlErrors } from '~/constants/errors';
import { Fond } from '~/src/domain/entities/Fond';
import { CreateFondInput, UpdateFondInput } from '~/src/domain/repositories/fondRepository';
import { GraphQLContext } from '~/src/shared/types/container/types';
import { zFondSchema, zFondUpdateSchema } from '~/src/validators/fond.schema';

const assertAuthenticated = (context: GraphQLContext) => {
  if (!context.admin) {
    throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
      extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
    });
  }
};


export const FondMutation = {
  createFond: async (_: unknown, { input }: { input: CreateFondInput }, context: GraphQLContext): Promise<Fond> => {
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

    return repo.create(validatedInput);
  },

  updateFond: async (_: unknown, { id, input }: { id: string, input: UpdateFondInput }, context: GraphQLContext): Promise<Fond> => {
    assertAuthenticated(context);
    const repo = context.requestContainer.cradle.fondRepository;

    const validateInput = zFondUpdateSchema.parse(input);
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

  deleteFond: async (_: unknown, { id }: { id: string }, context: GraphQLContext): Promise<boolean> => {
    assertAuthenticated(context);
    const repo = context.requestContainer.cradle.fondRepository;

    return await repo.delete(id);
  }
};
