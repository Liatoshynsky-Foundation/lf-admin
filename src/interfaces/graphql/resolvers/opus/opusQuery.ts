import { GraphQLError } from 'graphql';

import { endpointRepositoryHandler, mapFilters } from '../helpers';
import { handleGroup } from './tab-handlers/handleGroup';
import { handleMixed } from './tab-handlers/handleMixed';
import { handleWork } from './tab-handlers/handleWork';
import { orderCompositionsByIds } from './tab-handlers/tabHandlersHelpers';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import { Composition } from '~/domain/entities/Composition';
import { Opus } from '~/domain/entities/Opus';
import { WorksTab } from '~/types/graphql/generated/graphql';

interface IdArgs {
  id: string;
}
interface NumberArgs {
  number: number;
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
  groups: OpusWithCompositions[];
  works: Composition[];
  total: number;
  page: number;
  totalPages: number;
}

type OpusWithCompositions = Omit<Opus, 'compositions'> & {
  compositions: Composition[];
};

const assertAuthenticated = (context: GraphQLContext): void => {
  if (!context.admin) {
    throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
      extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
    });
  }
};

const endpointHandler = endpointRepositoryHandler('opusRepository');

export const OpusQuery = {
  opusById: async (_: unknown, { id }: IdArgs, context: GraphQLContext): Promise<OpusWithCompositions | null> => {
    assertAuthenticated(context);
    
    const opus = await context.requestContainer.cradle.opusRepository.findById(id);
    

    if (!opus) {
      return null;
    }

    const compositionIds = (opus.compositions ?? []).map((comp): string => comp.toString());
    const compositions = orderCompositionsByIds(
      compositionIds,
      await context.requestContainer.cradle.compositionsRepository.findByIds(compositionIds)
    );

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
    const pageSize = filters?.limit ?? 10;
    const skip = filters?.skip ?? 0;
    const page = Math.floor(skip / pageSize) + 1;
    const compositionsRepo = requestContainer.cradle.compositionsRepository;

    if (tab === WorksTab.Op || tab === WorksTab.Sineop) {
      const result = await handleGroup(tab, repo, compositionsRepo, filters, page, pageSize);
      return result;
    } else if (tab === WorksTab.Compositions) {

      const result = await handleWork(tab, repo, compositionsRepo, filters, page, pageSize);
      console.log('handleWork result:', result);
      return result;
    }
    return handleMixed(repo, compositionsRepo, filters, page, pageSize);
  }),
};
