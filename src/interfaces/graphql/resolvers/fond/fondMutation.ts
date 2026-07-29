import { GraphQLError } from 'graphql';

import { FondErrorCodes, FondErrors } from '~/constants/errors';
import { Fond } from '~/src/domain/entities/Fond';
import { CreateFondInput, UpdateFondInput } from '~/src/domain/repositories/fondRepository';
import { GraphQLContext } from '~/src/shared/types/container/types';
import { zFondSchema } from '~/src/validators/fond.schema';

export const FondMutation = {
  createFond: async (_: unknown, { input }: { input: CreateFondInput }, context: GraphQLContext): Promise<Fond> => {
    const repo = context.requestContainer.cradle.fondRepository;
    const validatedInput = zFondSchema.parse(input);

    const { fondNumber } = input;

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
    const repo = context.requestContainer.cradle.fondRepository;

    const validateInput = zFondSchema.parse(input);
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
    const repo = context.requestContainer.cradle.fondRepository;

    return await repo.delete(id);
  }
};
