import { endpointRepositoryHandler, mapFilters } from '../helpers';
import { ResearchWork } from '~/src/domain/entities/ResearchWork';
import { ResearchWorkFilters } from '~/src/domain/repositories/researchWorkRepository';

interface FindByIdArgs {
  id: string;
}

type FiltersGQLInput = Parameters<typeof mapFilters>[0];

interface FilterArgs {
  filters?: FiltersGQLInput;
}

interface PaginatedArgs {
  page: number;
  limit: number;
  filters?: FiltersGQLInput;
}

interface PaginatedResponse {
  items: ResearchWork[];
  total: number;
  page: number;
  totalPages: number;
}

const mapResearchWorkFilters = (filters?: FiltersGQLInput): ResearchWorkFilters | undefined => {
  if (!filters) return undefined;

  return mapFilters<ResearchWorkFilters>(filters);
};

const endpointHandler = endpointRepositoryHandler('researchWorkRepository');

export const ResearchWorkQuery = {
  researchWorkById: endpointHandler<FindByIdArgs, ResearchWork | null>(async ({ args: { id }, repo }) =>
    repo.findById(id)
  ),

  allResearchWorks: endpointHandler<FilterArgs, ResearchWork[]>(async ({ repo, args: { filters } }) =>
    repo.findAll(mapResearchWorkFilters(filters))
  ),

  paginatedResearchWorks: endpointHandler<PaginatedArgs, PaginatedResponse>(
    async ({ args: { page, limit, filters }, repo }) =>
      repo.findPaginated(page, limit, mapResearchWorkFilters(filters))
  )
};
