import { BaseContentStatuses } from '~/types/enums/common.enums';

export const RESEARCH_PAGE_TITLE = 'Дослідження та наукові праці';

export const RESEARCH_MODAL_TITLE = 'Деталі роботи';

export const RESEARCH_EMPTY_STATE_TITLE = 'Наукових робіт ще немає';
export const RESEARCH_EMPTY_STATE_DESCRIPTION = 'Натисніть «Додати роботу», щоб створити перший запис.';
export const RESEARCH_EMPTY_STATE_NO_RESULTS_TITLE = 'За вашим запитом нічого не знайдено.';
export const RESEARCH_EMPTY_STATE_NO_STATUS_RESULTS_TITLE = 'Немає робіт із вибраним статусом.';
export const RESEARCH_LOADING_STATE_TITLE = 'Завантаження наукових робіт';
export const RESEARCH_LOADING_STATE_DESCRIPTION = 'Зачекайте, поки завершиться запит.';
export const RESEARCH_ERROR_STATE_TITLE = 'Не вдалося завантажити наукові роботи';
export const RESEARCH_ERROR_STATE_DESCRIPTION = 'Спробуйте оновити сторінку або повторити пізніше.';

export const RESEARCH_STATUS_OPTIONS = [
  { value: BaseContentStatuses.Published, label: 'Опубліковано' },
  { value: BaseContentStatuses.Hidden, label: 'Приховано' }
] as const;

export const RESEARCH_ITEMS_PER_PAGE = 8;

export const RESEARCH_FIELD_LIMITS = {
  bibliographicDescription: 250,
  author: 150,
  year: 150,
  keywords: 250
} as const;

export const RESEARCH_VALIDATION_MESSAGES = {
  bibliographicDescriptionRequired: 'Бібліографічний опис є обов’язковим.',
  bibliographicDescriptionMaxLength: 'Бібліографічний опис не може перевищувати 250 символів.',

  authorRequired: 'Автор є обов’язковим.',
  authorMaxLength: 'Значення не може перевищувати 150 символів.',

  yearRequired: 'Дати справи є обов’язковими.',
  yearMaxLength: 'Значення не може перевищувати 150 символів.',

  keywordsMaxLength: 'Ключові слова не можуть перевищувати 250 символів.',

  urlInvalid: 'Введіть коректне посилання.',

  pdfInvalidType: 'Можна прикріпити лише PDF-файл.'
} as const;

export const RESEARCH_MUTATION_RESULTS = {
  created: 'Роботу збережено.',
  updated: 'Зміни збережено.',
  deleted: 'Роботу видалено.',
  published: 'Роботу опубліковано.',
  hidden: 'Роботу приховано.',
  createFailed: 'Не вдалося зберегти роботу. Перевірте форму та спробуйте ще раз.',
  updateFailed: 'Не вдалося зберегти зміни. Перевірте форму та спробуйте ще раз.',
  deleteFailed: 'Не вдалося видалити роботу. Спробуйте ще раз.',
  publishFailed: 'Не вдалося опублікувати роботу. Спробуйте ще раз.',
  hideFailed: 'Не вдалося приховати роботу. Спробуйте ще раз.',
  uploadFailed: 'Не вдалося завантажити PDF-файл'
} as const;

export const RESEARCH_DELETE_CONFIRM = {
  title: (bibliographicDescription: string) =>
    `Видалити роботу «${bibliographicDescription}»? Цю дію неможливо скасувати.`,
  confirm: 'Видалити',
  cancel: 'Скасувати'
} as const;

export const RESEARCH_MENU_ACTIONS = {
  edit: 'Редагувати',
  publish: 'Опублікувати',
  hide: 'Приховати',
  delete: 'Видалити',
  share: 'Поширити'
} as const;

export const RESEARCH_WORK_NOT_FOUND = 'Роботу не знайдено';
export const RESEARCH_WORK_LOAD_FAILED =
  'Не вдалося завантажити роботу. Оновіть сторінку або спробуйте ще раз.';

export const RESEARCH_WORK_ID_PARAM = 'research-work-id';
export const RESEARCH_BASE_PATH = '/research';

export const RESEARCH_URL_PLACEHOLDER = 'https://example.com';

export const RESEARCH_UPLOAD_DIRECTORY = 'research-works';
