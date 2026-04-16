import type { FilterOption } from '~/shared/components/selector/FilterSelect';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export type PublicationsTabValue = 'all' | 'events' | 'news' | 'media';
export type PublicationsItemType = Exclude<PublicationsTabValue, 'all'>;
export const PUBLICATIONS_STATUSES = [
  BaseContentStatuses.Draft,
  BaseContentStatuses.Published,
  BaseContentStatuses.Editing
] as const;

export type PublicationsStatusValue = (typeof PUBLICATIONS_STATUSES)[number];
export type PublicationsLanguageValue = 'uk' | 'en' | 'bilingual';
export type PublicationsFilterId = 'status' | 'language';

export type PublicationsTabConfig = Readonly<{
  value: PublicationsTabValue;
  label: string;
  href: string;
  disabled?: boolean;
}>;

export type PublicationsCreateOption = Readonly<{
  id: 'event' | 'news' | 'media';
  label: string;
  href: string;
}>;

export type PublicationsFilterConfig = Readonly<{
  id: PublicationsFilterId;
  label: string;
  options: readonly FilterOption[];
  menuMinWidth?: number;
}>;

type PublicationsCategoryConfig = Readonly<{
  tabValue: PublicationsItemType;
  createId: PublicationsCreateOption['id'];
  slug: string;
  tabLabel: string;
  createLabel: string;
  disabled?: boolean;
}>;

export const PUBLICATIONS_PAGE_TITLE = 'Новини та події';
export const PUBLICATIONS_EMPTY_STATE_TITLE = 'Матеріали відсутні';
export const PUBLICATIONS_EMPTY_STATE_DESCRIPTION = 'Матеріали для цієї вкладки поки відсутні.';
export const PUBLICATIONS_EVENTS_EMPTY_STATE_DESCRIPTION = 'Матеріали для вкладки "Події" з’являться після підключення джерела даних.';
export const PUBLICATIONS_EMPTY_STATE_NO_RESULTS_TITLE = 'Результатів немає';
export const PUBLICATIONS_EMPTY_STATE_NO_RESULTS_DESCRIPTION = 'За цими критеріями нічого не знайдено.\nСпробуйте змінити параметри фільтрів або пошуку.';
export const PUBLICATIONS_LOADING_STATE_TITLE = 'Завантаження матеріалів';
export const PUBLICATIONS_LOADING_STATE_DESCRIPTION = 'Зачекайте, поки завершиться запит.';
export const PUBLICATIONS_ERROR_STATE_TITLE = 'Не вдалося завантажити матеріали';
export const PUBLICATIONS_ERROR_STATE_DESCRIPTION = 'Спробуйте оновити сторінку або повторити пізніше.';

const PUBLICATIONS_BASE_PATH = '/publications';

const PUBLICATIONS_CATEGORIES: ReadonlyArray<PublicationsCategoryConfig> = [
  {
    tabValue: 'events',
    createId: 'event',
    slug: 'events',
    tabLabel: 'Події',
    createLabel: 'Подію'
  },
  {
    tabValue: 'news',
    createId: 'news',
    slug: 'news',
    tabLabel: 'Новини',
    createLabel: 'Новину'
  },
  {
    tabValue: 'media',
    createId: 'media',
    slug: 'media',
    tabLabel: 'Ми у ЗМІ',
    createLabel: 'Ми у ЗМІ'
  }
];

export const PUBLICATIONS_TABS: ReadonlyArray<PublicationsTabConfig> = [
  { value: 'all', label: 'Всі', href: PUBLICATIONS_BASE_PATH },
  ...PUBLICATIONS_CATEGORIES.map(({ tabValue, tabLabel, slug, disabled }) => ({
    value: tabValue,
    label: tabLabel,
    href: `${PUBLICATIONS_BASE_PATH}/${slug}`,
    disabled
  }))
];

export const PUBLICATIONS_CREATE_OPTIONS: ReadonlyArray<PublicationsCreateOption> = PUBLICATIONS_CATEGORIES.map(
  ({ createId, createLabel, slug }) => ({
    id: createId,
    label: createLabel,
    href: `${PUBLICATIONS_BASE_PATH}/${slug}/create`
  })
);

const PUBLICATIONS_STATUS_FILTER_OPTIONS: ReadonlyArray<FilterOption> = [
  { value: BaseContentStatuses.Draft, label: 'Чернетка' },
  { value: BaseContentStatuses.Published, label: 'Опублікована' },
  { value: BaseContentStatuses.Editing, label: 'Опублікована з чернеткою' }
];

const PUBLICATIONS_LANGUAGE_FILTER_OPTIONS: ReadonlyArray<FilterOption> = [
  { value: 'uk', label: 'Українська' },
  { value: 'en', label: 'Англійська' },
  { value: 'bilingual', label: 'Двомовна' }
];

export const PUBLICATIONS_FILTERS: ReadonlyArray<PublicationsFilterConfig> = [
  {
    id: 'status',
    label: 'Статус',
    options: PUBLICATIONS_STATUS_FILTER_OPTIONS,
    menuMinWidth: 170
  },
  {
    id: 'language',
    label: 'Мова',
    options: PUBLICATIONS_LANGUAGE_FILTER_OPTIONS,
    menuMinWidth: 205
  }
];