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
  descriptionNumberNegative: 'Введіть ціле позитивне число.',
  descriptionNumberNotNumber: 'Значення має бути числом.',

  caseNumberRequired: 'Номер справи є обов’язковим.',
  caseNumberInvalid: 'Номер справи має бути цілим позитивним числом.',
  caseNumberNegative: 'Введіть ціле позитивне число.',
  caseNumberNotNumber: 'Значення має бути числом.',

  caseNameRequired: 'Назва справи є обов’язковою.',
  caseNameMaxLength: 'Назва справи не може перевищувати 150 символів.',

  caseDateRequired: 'Дати справи є обов’язковими.',
  caseDateMaxLength: 'Значення не може перевищувати 150 символів.',

  sheetsNumberRequired: 'Кількість аркушів є обов’язковою.',
  sheetsNumberInvalid: 'Кількість аркушів має бути цілим позитивним числом.',
  sheetsNumberNegative: 'Введіть ціле позитивне число.',
  sheetsNumberNotNumber: 'Значення має бути числом.',

  caseDescriptionsRequired: 'Поле «Склад і зміст документів справи» є обов’язковим.',
  caseDescriptionsMaxLength: 'Значення не може перевищувати 300 символів.',

  detailedCaseDescriptionMaxLength: 'Опис не може перевищувати 1000 символів.',

  pdfInvalidType: 'Можна прикріпити лише PDF-файл.',

  duplicateNumbers: 'Справа з таким номером опису та номером справи вже існує в цьому фонді. Змініть один із номерів.'
} as const;
