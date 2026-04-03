import type { FilterOption } from '~/shared/components/selector/FilterSelect';

export type PublicationsTabValue = 'all' | 'events' | 'news' | 'media';
export type PublicationsItemType = Exclude<PublicationsTabValue, 'all'>;
export type PublicationsStatusValue = 'draft' | 'published' | 'published_with_draft';
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

export const PUBLICATIONS_PAGE_TITLE = 'Новини та події';
export const PUBLICATIONS_EMPTY_STATE_TITLE = 'Матеріали відсутні';
export const PUBLICATIONS_EMPTY_STATE_DESCRIPTION = 'Матеріали для цієї вкладки поки відсутні.';
export const PUBLICATIONS_EVENTS_EMPTY_STATE_DESCRIPTION = 'Матеріали для вкладки "Події" з’являться після підключення джерела даних.';
export const PUBLICATIONS_EMPTY_STATE_NO_RESULTS_TITLE = 'Нічого не знайдено';
export const PUBLICATIONS_EMPTY_STATE_NO_RESULTS_DESCRIPTION = 'Змініть параметри пошуку або фільтри.';
export const PUBLICATIONS_LOADING_STATE_TITLE = 'Завантаження матеріалів';
export const PUBLICATIONS_LOADING_STATE_DESCRIPTION = 'Зачекайте, поки завершиться запит.';
export const PUBLICATIONS_ERROR_STATE_TITLE = 'Не вдалося завантажити матеріали';
export const PUBLICATIONS_ERROR_STATE_DESCRIPTION = 'Спробуйте оновити сторінку або повторити пізніше.';

export const PUBLICATIONS_TABS: ReadonlyArray<PublicationsTabConfig> = [
  { value: 'all', label: 'Всі', href: '/publications' },
  { value: 'events', label: 'Події', href: '/publications/events' },
  { value: 'news', label: 'Новини', href: '/publications/news' },
  { value: 'media', label: 'Ми у ЗМІ', href: '/publications/media' }
];

export const PUBLICATIONS_CREATE_OPTIONS: ReadonlyArray<PublicationsCreateOption> = [
  { id: 'event', label: 'Подію', href: '/publications/events/create' },
  { id: 'news', label: 'Новину', href: '/publications/news/create' },
  { id: 'media', label: 'Ми у ЗМІ', href: '/publications/media/create' }
];

const PUBLICATIONS_STATUS_FILTER_OPTIONS: ReadonlyArray<FilterOption> = [
  { value: 'draft', label: 'Чернетка' },
  { value: 'published', label: 'Опублікована' },
  { value: 'published_with_draft', label: 'Опублікована з чернеткою' }
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