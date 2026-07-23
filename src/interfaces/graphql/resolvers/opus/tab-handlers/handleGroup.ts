import { PaginatedWorksResult, WorksFilter } from '../opusQuery';
import { attachCompositionsToGroups, mappedGroups, totalGroups, totalPages } from './tabHandlersHelpers';
import { ICompositionRepository } from '~/src/domain/repositories/compositionRepository';
import { IOpusRepository } from '~/src/domain/repositories/opusRepository';
import { WorksTab } from '~/types/graphql/generated/graphql';

export async function handleGroup(
  tab: WorksTab.Op | WorksTab.Sineop,
  repo: IOpusRepository,
  compositionsRepo: ICompositionRepository,
  filters: WorksFilter | undefined,
  page: number,
  pageSize: number
): Promise<PaginatedWorksResult> {
  const groupsResult = await mappedGroups(repo, tab, filters);
  const groupsTotal = await totalGroups(repo, tab, filters);
  
  const groups = await attachCompositionsToGroups(groupsResult, compositionsRepo);

  return {
    groups,
    works: [],
    total: groupsTotal,
    page,
    totalPages: totalPages(groupsTotal, pageSize)
  };
}
