import { FilterOption } from '~/shared/components/selector/FilterSelect';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export interface PdfEntry {
  name: string | null;
  fileName: string | null;
  url?: string | null;
  mimeType?: string | null;
}

export type ArchiveTabValue = 'all' | 'funds' | 'cases';

export const ARCHIVE_PAGE_TITLE = 'Архів';
export const ARCHIVE_BASE_PATH = '/archive';

export const ARCHIVE_TABS = [
  { value: 'all', label: 'Всі', href: ARCHIVE_BASE_PATH },
  { value: 'funds', label: 'Фонди', href: `${ARCHIVE_BASE_PATH}/funds` },
  { value: 'cases', label: 'Справи', href: `${ARCHIVE_BASE_PATH}/cases` },
];

export const ARCHIVE_STATUSES = [
  BaseContentStatuses.Hidden,
  BaseContentStatuses.Published,
] as const;

export const ARCHIVE_STATUS_FILTER_OPTIONS: ReadonlyArray<FilterOption> = [
  { value: BaseContentStatuses.Hidden, label: 'Приховано' },
  { value: BaseContentStatuses.Published, label: 'Опубліковано' },
];

export const ARCHIVE_CASE_MODAL_LABELS = {
  title: 'Нова справа',
  title_edit: 'Відредагувати справу',
  description: 'Опис',
  caseNumber: 'Справа',
  caseName: 'Назва справи',
  caseDate: 'Дати справи',
  sheets: 'Аркуші',
  caseDescriptions: 'Склад і зміст документів справи',
  file: 'Файл',
  addFile: 'Додати файл',
  invalidPdfError: 'Очікується PDF файл',
  maximumSizeError: 'Файл занадто великий', 
  mustBeNumber: 'Значення має бути числом',
  detailedCaseDescription: 'Детальний опис справи',
  caseDocuments: 'Документи справи',
  cancel: 'Скасувати',
  save: 'Зберегти',
} as const;

export const PDF_MIME_TYPE = 'application/pdf';
export const PDF_FILE_ACCEPT = 'application/pdf,.pdf';

export const INITIAL_PDF_ENTRY: PdfEntry = {
  name: null,
  fileName: null,
};

export const ARCHIVE_CREATE_PATH = `${ARCHIVE_BASE_PATH}/create`;

export const ARCHIVE_EMPTY_STATE_TITLE = 'Фондів ще немає.';
export const ARCHIVE_EMPTY_STATE_DESCRIPTION =
  'Натисніть «Додати фонд», щоб створити перший.';
export const ARCHIVE_EMPTY_STATE_NO_RESULTS_TITLE = 'Нічого не знайдено';
export const ARCHIVE_EMPTY_STATE_NO_RESULTS_DESCRIPTION = 'Спробуйте змінити параметри пошуку або фільтрів.';
export const ARCHIVE_EMPTY_STATE_NO_STATUS_MATCH_TITLE = 'Немає фондів із вибраним статусом';

export const ARCHIVE_FUNDS_TABLE_HEADERS = {
  fund: 'Фонд',
  name: 'Назва фонду',
  descr: 'Описи',
  cases: 'Справи',
  dates: 'Дати утворення',
  status: 'Статус',
} as const;