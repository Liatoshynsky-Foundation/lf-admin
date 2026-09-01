import { BaseContentStatuses } from '~/types/enums/common.enums';

export type FundStatus = BaseContentStatuses;

export type Fund = {
  id: string;
  fundNumber: number;
  name: string;
  descriptions: number;
  cases: number;
  dates: string;
  status: FundStatus;
  updatedAt: string;
};

export const FUND_VALIDATION_MESSAGES = {
  numberRequired: 'Номер фонду є обов’язковим.',
  numberInvalid: 'Номер фонду має бути цілим позитивним числом.',
  nameRequired: 'Назва фонду є обов’язковою. Назва фонду повинна мати мінімум одну літеру',
  nameMaxLength: 'Назва не може перевищувати 40 символів.',
  documentCreationDateRequired: 'Дати утворення документів є обов’язковими. Дати утворення документів повинні мати мінімум одну літеру',
  documentCreationDateMaxLength: 'Значення не може перевищувати 150 символів.',
  chronologicalBoundariesMaxLength: 'Значення не може перевищувати 150 символів.',
  organizationFormMaxLength: 'Значення не може перевищувати 150 символів.',
  descriptionMaxLength: 'Опис не може перевищувати 1000 символів.'
} as const;

export const FUNDS_LOADING_STATE_TITLE = 'Завантаження фондів';
export const FUNDS_LOADING_STATE_DESCRIPTION = 'Зачекайте, поки завершиться запит.';
export const FUNDS_ERROR_STATE_TITLE = 'Не вдалося завантажити фонди';
export const FUNDS_ERROR_STATE_DESCRIPTION = 'Спробуйте оновити сторінку або повторити пізніше.';
export const FUNDS_EMPTY_STATE_NO_RESULTS_TITLE = 'Результатів немає';
export const FUNDS_EMPTY_STATE_NO_RESULTS_DESCRIPTION =
  'За цими критеріями нічого не знайдено.\nСпробуйте змінити параметри фільтрів або пошуку.';
export const FUNDS_EMPTY_STATE_TITLE = 'Фонди відсутні';
export const FUNDS_EMPTY_STATE_DESCRIPTION = 'Матеріали для цієї вкладки поки відсутні.';
export const FUND_PUBLISH_SUCCESS_MESSAGE = 'Фонд опубліковано.';
export const FUND_PUBLISH_EMPTY_WARNING_MESSAGE =
  'Фонд не містить опублікованих справ. Ви можете опублікувати фонд зараз і додати справи пізніше.';
