import { GraphQLError } from 'graphql';

import { FundErrorCodes, FundErrors, graphqlErrors } from '~/constants/errors';
import { Fund } from '~/src/domain/entities/Fund';
import { CreateFundInput, UpdateFundInput } from '~/src/domain/repositories/fundRepository';
import { GraphQLContext } from '~/src/shared/types/container/types';
import { zFundSchema, zFundUpdateSchema } from '~/src/validators/fund.schema';

export type CreateFundGQLInput = Omit<CreateFundInput, 'status'> & { status?: Fund['status'] };
export type UpdateFundGQLInput = UpdateFundInput;

type CreateFundArgs = { input: CreateFundGQLInput };
type UpdateFundArgs = { id: string; input: UpdateFundGQLInput };
type DeleteFundArgs = { id: string; };

const assertAuthenticated = (context: GraphQLContext) => {
  if (!context.admin) {
    throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
      extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
    });
  }
};


export const FundMutation = {
  createFund: async (_: unknown, { input }: CreateFundArgs, context: GraphQLContext): Promise<Fund> => {
    assertAuthenticated(context);
    const repo = context.requestContainer.cradle.fundRepository;
    const validatedInput = zFundSchema.parse(input);

    const { fundNumber } = validatedInput;

    const existing = await repo.findByFundNumber(fundNumber);
    if (existing) {
      throw new GraphQLError(FundErrors.NUMBER_ALREADY_EXISTS(fundNumber), {
        extensions: {
          code: FundErrorCodes.NUMBER_ALREADY_EXISTS
        }
      });
    }

    const res = await repo.create(validatedInput);

    return res;
  },

  updateFund: async (_: unknown, { id, input }: UpdateFundArgs, context: GraphQLContext): Promise<Fund> => {
    assertAuthenticated(context);
    const repo = context.requestContainer.cradle.fundRepository;

    const validateInput = zFundUpdateSchema.parse(input);

    if (validateInput.fundNumber !== undefined) {
      const existing = await repo.findByFundNumber(validateInput.fundNumber);
      if (existing && existing.id !== id) {
        throw new GraphQLError(FundErrors.NUMBER_ALREADY_EXISTS(validateInput.fundNumber), {
          extensions: {
            code: FundErrorCodes.NUMBER_ALREADY_EXISTS
          }
        });
      }
    }

    const updatedFund = await repo.update(id, validateInput);

    if (!updatedFund) {
      throw new GraphQLError(FundErrors.FUND_NOT_FOUND(id), {
        extensions: {
          code: FundErrorCodes.FUND_NOT_FOUND
        }
      });
    }

    return updatedFund;
  },

  deleteFund: async (_: unknown, { id }: DeleteFundArgs, context: GraphQLContext): Promise<boolean> => {
    assertAuthenticated(context);
    const repo = context.requestContainer.cradle.fundRepository;

    return await repo.delete(id);
  }
};
