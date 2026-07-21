import { PaginatedWorksResult, WorksFilter } from '../opusQuery';
import { mappedGroups,totalPages } from './tabHandlersHelpers';
import { ICompositionRepository } from '~/src/domain/repositories/compositionRepository';
import { IOpusRepository } from '~/src/domain/repositories/opusRepository';
import { WorksTab } from '~/types/graphql/generated/graphql';

export async function handleWork (
  tab: WorksTab.Compositions,
  repo: IOpusRepository,
  compositionRepo: ICompositionRepository,
  filters: WorksFilter | undefined,
  page: number,
  pageSize: number,
): Promise<PaginatedWorksResult> {
  const groupsResult = await mappedGroups(repo, tab, filters);
  const compositionIds = groupsResult.groups[0]?.compositions ?? [];
  const compositions = await compositionRepo.findByIds(compositionIds);
  console.log('groupsResult:', groupsResult);
  console.log('compositions:', compositions);

  return {
    groups: [],
    works: compositions,
    total: groupsResult.total,
    page,
    totalPages: totalPages(groupsResult.total, pageSize),
  };
}
