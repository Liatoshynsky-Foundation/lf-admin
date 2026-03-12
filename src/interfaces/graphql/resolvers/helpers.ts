import { GraphQLError } from 'graphql';
import {SortOrder} from 'mongoose';

import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import {FiltersInput} from '~/domain/repositories/baseRepository';
import { RepositoriesModule } from '~/src/container/modules/repositories.module';
import {SortByDate} from '~/types/enums/common.enums';

type Handler<TArgs, RepoKey extends keyof RepositoriesModule, TResult> = (params: {
  args: TArgs;
  requestContainer: GraphQLContext['requestContainer'];
  admin: GraphQLContext['admin'];
  repo: RepositoriesModule[RepoKey];
}) => Promise<TResult>;

export function endpointRepositoryHandler<RepoKey extends keyof RepositoriesModule, TArgs>(repoKey: RepoKey) {
  return <TResult>(handler: Handler<TArgs, RepoKey, TResult>) => {
    return async (_: unknown, args: TArgs, { requestContainer, admin }: GraphQLContext): Promise<TResult> => {
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

interface GenericFiltersInput {
  status?: string | null;
  slug?: string | null;
  limit?: number | null;
  skip?: number | null;
  sort?: Array<{
    field?: string | null;
    order?: string | null;
  }> | null;
}

export const mapFilters = <T extends FiltersInput>(
  filters?: GenericFiltersInput | null
): T | undefined => {
  if (!filters) return undefined;

  return {
    status: filters.status,
    slug: filters.slug ?? undefined,
    limit: filters.limit ?? undefined,
    skip: filters.skip ?? undefined,
    sort: filters.sort?.map(s => ({
      sortBy: s.field as SortByDate,
      sortOrder: s.order as SortOrder
    }))
  } as T;
};