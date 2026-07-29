import { GraphQLError } from 'graphql';

import { FondErrorCodes, FondErrors } from '~/constants/errors';
import { Fond } from '~/src/domain/entities/Fond';
import { CreateFondInput } from '~/src/domain/repositories/fondRepository';
import { GraphQLContext } from '~/src/shared/types/container/types';
import { zFondSchema } from '~/src/validators/fond.schema';

export const FondMutation = {
  create: async (_: unknown, { input }: { input: CreateFondInput }, context: GraphQLContext): Promise<Fond> => {
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
  }
};
