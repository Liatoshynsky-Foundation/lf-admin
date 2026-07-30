import { BaseContentStatuses } from '~/types/enums/common.enums';

export type FondStatus = BaseContentStatuses;

export type Fond = {
  id: string;
  fondNumber: number;
  name: string;
  descriptions: number;
  cases: number;
  dates: string;
  status: FondStatus;
  updatedAt: string;
};

export const FOND_VALIDATION_MESSAGES = {
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