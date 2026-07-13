import { FilterOption } from '~/shared/components/selector/FilterSelect';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export type ArchiveTabValue = 'all' | 'fonds' | 'cases';

export const ARCHIVE_PAGE_TITLE = 'Архів';
export const ARCHIVE_BASE_PATH = '/archive';

export const ARCHIVE_TABS = [
  { value: 'all', label: 'Всі', href: ARCHIVE_BASE_PATH },
  { value: 'fonds', label: 'Фонди', href: `${ARCHIVE_BASE_PATH}/fonds` },
  { value: 'cases', label: 'Справи', href: `${ARCHIVE_BASE_PATH}/cases` },
];

export const ARCHIVE_STATUSES = [
  BaseContentStatuses.Hidden,
  BaseContentStatuses.Published,
] as const;

export type ArchiveStatusValue = (typeof ARCHIVE_STATUSES)[number];

export const ARCHIVE_STATUS_FILTER_OPTIONS: ReadonlyArray<FilterOption> = [
  { value: 'all', label: 'Усі'}, 
  { value: BaseContentStatuses.Hidden, label: 'Приховано' },
  { value: BaseContentStatuses.Published, label: 'Опубліковано' }
];