import { endpointRepositoryHandler, mapFilters } from '../helpers';
import { Case } from '~/src/domain/entities/Case';
import { CaseFilters } from '~/src/domain/repositories/caseRepository';

interface FindByIdArgs { id: string }
export type FiltersGQLInput = Parameters<typeof mapFilters>[0] & { fondId?: string | null; fundId?: string | null };
interface FilterArgs {
  filters: FiltersGQLInput;
}
interface PaginatedArgs { page: number, limit: number, filters: FiltersGQLInput }

interface PaginatedResponse {
  items: Case[]; total: number; page: number; totalPages: number
}

const mapCaseFilters = (filters?: FiltersGQLInput): CaseFilters | undefined => {
  if (!filters) return undefined;

  const mapped = mapFilters<CaseFilters>(filters) ?? {};

  return {
    ...mapped,
    fundId: filters.fundId ?? filters.fondId ?? undefined
  } as CaseFilters;
};

const endpointHandler = endpointRepositoryHandler('caseRepository');

export const CaseQuery = {
  caseById: endpointHandler<FindByIdArgs, Case | null>(async ({ args: { id }, repo }) => repo.findById(id)),
  allCases: endpointHandler<FilterArgs, Case[]>(async ({ repo, args: { filters } }) => repo.findAll(mapCaseFilters(filters))),
  paginatedCases: endpointHandler<PaginatedArgs, PaginatedResponse>(async ({ args: { page, limit, filters }, repo }) => repo.findPaginated(page, limit, mapCaseFilters(filters)))
};
