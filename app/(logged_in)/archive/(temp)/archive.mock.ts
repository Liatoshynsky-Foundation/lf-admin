import seedData from './archive.mock.data.json';
import { Fund, FundStatus } from '~/constants/fund';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const isFundStatus = (value: string): value is FundStatus =>
  Object.values(BaseContentStatuses).includes(value as BaseContentStatuses);

const normalizeStatus = (value: string): FundStatus =>
  isFundStatus(value) ? value : BaseContentStatuses.Draft;

type FundSeed = Omit<Fund, 'status'> & { status: string };

const SEEDS = seedData as FundSeed[];

export const ARCHIVE_FUNDS_MOCK_DATA: Fund[] = SEEDS.map((item) => ({
  ...item,
  status: normalizeStatus(item.status)
}));
