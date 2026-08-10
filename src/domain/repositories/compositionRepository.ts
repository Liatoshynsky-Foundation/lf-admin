import { ClientSession } from 'mongoose';

import { Composition } from '~/domain/entities/Composition';
import { FiltersInput, IBaseRepository } from '~/domain/repositories/baseRepository';

export type CompositionFilters = FiltersInput & {
  statuses?: string[];
};

export type CompositionInput = Omit<Composition, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };

export interface ICompositionRepository extends IBaseRepository<Composition, CompositionFilters> {
  syncForOpus(inputs: CompositionInput[], session?: ClientSession): Promise<Composition[]>;
  searchByTitle(search: string, ids?: string[], session?: ClientSession): Promise<Composition[]>;
  findByIds(ids: string[], session?: ClientSession): Promise<Composition[]>;
  findByIdsPaginated(ids: string[], filters?: CompositionFilters, session?: ClientSession): Promise<Composition[]>;
  countByIds(ids: string[], filters?: CompositionFilters, session?: ClientSession): Promise<number>;
  create(input: CompositionInput, session?: ClientSession): Promise<Composition>;
  findByName(name: string): Promise<Composition | null>;
}
