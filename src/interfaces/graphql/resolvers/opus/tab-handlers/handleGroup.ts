import { mapFilters } from '../../helpers';
import { PaginatedWorksResult, WorksFilter } from '../opusQuery';
import { mappedGroups, numberKindByTab, totalPages } from './tabHandlersHelpers';
import { ICompositionRepository } from '~/src/domain/repositories/compositionRepository';
import { IOpusRepository, OpusFilters } from '~/src/domain/repositories/opusRepository';
import { WorksTab } from '~/types/graphql/generated/graphql';

export async function handleGroup(
  tab: WorksTab.Opus | WorksTab.Woo,
  repo: IOpusRepository,
  filters: WorksFilter | undefined,
  page: number,
  compositionsRepo: ICompositionRepository,
  pageSize: number,
): Promise<PaginatedWorksResult> {
  const numberKind = numberKindByTab[tab];
  
  const mappedFilters: OpusFilters = {
    ...mapFilters<OpusFilters>(filters),
    numberKind
  };
  const groupsResult = await mappedGroups(repo, compositionsRepo, mappedFilters);
  
  return {
    groups: groupsResult.groups,
    works: [],
    total: groupsResult.total,
    page,
    totalPages: totalPages(groupsResult.total, pageSize),
  };
}