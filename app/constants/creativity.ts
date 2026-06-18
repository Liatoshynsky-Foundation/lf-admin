import type { FilterOption } from '~/shared/components/selector/FilterSelect';
import { HeaderConfig } from '~/shared/components/table-layout/TableHeader';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export type WorksTabValue = 'all' | 'opus' | 'ungrouped' | 'works';

export type WorksStatusValue = (typeof WORKS_STATUSES)[number];
export type WorksLanguageValue = 'uk' | 'en' | 'bilingual';
export type WorksFilterId = 'status' | 'language' | 'genre';

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
  BaseContentStatuses.Editing
] as const;

export const WORKS_TABS: ReadonlyArray<WorksTabConfig> = [
  { value: 'all', label: 'Всі', href: WORKS_BASE_PATH },
  { value: 'opus', label: 'Опуси', href: `${WORKS_BASE_PATH}/opus` },
  { value: 'ungrouped', label: 'Безопусні', href: `${WORKS_BASE_PATH}/ungrouped` },
  { value: 'works', label: 'Твори', href: `${WORKS_BASE_PATH}/works` }
];

export const WORKS_CREATE_OPTIONS: ReadonlyArray<WorksCreateOption> = [
  { id: 'work', label: 'Твір', href: `${WORKS_BASE_PATH}/work/create` },
  { id: 'group', label: 'Група', href: `${WORKS_BASE_PATH}/group/create` },
];

const WORKS_STATUS_FILTER_OPTIONS: ReadonlyArray<FilterOption> = [
  { value: BaseContentStatuses.Draft, label: 'Чернетка' },
  { value: BaseContentStatuses.Published, label: 'Опублікований' },
  { value: BaseContentStatuses.Editing, label: 'Опублікований з чернеткою' }
];

const WORKS_LANGUAGE_FILTER_OPTIONS: ReadonlyArray<FilterOption> = [
  { value: 'uk', label: 'Українська' },
  { value: 'en', label: 'Англійська' },
  { value: 'bilingual', label: 'Двомовна' }
];

const WORKS_GENRE_FILTER_OPTIONS: ReadonlyArray<FilterOption> = [
  { value: 'Струнний квартет', label: 'Струнний квартет' },
  { value: 'Романс, мистецька пісня', label: 'Романс, мистецька пісня' },
  { value: 'Симфонія', label: 'Симфонія' },
  { value: 'Соната', label: 'Соната' },
  { value: 'Хор', label: 'Хор' }
];

export const WORKS_FILTERS: ReadonlyArray<WorksFilterConfig> = [
  { id: 'status', label: 'Статус', options: WORKS_STATUS_FILTER_OPTIONS, menuMinWidth: 170 },
  { id: 'language', label: 'Мова', options: WORKS_LANGUAGE_FILTER_OPTIONS, menuMinWidth: 205 },
  { id: 'genre', label: 'Жанр', options: WORKS_GENRE_FILTER_OPTIONS, menuMinWidth: 220 }
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

export const GROUP_MENU_ITEMS = [
  { id: 'edit', label: 'Редагувати' },
  { id: 'publish', label: 'Опублікувати' },
  { id: 'unpublish', label: 'Зняти з публікації' },
  { id: 'ungroup', label: 'Розгрупувати' },
  { id: 'seo', label: 'SEO налаштування' },
  { id: 'share', label: 'Поширити' },
  { id: 'delete', label: 'Видалити', danger: true }
] as const;

export const WORK_MENU_ITEMS = [
  { id: 'upload_audio', label: 'Завантажити аудіо' },
  { id: 'upload_pdf', label: 'Завантажити PDF' },
  { id: 'seo', label: 'SEO налаштування' },
  { id: 'share', label: 'Поширити' },
  { id: 'delete', label: 'Видалити', danger: true }
] as const;

export const COLUMNS: readonly HeaderConfig[] = [
  {
    id: 'opus',
    headerLabel: 'Опуси',
    width: '88px',
    hasRightDivider: true
  },
  {
    id: 'title',
    headerLabel: 'Назва',
    width: 'minmax(220px, 1fr)'
  },
  {
    id: 'genre',
    headerLabel: 'Жанр',
    width: '216px'
  },
  {
    id: 'years',
    headerLabel: 'Роки',
    width: '96px',
    hasRightDivider: true
  },
  {
    id: 'status',
    headerLabel: 'Статус',
    width: '48px',
    hasRightDivider: true,
    align: 'center'
  }
];
