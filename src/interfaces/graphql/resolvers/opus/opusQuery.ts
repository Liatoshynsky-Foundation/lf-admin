import { GraphQLError } from 'graphql';

import { endpointRepositoryHandler, mapFilters } from '../helpers';
import { handleGroup } from './tab-handlers/handleGroup';
import { handleMixed } from './tab-handlers/handleMixed';
import { handleWorksTab } from './tab-handlers/handleWork';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import { Composition } from '~/domain/entities/Composition';
import { Opus } from '~/domain/entities/Opus';
import { WorksTab } from '~/types/graphql/generated/graphql';

interface IdArgs {
  id: string;
}
interface NumberArgs {
  number: string;
}
interface SearchArgs {
  search: string;
}

export type WorksFilter = NonNullable<Parameters<typeof mapFilters>[0]>;
export interface PaginatedWorksArgs {
  tab?: WorksTab;
  filters?: WorksFilter;
}

export interface PaginatedWorksResult {
  groups: Opus[];
  works: Composition[];
  total: number;
  page: number;
  totalPages: number;
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

  paginatedWorks: endpointHandler<PaginatedWorksArgs, PaginatedWorksResult>(async ({ args, repo, requestContainer }) => {
    const { tab, filters } = args;
    const compositionsRepo = requestContainer.cradle.compositionsRepository;
    const pageSize = filters?.limit ?? 10;
    const skip = filters?.skip ?? 0;
    const page = Math.floor(skip / pageSize) + 1;

    if (tab === WorksTab.Opus || tab === WorksTab.Woo) {
      return handleGroup(tab, repo, filters, page, compositionsRepo, pageSize);
    } else if (tab === WorksTab.Works) {
      return handleWorksTab(compositionsRepo, filters, page, pageSize);
    }
    return handleMixed(repo, compositionsRepo, filters, page, pageSize);
  }),
};
