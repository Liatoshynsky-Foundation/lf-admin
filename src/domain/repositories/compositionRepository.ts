import { Composition } from '~/domain/entities/Composition';
import { FiltersInput } from '~/domain/repositories/baseRepository';

export type CompositionFilters = FiltersInput & {
  statuses?: string[];
};

export type CompositionInput = Omit<Composition, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };

export interface ICompositionRepository {
  findByOpusId(opusId: string): Promise<Composition[]>;
  syncForOpus(opusId: string, inputs: CompositionInput[]): Promise<Composition[]>;
  deleteByOpusId(opusId: string): Promise<void>;
  searchByTitle(search: string): Promise<Composition[]>;
  findStandalonePaginated(filters: CompositionFilters, page: number, pageSize: number): Promise<{ items: Composition[]; total: number }>;
  findByOpusIds(opusIds: string[]): Promise<Composition[]>;
}
