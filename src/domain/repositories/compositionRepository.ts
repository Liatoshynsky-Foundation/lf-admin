
import { Composition } from '~/domain/entities/Composition';
import { FiltersInput, IBaseRepository } from '~/domain/repositories/baseRepository';

export type CompositionFilters = FiltersInput & {
  statuses?: string[];
  isStandalone?: boolean | null;
};

export type CompositionInput = Omit<Composition, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };

export interface ICompositionRepository extends IBaseRepository<Composition, CompositionFilters> {
  syncForOpus( inputs: CompositionInput[]): Promise<Composition[]>;
  searchByTitle(search: string): Promise<Composition[]>;
  findByIds(ids: string[]): Promise<Composition[]>;
  findByIdsPaginated(ids: string[], filters?: CompositionFilters): Promise<{ items: Composition[]; total: number }>;
  countByIds(ids: string[], filters?: CompositionFilters): Promise<number>;
}
