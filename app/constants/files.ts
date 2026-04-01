export type FilesTabValue = 'all' | 'image' | 'docs' | 'audio' | 'favorites';
export type FilesSortValue = 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc';
export type SortFieldValue = 'date' | 'name';

export const FILE_TABS: ReadonlyArray<{ value: FilesTabValue; label: string; disabled?: boolean }> = [
  { value: 'all', label: 'Всі' },
  { value: 'image', label: 'Зображення' },
  { value: 'docs', label: 'DOCS', disabled: true },
  { value: 'audio', label: 'Аудіо' },
  { value: 'favorites', label: 'Обрані' }
];

export const FILES_UPLOAD_ACCEPT = 'image/jpeg,image/jpg,image/png,application/pdf,audio/mpeg,audio/wav';
export const FILES_UPLOAD_ERROR = 'Підтримуються зображення, PDF та аудіо';

export const SORT_OPTIONS: ReadonlyArray<{ value: FilesSortValue; label: string }> = [
  { value: 'date_desc', label: 'Нові спочатку' },
  { value: 'date_asc', label: 'Старі спочатку' },
  { value: 'name_asc', label: 'А→Я' },
  { value: 'name_desc', label: 'Я→А' }
];

export const USAGE_FILTER_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'main_pages', label: 'Основні сторінки' },
  { value: 'news_media', label: 'Новини / медіа' },
  { value: 'events', label: 'Події' },
  { value: 'creativity', label: 'Творчість' },
  { value: 'opus', label: 'Опуси' },
  { value: 'files', label: 'Файли' },
  { value: 'research', label: 'Наукові праці' },
  { value: 'unused', label: 'Не використані' }
];

export const SORT_FIELD_OPTIONS: ReadonlyArray<{ value: SortFieldValue; label: string }> = [
  { value: 'date', label: 'Дата додавання' },
  { value: 'name', label: 'Назва файлу' }
];

export const SORT_ORDER_OPTIONS: Readonly<
  Record<SortFieldValue, ReadonlyArray<{ value: FilesSortValue; label: string }>>
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