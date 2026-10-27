export interface RequisitePdfFile {
  id: string;
  name: string;
  url: string;
  size?: number;
}

export interface RequisiteItem {
  id: string;
  currency: string;
  content: string;
  pdfFile?: RequisitePdfFile | null;
  order?: number;
}

export interface RequisitesData {
  items: RequisiteItem[];
}

export interface RequisitesDbRecord {
  _id: string;
  slug: 'requisites' | 'payment-details';
  items: RequisiteItem[];
  createdAt: string;
  updatedAt: string;
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
