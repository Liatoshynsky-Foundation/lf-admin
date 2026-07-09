import { GraphQLError } from 'graphql';

import { endpointRepositoryHandler, mapFilters } from '../helpers';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import { Composition } from '~/domain/entities/Composition';
import { Opus } from '~/domain/entities/Opus';
import { OpusFilters } from '~/domain/repositories/opusRepository';
import { OpusNumberKind } from '~/types/graphql/generated/graphql';

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
  filters?: NonNullable<Parameters<typeof mapFilters>[0]> & {
    numberKind?: OpusNumberKind;
  };
}
interface PaginatedArgs {
  page: number;
  limit: number;
  filters?: NonNullable<FilterArgs['filters']>;
}
// interface CountArgs {
//   status?: string;
// }

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

  allOpuses: endpointHandler<FilterArgs, Opus[]>(async ({ args: { filters }, repo, requestContainer }) => {
    const mappedFilters: OpusFilters = {
      ...mapFilters<OpusFilters>(filters),
      numberKind: filters?.numberKind ?? OpusNumberKind.Op
    };
    
    const opuses = await repo.findAll(mappedFilters);
    if (!opuses || opuses.length === 0) return [];

    const opusIds = opuses.map((o) => o.id);
    const compositionsRepo = requestContainer.cradle.compositionsRepository;
    const allCompositions = await compositionsRepo.findByOpusIds(opusIds);

    const compositionsByOpusId = new Map<string, typeof allCompositions>();
  
    for (const comp of allCompositions) {
      if (comp.opusId) {
        const idStr = String(comp.opusId);
        if (!compositionsByOpusId.has(idStr)) {
          compositionsByOpusId.set(idStr, []);
        }
      compositionsByOpusId.get(idStr)!.push(comp);
      }
    }

    return opuses.map((opus) => ({
      ...opus,
      compositions: compositionsByOpusId.get(String(opus.id)) ?? []
    }));
  }),

  paginatedOpuses: endpointHandler<
    PaginatedArgs,
    { items: Opus[]; total: number; page: number; totalPages: number }
  >(async ({ args: { page, limit, filters }, repo }) =>
    repo.findPaginated(page, limit, mapFilters<OpusFilters>(filters))
  ),

  // opusesCount: endpointHandler<CountArgs, number>(async ({ args: { status }, repo }) =>
  //   repo.count(status ? { statuses: [status as OpusStatus] } : undefined)
  // )
};
