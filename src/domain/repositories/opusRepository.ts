import { Opus, OpusNumberKind } from '~/domain/entities/Opus';
import { FiltersInput, IBaseRepository } from '~/domain/repositories/baseRepository';
import { OpusStatus } from '~/types/enums/common.enums';

export type CreateOpusInput = Omit<Opus, 'id' | 'createdAt' | 'updatedAt' | 'compositions' | 'meta'> & {
  meta?: Partial<Opus['meta']>;
  compositions?: string[];
  number: number;
  numberKind: OpusNumberKind;
  additionalText?: string | null;
};

export type UpdateOpusInput = Partial<Omit<Opus, 'id' | 'createdAt' | 'updatedAt' >>;

export type OpusFilters = FiltersInput & {
  statuses?: OpusStatus[];
  numberKind?: OpusNumberKind;
};

export interface IOpusRepository extends IBaseRepository<Opus, OpusFilters> {
  create(input: CreateOpusInput): Promise<Opus>;
  findByComplexKey(number: number, numberKind: string, additionalText?: string | null): Promise<Opus | null>;
  unlink(opusId: string): Promise<void>;
  moveCompositionsToCompositionsOpus(compositionIds: string[]): Promise<void>;
  removeCompositionsFromCompositionsOpus(compositionIds: string[]): Promise<void>;
}
