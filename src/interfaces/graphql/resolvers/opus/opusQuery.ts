import { GraphQLError } from 'graphql';

import { endpointRepositoryHandler, mapFilters } from '../helpers';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import { Composition } from '~/domain/entities/Composition';
import { Opus } from '~/domain/entities/Opus';
import { OpusFilters } from '~/domain/repositories/opusRepository';
import { OpusStatus } from '~/types/enums/common.enums';

interface IdArgs {
  id: string;
}
interface NumberArgs {
  number: string;
}
interface SearchArgs {
  search: string;
}
interface FilterArgs {
  filters?: Parameters<typeof mapFilters>[0];
}
interface PaginatedArgs {
  page: number;
  limit: number;
  filters?: FilterArgs['filters'];
}
interface CountArgs {
  status?: string;
}

const assertAuthenticated = (context: GraphQLContext): void => {
  if (!context.admin) {
    throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
      extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
    });
  }
};

const endpointHandler = endpointRepositoryHandler('opusRepository');

export const OpusQuery = {
  opusById: async (_: unknown, { id }: IdArgs, context: GraphQLContext): Promise<Opus | null> => {
    assertAuthenticated(context);

    const opus = await context.requestContainer.cradle.opusRepository.findById(id);

    if (!opus) {
      return null;
    }

    const compositions = await context.requestContainer.cradle.compositionsRepository.findByOpusId(id);

    return { ...opus, compositions };
  },

  opusByNumber: endpointHandler<NumberArgs, Opus | null>(async ({ args: { number }, repo }) =>
    repo.findByNumber(number)
  ),

  searchCompositions: async (
    _: unknown,
    { search }: SearchArgs,
    context: GraphQLContext
  ): Promise<Composition[]> => {
    assertAuthenticated(context);

    return context.requestContainer.cradle.compositionsRepository.searchByTitle(search);
  },

  allOpuses: endpointHandler<FilterArgs, Opus[]>(async ({ args: { filters }, repo }) =>
    repo.findAll(mapFilters<OpusFilters>(filters))
  ),

  paginatedOpuses: endpointHandler<
    PaginatedArgs,
    { items: Opus[]; total: number; page: number; totalPages: number }
  >(async ({ args: { page, limit, filters }, repo }) =>
    repo.findPaginated(page, limit, mapFilters<OpusFilters>(filters))
  ),

  opusesCount: endpointHandler<CountArgs, number>(async ({ args: { status }, repo }) =>
    repo.count(status ? { statuses: [status as OpusStatus] } : undefined)
  )
};
