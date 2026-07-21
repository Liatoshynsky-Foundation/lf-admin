import { PaginatedWorksResult, WorksFilter } from '../opusQuery';
import { attachCompositionsToGroups, mappedGroups, totalPages } from './tabHandlersHelpers';
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
  const groups = await attachCompositionsToGroups(groupsResult.groups, compositionsRepo);

  return {
    groups,
    works: [],
    total: groupsResult.total,
    page,
    totalPages: totalPages(groupsResult.total, pageSize)
  };
}
