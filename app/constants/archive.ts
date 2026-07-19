import { JSONContent } from '@tiptap/react';

import { FilterOption } from '~/shared/components/selector/FilterSelect';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export interface PdfEntry {
  name: string | null;
  fileName: string | null;
}

export type ArchiveTabValue = 'all' | 'fonds' | 'cases';

export const ARCHIVE_PAGE_TITLE = 'Архів';
export const ARCHIVE_BASE_PATH = '/archive';

export const ARCHIVE_TABS = [
  { value: 'all', label: 'Всі', href: ARCHIVE_BASE_PATH },
  { value: 'fonds', label: 'Фонди', href: `${ARCHIVE_BASE_PATH}/fonds` },
  { value: 'cases', label: 'Справи', href: `${ARCHIVE_BASE_PATH}/cases` },
];

export const ARCHIVE_STATUSES = [
  BaseContentStatuses.Hidden,
  BaseContentStatuses.Published,
] as const;

export const ARCHIVE_STATUS_FILTER_OPTIONS: ReadonlyArray<FilterOption> = [
  { value: 'all', label: 'Усі' },
  { value: BaseContentStatuses.Hidden, label: 'Приховано' },
  { value: BaseContentStatuses.Published, label: 'Опубліковано' },
];

export const ARCHIVE_CASE_MODAL_LABELS = {
  title: 'Нова справа',
  description: 'Опис',
  caseNumber: 'Справа',
  caseName: 'Назва справи',
  caseDates: 'Дати справи',
  sheets: 'Аркуші',
  documentsComposition: 'Склад і зміст документів справи',
  file: 'Файл',
  addFile: 'Додати файл',
  invalidPdfError: 'Очікується PDF файл',
  maximumSizeError: 'Файл занадто великий', 
  mustBeNumber: 'Значення має бути числом',
  detailedDescription: 'Детальний опис справи',
  documents: 'Документи справи',
  cancel: 'Скасувати',
  save: 'Зберегти',
} as const;

export const PDF_MIME_TYPE = 'application/pdf';
export const PDF_FILE_ACCEPT = 'application/pdf,.pdf';

export const INITIAL_PDF_ENTRY: PdfEntry = {
  name: null,
  fileName: null,
};

export const INITIAL_DETAILED_CASE_DESCRIPTION: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: '',
        },
      ],
    },
  ],
};