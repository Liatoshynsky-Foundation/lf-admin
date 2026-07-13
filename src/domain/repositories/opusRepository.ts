import { Opus, OpusNumberKind } from '~/domain/entities/Opus';
import { FiltersInput, IBaseRepository } from '~/domain/repositories/baseRepository';
import { OpusStatus } from '~/types/enums/common.enums';

export type CreateOpusInput = Omit<Opus, 'id' | 'createdAt' | 'updatedAt' | 'compositions' | 'meta'> & {
  meta?: Partial<Opus['meta']>;
};

export type UpdateOpusInput = Partial<Omit<Opus, 'id' | 'createdAt' | 'updatedAt' | 'compositions'>>;

export type OpusFilters = FiltersInput & {
  statuses?: OpusStatus[];
  numberKind: OpusNumberKind;
};

export interface IOpusRepository extends IBaseRepository<Opus, OpusFilters> {
  create(input: CreateOpusInput): Promise<Opus>;
  findByNumber(number: string): Promise<Opus | null>;
}
