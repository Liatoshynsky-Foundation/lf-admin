export type FilesTabValue = 'all' | 'image' | 'docs' | 'audio' | 'favorites';
export type FilesSortValue = 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc';
export type SortFieldValue = 'date' | 'name';

export type FilesTabConfig = Readonly<{
  value: FilesTabValue;
  label: string;
  href: string;
  disabled?: boolean;
}>;

export const FILE_TABS: ReadonlyArray<FilesTabConfig> = [
  { value: 'all', label: 'Всі', href: '/files' },
  { value: 'image', label: 'Зображення', href: '/files/image' },
  { value: 'docs', label: 'DOCS', href: '/files/docs', disabled: true },
  { value: 'audio', label: 'Аудіо', href: '/files/audio' },
  { value: 'favorites', label: 'Обрані', href: '/files/favorites' }
];

export const FILES_UPLOAD_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
  'audio/mpeg',
  'audio/wav'
] as const;

export const FILES_UPLOAD_ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf', 'mp3', 'wav'] as const;

export const FILES_UPLOAD_ACCEPT = FILES_UPLOAD_ALLOWED_MIME_TYPES.join(',');
export const FILES_PAGE_TITLE = 'Файли';
export const FILES_UPLOAD_BUTTON_LABEL = 'Завантажити файл';
export const FILES_UPLOAD_ERROR = 'Підтримуються зображення, PDF та аудіо';
export const FILES_UPLOAD_READ_ERROR = 'Не вдалося прочитати файл для завантаження.';
export const FILES_UPLOAD_FAILED_ERROR = 'Не вдалося завантажити файл. Спробуйте ще раз.';
export const FILES_UNKNOWN_SECTION_LABEL = 'Невідомий розділ';
export const FILES_LOADING_STATE_TEXT = 'Завантаження файлів…';
export const FILES_ERROR_STATE_TEXT = 'Не вдалося завантажити файли.';

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

