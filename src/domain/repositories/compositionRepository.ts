import { Composition } from '~/domain/entities/Composition';
import { FiltersInput, IBaseRepository } from '~/domain/repositories/baseRepository';

export type CompositionFilters = FiltersInput & {
  statuses?: string[];
  isStandalone?: boolean;
};

export type CompositionInput = Omit<Composition, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };

export interface ICompositionRepository extends IBaseRepository<Composition, CompositionFilters> {
  findByOpusId(opusId: string): Promise<Composition[]>;
  syncForOpus(opusId: string, inputs: CompositionInput[]): Promise<Composition[]>;
  deleteByOpusId(opusId: string): Promise<void>;
  searchByTitle(search: string): Promise<Composition[]>;
  findByOpusIds(opusIds: string[]): Promise<Composition[]>;
}
