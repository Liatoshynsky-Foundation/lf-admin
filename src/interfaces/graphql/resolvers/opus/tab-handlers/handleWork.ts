import { mapFilters } from '../../helpers';
import { PaginatedWorksResult, WorksFilter } from '../opusQuery';
import { mappedCompositions, totalPages } from './tabHandlersHelpers';
import { QueryFilters } from '~/src/domain/repositories/baseRepository';
import { CompositionFilters, ICompositionRepository } from '~/src/domain/repositories/compositionRepository';

export async function handleWorksTab(
  compositionsRepo: ICompositionRepository,
  filters: WorksFilter | undefined,
  page: number,
  pageSize: number,
): Promise<PaginatedWorksResult> {
  const mappedFilters: QueryFilters<CompositionFilters> & { opusId?: string | null } = {
    ...mapFilters(filters),
    opusId: null
  };
  const worksResult = await mappedCompositions(compositionsRepo, mappedFilters);
  
  return {
    groups: [],
    works: worksResult.works,
    total: worksResult.total,
    page,
    totalPages: totalPages(worksResult.total, pageSize),
  };
}