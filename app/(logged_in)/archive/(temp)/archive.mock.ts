import seedData from './archive.mock.data.json';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export type FoundStatus = BaseContentStatuses;

export type Found = {
  id: string;
  fondNumber: number;
  name: string;
  descriptions: number;
  cases: number;
  dates: string;
  status: FoundStatus;
  updatedAt: string;
};

const isFoundStatus = (value: string): value is FoundStatus =>
  Object.values(BaseContentStatuses).includes(value as BaseContentStatuses);

const normalizeStatus = (value: string): FoundStatus =>
  isFoundStatus(value) ? value : BaseContentStatuses.Draft;

type FoundSeed = Omit<Found, 'status'> & { status: string };

const SEEDS = seedData as FoundSeed[];

export const ARCHIVE_FONDS_MOCK_DATA: Found[] = SEEDS.map((item) => ({
  ...item,
  status: normalizeStatus(item.status)
}));
