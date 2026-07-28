import seedData from './archive.mock.data.json';
import { Fond, FondStatus } from '~/constants/fond';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const isFondStatus = (value: string): value is FondStatus =>
  Object.values(BaseContentStatuses).includes(value as BaseContentStatuses);

const normalizeStatus = (value: string): FondStatus =>
  isFondStatus(value) ? value : BaseContentStatuses.Draft;

type FondSeed = Omit<Fond, 'status'> & { status: string };

const SEEDS = seedData as FondSeed[];

export const ARCHIVE_FONDS_MOCK_DATA: Fond[] = SEEDS.map((item) => ({
  ...item,
  status: normalizeStatus(item.status)
}));
