import { GraphQLContext } from '~/back-shared/types/container/types';

export const authQuery = {
  verifyResetToken: async (_: unknown, args: { token: string }, { requestContainer }: GraphQLContext) => {
    const verifyResetTokenUseCase = requestContainer.cradle.verifyResetTokenUseCase;

    return await verifyResetTokenUseCase.execute(args.token);
  }
};
