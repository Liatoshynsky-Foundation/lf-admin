
import { endpointRepositoryHandler, mapFilters } from '../helpers';
import { Composition } from '~/domain/entities/Composition';
import { CompositionFilters } from '~/src/domain/repositories/compositionRepository';

interface FilterArgs {
  filters?: NonNullable<Parameters<typeof mapFilters>[0]> & {
    isStandalone?: boolean | null;
  };
}

const endpointHandler = endpointRepositoryHandler('compositionsRepository');

export const CompositionsQuery = {
  allCompositions: endpointHandler<FilterArgs, Composition[]>(async ({ args: { filters }, repo }) => {
    const mappedFilters: CompositionFilters = {
      ...mapFilters<CompositionFilters>(filters),
      isStandalone: filters?.isStandalone ?? undefined
    };

    const compositions = await repo.findAll(mappedFilters);
    if (!compositions || compositions.length === 0) return [];
    
    return compositions;
  }),
};
