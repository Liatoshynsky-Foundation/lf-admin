import { ClientSession } from 'mongoose';

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
  create(input: CreateOpusInput, session?: ClientSession): Promise<Opus>;
  findByComplexKey(number: number, numberKind: string, additionalText?: string | null, session?: ClientSession): Promise<Opus | null>;
  unlink(opusId: string, session?: ClientSession): Promise<void>;
  moveCompositionsToCompositionsOpus(compositionIds: string[], session?: ClientSession ): Promise<void>;
  removeCompositionsFromCompositionsOpus(compositionIds: string[], session?: ClientSession ): Promise<void>;
}
