import { BaseContentStatuses } from '~/types/enums/common.enums';

export type CaseStatus = BaseContentStatuses;

export type CaseListItem = {
  id: string;
  fundId: string;
  descriptionNumber: number;
  caseNumber: number;
  caseName: string;
  status: CaseStatus;
  updatedAt: string;
};

export const CASE_VALIDATION_MESSAGES = {
  fundIdRequired: 'Фонд є обов’язковим.',
  fundIdNotFound: 'Вказаний фонд не знайдено.',

  descriptionNumberRequired: 'Номер опису є обов’язковим.',
  descriptionNumberInvalid: 'Номер опису має бути цілим позитивним числом.',

  caseNumberRequired: 'Номер справи є обов’язковим.',
  caseNumberInvalid: 'Номер справи має бути цілим позитивним числом.',

  caseNameRequired: 'Назва справи є обов’язковою.',
  caseNameMaxLength: 'Назва справи не може перевищувати 150 символів.',

  caseDateRequired: 'Дати справи є обов’язковими.',
  caseDateMaxLength: 'Значення не може перевищувати 150 символів.',

  sheetsNumberRequired: 'Кількість аркушів є обов’язковою.',
  sheetsNumberInvalid: 'Кількість аркушів має бути цілим позитивним числом.',

  caseDescriptionsRequired: 'Поле «Склад і зміст документів справи» є обов’язковим.',
  caseDescriptionsMaxLength: 'Значення не може перевищувати 300 символів.',

  detailedCaseDescriptionMaxLength: 'Опис не може перевищувати 1000 символів.',

  pdfInvalidType: 'Можна прикріпити лише PDF-файл.',

  duplicateNumbers: 'Справа з таким номером опису та номером справи вже існує в цьому фонді. Змініть один із номерів.'
} as const;

export const CASES_LOADING_STATE_TITLE = 'Завантаження справ';
export const CASES_LOADING_STATE_DESCRIPTION = 'Зачекайте, поки завершиться запит.';
export const CASES_ERROR_STATE_TITLE = 'Не вдалося завантажити справи';
export const CASES_ERROR_STATE_DESCRIPTION = 'Спробуйте оновити сторінку або повторити пізніше.';
export const CASES_EMPTY_STATE_NO_RESULTS_TITLE = 'Результатів немає';
export const CASES_EMPTY_STATE_NO_RESULTS_DESCRIPTION =
  'За цими критеріями нічого не знайдено.\nСпробуйте змінити параметри фільтрів або пошуку.';
export const CASES_EMPTY_STATE_TITLE = 'Справи відсутні';
export const CASES_EMPTY_STATE_DESCRIPTION = 'Матеріали для цієї вкладки поки відсутні.';
