import { Composition } from '~/domain/entities/Composition';

export type CompositionInput = Omit<Composition, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };

export interface ICompositionRepository {
  findByOpusId(opusId: string): Promise<Composition[]>;
  syncForOpus(opusId: string, inputs: CompositionInput[]): Promise<Composition[]>;
  deleteByOpusId(opusId: string): Promise<void>;
  searchByTitle(search: string): Promise<Composition[]>;
}
