import { Dayjs } from 'dayjs';

import type { MediaModalResult } from '~/shared/components/media-modal/MediaModal.types';
import type { FilterOption } from '~/shared/components/selector/FilterSelect';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { OpusCompositionData } from '~/types/opus';


export const WORKS_TABS_NAMES = {
  ALL: 'all',
  OPUS: 'op',
  SINEOP: 'sineop',
  WORKS: 'compositions'
} as const;

export type WorksTabValue = (typeof WORKS_TABS_NAMES)[keyof typeof WORKS_TABS_NAMES];
export type AllTab = typeof WORKS_TABS_NAMES.ALL;
export type OpusTab = typeof WORKS_TABS_NAMES.OPUS;
export type SineopTab = typeof WORKS_TABS_NAMES.SINEOP;
export type WorksTab = typeof WORKS_TABS_NAMES.WORKS;

export type WorksStatusValue = (typeof WORKS_STATUSES)[number];
export type WorksLanguageValue = 'uk' | 'en' | 'bilingual';
export type WorksFilterId = 'status' | 'language';

export type WorksTabConfig = Readonly<{
  value: WorksTabValue;
  label: string;
  href: string;
  disabled?: boolean;
}>;

export type WorksCreateOption = Readonly<{
  id: 'work' | 'group';
  label: string;
  href: string;
}>;

export type WorksFilterConfig = Readonly<{
  id: WorksFilterId;
  label: string;
  options: readonly FilterOption[];
  menuMinWidth?: number;
}>;

export const WORKS_PAGE_TITLE = 'Творчість';
export const WORKS_BASE_PATH = '/creativity';

export const WORKS_STATUSES = [
  BaseContentStatuses.Draft,
  BaseContentStatuses.Published,
] as const;

export const WORKS_TABS: ReadonlyArray<WorksTabConfig> = [
  { value: WORKS_TABS_NAMES.ALL, label: 'Всі', href: WORKS_BASE_PATH },
  { value: WORKS_TABS_NAMES.OPUS, label: 'Опуси', href: `${WORKS_BASE_PATH}/op` },
  { value: WORKS_TABS_NAMES.SINEOP, label: 'Безопусні', href: `${WORKS_BASE_PATH}/sineop` },
  { value: WORKS_TABS_NAMES.WORKS, label: 'Твори', href: `${WORKS_BASE_PATH}/compositions` }
];

const WORKS_LANGUAGE_FILTER_OPTIONS: ReadonlyArray<FilterOption> = [
  { value: 'uk', label: 'Українська' },
  { value: 'en', label: 'Англійська' },
  { value: 'bilingual', label: 'Двомовна' }
];

const WORKS_STATUS_FILTER_OPTIONS: ReadonlyArray<FilterOption> = [
  {
    value: BaseContentStatuses.Draft,
    label: 'Чернетка (приховано)'
  },
  {
    value: BaseContentStatuses.Published,
    label: 'Опубліковане'
  }
];

export const WORKS_FILTERS: ReadonlyArray<WorksFilterConfig> = [
  {
    id: 'status',
    label: 'Статус',
    options: WORKS_STATUS_FILTER_OPTIONS,
    menuMinWidth: 150
  },
  {
    id: 'language',
    label: 'Мова',
    options: WORKS_LANGUAGE_FILTER_OPTIONS,
    menuMinWidth: 205
  }
];

export const WORKS_EMPTY_STATE_TITLE = 'Твори відсутні';
export const WORKS_EMPTY_STATE_DESCRIPTION = 'Твори для цієї вкладки поки відсутні.';
export const WORKS_EMPTY_STATE_NO_RESULTS_TITLE = 'Результатів немає';
export const WORKS_EMPTY_STATE_NO_RESULTS_DESCRIPTION =
  'За цими критеріями нічого не знайдено.\nСпробуйте змінити параметри фільтрів або пошуку.';
export const WORKS_LOADING_STATE_TITLE = 'Завантаження творів';
export const WORKS_LOADING_STATE_DESCRIPTION = 'Зачекайте, поки завершиться запит.';
export const WORKS_ERROR_STATE_TITLE = 'Не вдалося завантажити твори';
export const WORKS_ERROR_STATE_DESCRIPTION = 'Спробуйте оновити сторінку або повторити пізніше.';

export const WORKS_PUBLISH_RESTRICTION_MESSAGE =
  'Твір не може бути опублікований без групи (Опусу). Призначте твір до опусу і спробуйте знову.';

export interface GroupWork {
  id: string;
  name: string;
  genre?: { uk: string; en: string };
}

export interface GroupPhoto {
  id?: string;
  src?: string;
  fileName?: string;
  caption: { uk: string; en: string };
  altText: { uk: string; en: string };
  crop?: MediaModalResult['crop'] | null;

  url?: string;
  description?: { uk: string; en: string };
}

export interface GroupPerformance {
  id?: string;
  url?: string;
  caption?: { uk: string; en: string };
}

export type NormalizedGroupPerformance = GroupPerformance & { id: string };

export interface GroupData {
  titlePrefix: string;
  groupNumber: string;
  genre: { uk: string; en: string };
  additionalText: string;
  groupTitle: { uk: string; en: string }; 
  creationYear: string;
  endYear: string;
  dateAdditionalText: string;
  parts: { uk: string; en: string };
  description: { uk: Record<string, unknown>; en: Record<string, unknown> };
  photos: GroupPhoto[];
  compositions: OpusCompositionData[];
  performancesTitle: string;
  performances: GroupPerformance[];
  status: string;
  blocksOrder?: string[];
}

export type GroupDataField = keyof GroupData;
export interface AudioEntry {
  id: string;
  name: string | null;
  fileName: string | null;
}

export interface NoteEntry {
  id: string;
  name: string | null;
  date: Dayjs | null;
  fileName: string | null;
}

export const COMPOSITION_FILE_TYPES = {
  audio: 'audio',
  pdf: 'pdf'
} as const;

export type CompositionFileType = keyof typeof COMPOSITION_FILE_TYPES;

export const SHEET_MUSIC_MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
export const SHEET_MUSIC_FILE_SIZE_ERROR = 'Розмір файлу перевищує максимально допустимий ліміт (50 МБ).';

export const ITEMS_PER_PAGE = 8;

export const COMPOSITION_MODAL_PARAM = 'composition-id';