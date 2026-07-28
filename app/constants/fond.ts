import { BaseContentStatuses } from '~/types/enums/common.enums';

export type FondStatus = BaseContentStatuses;

export type Fond = {
  id: string;
  fondNumber: number;
  name: string;
  descriptions: number;
  cases: number;
  dates: string;
  status: FondStatus;
  updatedAt: string;
};