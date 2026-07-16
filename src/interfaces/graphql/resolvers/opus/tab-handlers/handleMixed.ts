import { mapFilters } from '../../helpers';
import { PaginatedWorksResult, WorksFilter } from '../opusQuery';
import { mappedCompositions, mappedGroups, totalPages } from './tabHandlersHelpers';
import { CompositionFilters, ICompositionRepository } from '~/src/domain/repositories/compositionRepository';
import { IOpusRepository, OpusFilters } from '~/src/domain/repositories/opusRepository';

interface PaginationParams {
  page: number;
  pageSize: number;
  totalItems: number;
}

const getOnlyOpus = async (
  repo: IOpusRepository,
  compositionsRepo: ICompositionRepository,
  mappedOpusFilters: OpusFilters,
  params: PaginationParams
) => {
  const groupsResult = await mappedGroups(repo, compositionsRepo, mappedOpusFilters);

  return {
    groups: groupsResult.groups,
    works: [],
    total: params.totalItems,
    page: params.page,
    totalPages: totalPages(params.totalItems, params.pageSize),
  };
};

const getMixed = async (
  repo: IOpusRepository,
  compositionsRepo: ICompositionRepository,
  mappedOpusFilters: OpusFilters,
  mappedCompositionFilters: CompositionFilters,
  totalGroups: number,
  offset: number,
  params: PaginationParams
) => {
  const groupsLimit = Math.max(0, totalGroups - offset);
  const worksLimit = params.pageSize - groupsLimit;

  mappedOpusFilters.limit = groupsLimit;
  
  mappedCompositionFilters.limit = worksLimit;
  mappedCompositionFilters.skip = 0;

  const groups = await mappedGroups(repo, compositionsRepo, mappedOpusFilters);
  const works = await mappedCompositions(compositionsRepo, mappedCompositionFilters);

  return {
    groups: groups.groups,
    works: works.works,
    total: params.totalItems,
    page: params.page,
    totalPages: totalPages(params.totalItems, params.pageSize),
  };
};

const getLeftCompositions = async (
  compositionsRepo: ICompositionRepository,
  mappedCompositionFilters: CompositionFilters,
  totalGroups: number,
  offset: number,
  params: PaginationParams
) => {
  const worksOffset = Math.max(0, offset - totalGroups);

  mappedCompositionFilters.skip = worksOffset;
  mappedCompositionFilters.limit = params.pageSize;

  const works = await mappedCompositions(compositionsRepo, mappedCompositionFilters);

  return {
    groups: [],
    works: works.works,
    total: params.totalItems,
    page: params.page,
    totalPages: totalPages(params.totalItems, params.pageSize),
  };
};

export async function handleMixed(
  repo: IOpusRepository,
  compositionsRepo: ICompositionRepository,
  filters: WorksFilter | undefined,
  page: number,
  pageSize: number,
): Promise<PaginatedWorksResult> {
  const mappedOpusFilters: OpusFilters = { ...mapFilters<OpusFilters>(filters) };
  const mappedCompositionFilters: CompositionFilters = { 
    ...mapFilters<CompositionFilters>(filters), 
    opusId: null 
  };
    
  const totalGroups = await repo.count(mappedOpusFilters);
  const totalWorks = await compositionsRepo.count(mappedCompositionFilters);

  const totalItems = totalGroups + totalWorks;
  const offset = (page - 1) * pageSize;
  const pagination = { page, pageSize, totalItems };

  if (offset + pageSize <= totalGroups) {
    return await getOnlyOpus(repo, compositionsRepo, mappedOpusFilters, pagination);
  }

  if (offset < totalGroups) {
    return await getMixed(repo, compositionsRepo, mappedOpusFilters, mappedCompositionFilters, totalGroups, offset, pagination);
  }

  return await getLeftCompositions(compositionsRepo, mappedCompositionFilters, totalGroups, offset, pagination);
}