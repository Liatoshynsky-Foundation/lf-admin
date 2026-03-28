export type ArchiveSortValue = 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc';
export type SortFieldValue = 'date' | 'name';

export const SORT_OPTIONS: ReadonlyArray<{ value: ArchiveSortValue; label: string }> = [
  { value: 'date_desc', label: 'Нові спочатку' },
  { value: 'date_asc', label: 'Старі спочатку' },
  { value: 'name_asc', label: 'А→Я' },
  { value: 'name_desc', label: 'Я→А' }
];

export const ALL_FORMAT_FILTER_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'jpg', label: 'jpg' },
  { value: 'png', label: 'png' },
  { value: 'gif', label: 'gif' },
  { value: 'webp', label: 'webp' },
  { value: 'svg+xml', label: 'svg+xml' },
  { value: 'pdf', label: 'pdf' },
  { value: 'msword', label: 'doc' },
  { value: 'vnd.openxmlformats-officedocument.wordprocessingml.document', label: 'docx' },
  { value: 'vnd.ms-excel', label: 'xls' },
  { value: 'vnd.openxmlformats-officedocument.spreadsheetml.sheet', label: 'xlsx' },
  { value: 'mp4', label: 'mp4' },
  { value: 'mpeg', label: 'mpeg' },
  { value: 'wav', label: 'wav' },
  { value: 'mp3', label: 'mp3' }
];

export const VISIBLE_FORMAT_FILTER_VALUES = new Set<string>(['jpg', 'png', 'gif', 'webp', 'svg+xml']);
export const FORMAT_FILTER_OPTIONS = ALL_FORMAT_FILTER_OPTIONS.filter((option) =>
  VISIBLE_FORMAT_FILTER_VALUES.has(option.value)
);

export const USAGE_FILTER_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'main_pages', label: 'Основні сторінки' },
  { value: 'news_media', label: 'Новини / медіа' },
  { value: 'events', label: 'Події' },
  { value: 'creativity', label: 'Творчість' },
  { value: 'opus', label: 'Опуси' },
  { value: 'archive', label: 'Архів' },
  { value: 'research', label: 'Наукові праці' },
  { value: 'unused', label: 'Не використані' }
];

export const SORT_FIELD_OPTIONS: ReadonlyArray<{ value: SortFieldValue; label: string }> = [
  { value: 'date', label: 'Дата додавання' },
  { value: 'name', label: 'Назва файлу' }
];

export const SORT_ORDER_OPTIONS: Readonly<
  Record<SortFieldValue, ReadonlyArray<{ value: ArchiveSortValue; label: string }>>
> = {
  date: [
    { value: 'date_desc', label: 'Новіші-старіші' },
    { value: 'date_asc', label: 'Старіші-новіші' }
  ],
  name: [
    { value: 'name_asc', label: 'А-Я' },
    { value: 'name_desc', label: 'Я-А' }
  ]
};
