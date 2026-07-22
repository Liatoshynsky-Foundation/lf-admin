import { BaseContentStatuses } from '~/types/enums/common.enums';

export const RESEARCH_PAGE_TITLE = 'Дослідження та наукові праці';
export const RESEARCH_BASE_PATH = '/research';
export const RESEARCH_CREATE_PATH = `${RESEARCH_BASE_PATH}/create`;

export const RESEARCH_EMPTY_STATE_TITLE = 'Наукових робіт ще немає.';
export const RESEARCH_EMPTY_STATE_DESCRIPTION =
  'Наукових робіт ще немає. Натисніть «Додати роботу», щоб створити перший запис.';
export const RESEARCH_EMPTY_STATE_NO_RESULTS_TITLE = 'Нічого не знайдено';
export const RESEARCH_EMPTY_STATE_NO_RESULTS_DESCRIPTION = 'Спробуйте змінити параметри пошуку або фільтрів.';

export const SORT_STORAGE_KEY = 'research_works_sort';

export const RESEARCH_STATUS_OPTIONS = [
  { value: BaseContentStatuses.Published, label: 'Опубліковано' },
  { value: BaseContentStatuses.Hidden, label: 'Приховано' }
] as const;