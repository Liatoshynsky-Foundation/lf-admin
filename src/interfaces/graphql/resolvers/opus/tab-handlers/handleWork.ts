import { PaginatedWorksResult, WorksFilter } from '../opusQuery';
import { mappedCompositions, mappedGroups, totalCompositions, totalPages } from './tabHandlersHelpers';
import { ICompositionRepository } from '~/src/domain/repositories/compositionRepository';
import { IOpusRepository } from '~/src/domain/repositories/opusRepository';
import { WorksTab } from '~/types/graphql/generated/graphql';

export async function handleWork(
  tab: WorksTab.Compositions,
  repo: IOpusRepository,
  compositionRepo: ICompositionRepository,
  filters: WorksFilter | undefined,
  page: number,
  pageSize: number
): Promise<PaginatedWorksResult> {
  const groupsResult = await mappedGroups(repo, tab);
  const compositionIds = groupsResult[0]?.compositions ?? [];
  const skip = (page - 1) * pageSize;

  const [total, works] = await Promise.all([
    totalCompositions(compositionRepo, compositionIds, filters),
    mappedCompositions(
      compositionRepo,
      compositionIds,
      skip,
      pageSize,
      filters
    ),
  ]);

  return {
    groups: [],
    works,
    total,
    page,
    totalPages: totalPages(total, pageSize),
  };
}
