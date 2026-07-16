import { GraphQLError } from 'graphql';

import { endpointRepositoryHandler, mapFilters } from '../helpers';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import { Composition } from '~/domain/entities/Composition';
import { Opus } from '~/domain/entities/Opus';
import { OpusFilters } from '~/domain/repositories/opusRepository';
import { CompositionFilters } from '~/src/domain/repositories/compositionRepository';
import { OpusNumberKind, WorksFiltersInput, WorksTab } from '~/types/graphql/generated/graphql';

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

interface PaginatedWorksInput {
  tab?: WorksTab;
  search?: string;
  filters?: WorksFiltersInput;
  page?: number;
  pageSize?: number;
}

interface PaginatedWorksResult {
  groups: Opus[];
  works: Composition[];
  totalItems: number;
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

const mappedGroups = async (repo: any, compositionsRepo: any, page: number, pageSize: number, filters: any) => {
  const total = await repo.count(filters);

  let groups: Opus[] = await repo.findAll({
    ...filters,
    skip: (page - 1) * pageSize,
    limit: pageSize
  });

  const opusIds = groups.map((o) => o.id);
  const allCompositions: Composition[] = await compositionsRepo.findByOpusIds(opusIds);

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

  groups = groups.map((group) => ({
    ...group,
    compositions: compositionsByOpusId.get(String(group.id)) ?? []
  }));
      
  return { groups, total};
};

const mappedCompositions = async (repo: any, page: number, pageSize: number, filters: any) => {
  const total = await repo.count(filters);
  const works = await repo.findAll({
    ...filters,
    skip: (page - 1) * pageSize,
    limit: pageSize
  });

  return { works, total };
};

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

  paginatedWorks: endpointHandler< { input: PaginatedWorksInput }, PaginatedWorksResult 
  >(async ({ args: { input }, repo, requestContainer }) => {
    console.log('paginatedWorks', input);
    console.log('paginatedWorks', input.filters);

    const compositionsRepo = requestContainer.cradle.compositionsRepository;
    const { tab = WorksTab.All, page = 1, pageSize = 10 } = input;

    const totalPages = (totalItems: number, pageSize: number) => Math.ceil(totalItems / pageSize);

    if (tab === WorksTab.Opus || tab === WorksTab.Woo) {
      const numberKind =
      tab === WorksTab.Opus
        ? OpusNumberKind.Op
        : OpusNumberKind.Woo;

      const mappedFilters: OpusFilters = {
        ...mapFilters<OpusFilters>(input.filters),
        numberKind
      };
      const groupsResult = await mappedGroups(repo, compositionsRepo, page, pageSize, mappedFilters);

      return {
        groups: groupsResult.groups,
        works: [],
        totalItems: groupsResult.total,
        totalPages: totalPages(groupsResult.total, pageSize),
      };
    } else if (tab === WorksTab.Works) {
      const mappedFilters: CompositionFilters = {
        ...mapFilters<CompositionFilters>(input.filters),
        opusId: null
      };
      const worksResult = await mappedCompositions(compositionsRepo, page, pageSize, mappedFilters);
      
      return {
        groups: [],
        works: worksResult.works,
        totalItems: worksResult.total,
        totalPages: totalPages(worksResult.total, pageSize),
      };
    } 

    const mappedOpusFilters: OpusFilters = {
      ...mapFilters<OpusFilters>(input.filters),
    };

    const mappedCompositionFilters: CompositionFilters = {
      ...mapFilters<CompositionFilters>(input.filters),
      opusId: null
    };

    const totalGroups = await repo.count(mappedOpusFilters);
    const totalWorks = await compositionsRepo.count(mappedCompositionFilters);

    const totalItems = totalGroups + totalWorks;
    const offset = (page - 1) * pageSize;

    if (offset + pageSize <= totalGroups) {
      const groupsResult = await mappedGroups(
        repo,
        compositionsRepo,
        page,
        pageSize,
        mappedOpusFilters
      );

      return {
        groups: groupsResult.groups,
        works: [],
        totalItems,
        totalPages: totalPages(totalItems, pageSize),
      };
    }

    if (offset < totalGroups) {
      const groupsLimit = totalGroups - offset;
      const worksLimit = pageSize - groupsLimit;

      const groups = await mappedGroups(
        repo,
        compositionsRepo,
        page,
        groupsLimit,
        mappedOpusFilters
      );

      const works = await mappedCompositions(
        compositionsRepo,
        1,
        worksLimit,
        mappedCompositionFilters
      );

      return {
        groups: groups.groups,
        works: works.works,
        totalItems,
        totalPages: totalPages(totalItems, pageSize),
      };
    }

    const worksOffset = offset - totalGroups;
    const worksPage = Math.floor(worksOffset / pageSize) + 1;

    const works = await mappedCompositions(
      compositionsRepo,
      worksPage,
      pageSize,
      mappedCompositionFilters
    );

    console.log('totalItems', totalItems);
    console.log('totalPages', totalPages(totalItems, pageSize));

    return {
      groups: [],
      works: works.works,
      totalItems,
      totalPages: totalPages(totalItems, pageSize),
    };
  }),
};
