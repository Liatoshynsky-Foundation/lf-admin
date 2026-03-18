import { GraphQLError } from 'graphql';

import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import { RepositoriesModule } from '~/src/container/modules/repositories.module';

type Handler<TArgs = any, RepoKey extends keyof RepositoriesModule = keyof RepositoriesModule> = (params: {
  args: TArgs;
  requestContainer: GraphQLContext['requestContainer'];
  admin: GraphQLContext['admin'];
  repo: RepositoriesModule[RepoKey];
}) => Promise<any>;

export function endpointRepositoryHandler<RepoKey extends keyof RepositoriesModule, TArgs = any>(repoKey: RepoKey) {
  return (handler: Handler<TArgs, RepoKey>) => {
    return async (_: unknown, args: TArgs, { requestContainer, admin }: GraphQLContext) => {
      if (!admin) {
        throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
          extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
        });
      }

      const repo = requestContainer.cradle[repoKey];
      return handler({ args, requestContainer, admin, repo });
    };
  };
}
