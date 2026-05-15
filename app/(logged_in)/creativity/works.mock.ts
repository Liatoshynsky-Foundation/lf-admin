import seedData from './works.mock.data.json';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export type WorkStatus = typeof BaseContentStatuses[keyof typeof BaseContentStatuses];
type WorkLanguage = 'uk' | 'en' | 'bilingual';

export type WorkItem = {
  id: string;
  title: string;
  year: string;
  status?: WorkStatus;
  updatedAt?: string;
  createdAt?: string;
  publishedAt?: string;
};

type WorkGroupBase = {
  id: string;
  title: string;
  genre: string;
  language: WorkLanguage;
  yearRange: string;
  status: WorkStatus;
  createdAt?: string;
  updatedAt: string;
  publishedAt?: string;
  works: WorkItem[];
};

export type OpusGroup = WorkGroupBase & {
  opusNumber: string;
};

export type UngroupedGroup = WorkGroupBase & {
  boNumber: string;
};

export type WorksMockData = {
  opusGroups: OpusGroup[];
  ungroupedGroups: UngroupedGroup[];
};

type GroupKind = 'opus' | 'ungrouped';

type GroupSeed = Readonly<{
  kind: GroupKind;
  id: string;
  number: string;
  title: string;
  genre: string;
  language: WorkLanguage;
  yearRange: string;
  status: WorkStatus;
  createdAt?: string;
  updatedAt: string;
  publishedAt?: string;
  works: ReadonlyArray<Pick<WorkItem, 'id' | 'title' | 'year'>>;
}>;

const GROUP_SEEDS = seedData as ReadonlyArray<GroupSeed>;

const isWorkStatus = (value: string): value is WorkStatus =>
  Object.values(BaseContentStatuses).includes(value as BaseContentStatuses);

const normalizeStatus = (value: string): WorkStatus =>
  isWorkStatus(value) ? value : BaseContentStatuses.Draft;

const buildGroup = <TNumberKey extends 'opusNumber' | 'boNumber'>(
  numberKey: TNumberKey,
  seed: GroupSeed
): WorkGroupBase & Record<TNumberKey, string> => ({
  id: seed.id,
  [numberKey]: seed.number,
  title: seed.title,
  genre: seed.genre,
  language: seed.language,
  yearRange: seed.yearRange,
  status: normalizeStatus(seed.status),
  createdAt: seed.createdAt,
  updatedAt: seed.updatedAt,
  publishedAt: seed.publishedAt,
  works: seed.works.map((work) => ({ id: work.id, title: work.title, year: work.year }))
}) as WorkGroupBase & Record<TNumberKey, string>;

export const WORKS_MOCK_DATA: WorksMockData = {
  opusGroups: GROUP_SEEDS.filter((seed) => seed.kind === 'opus').map(
    (seed) => buildGroup('opusNumber', seed) as OpusGroup
  ),
  ungroupedGroups: GROUP_SEEDS.filter((seed) => seed.kind === 'ungrouped').map(
    (seed) => buildGroup('boNumber', seed) as UngroupedGroup
  )
};
