import type { JSONContent } from '@tiptap/react';

import type {
  PaymentDetails,
  PaymentDetailsPdfFile,
  PaymentDetailsTab as DomainPaymentDetailsTab
} from '~/domain/entities/PaymentDetails';
import type { UpdatePaymentDetailsInput } from '~/domain/repositories/PaymentDetailsRepository';

export type PaymentDetailsTab = DomainPaymentDetailsTab & {
  pdfFile?: PaymentDetailsPdfFile | null;
};

export type {
  JSONContent,
  PaymentDetails,
  PaymentDetailsPdfFile,
  UpdatePaymentDetailsInput
};

export type RequisiteItem = PaymentDetailsTab;
export type RequisitePdfFile = PaymentDetailsPdfFile;

export interface RequisitesData {
  items: PaymentDetailsTab[];
}

export const REQUISITES_MESSAGES = {
  PAGE_TITLE: 'Реквізити',
  BLOCK_TITLE: 'Реквізити',
  SAVE_BUTTON: 'Зберегти',
  ADD_REQUISITES: 'Додати реквізити',
  CONTENT_LABEL: 'Текст реквізитів',
  CONTENT_PLACEHOLDER: 'Введіть текст реквізитів...',
  PDF_SECTION_LABEL: 'PDF файл',
  ADD_FILE_BUTTON: 'Додати файл',
  EDIT_TITLE_MENU: 'Редагувати назву',
  DELETE_REQUISITE_MENU: 'Видалити реквізит',
  SAVE_SUCCESS: 'Реквізити успішно збережено',
  DELETE_CONFIRMATION: 'Видалити цю вкладку реквізитів?',
  DEFAULT_NEW_CURRENCY: 'Без назви'
} as const;
