export type FilesTabValue = 'all' | 'image' | 'docs' | 'audio' | 'favorites';

export type FilesTabConfig = Readonly<{
  value: FilesTabValue;
  label: string;
  href: string;
  disabled?: boolean;
}>;

export const FILE_TABS: ReadonlyArray<FilesTabConfig> = [
  { value: 'all', label: 'Всі', href: '/files' },
  { value: 'image', label: 'Зображення', href: '/files/image' },
  { value: 'docs', label: 'DOCS', href: '/files/docs' },
  { value: 'audio', label: 'Аудіо', href: '/files/audio' },
  { value: 'favorites', label: 'Обрані', href: '/files/favorites' }
];

export const FILES_UPLOAD_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'application/pdf',
  'audio/mpeg',
  'audio/wav',
  'application/zip',
  'application/x-zip-compressed',
  'application/vnd.rar',
  'application/x-rar-compressed',
  'application/x-rar',
  'application/octet-stream',
  'application/x-compressed',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
] as const;

export const FILES_UPLOAD_ALLOWED_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'svg',
  'bmp',
  'pdf',
  'mp3',
  'wav',
  'zip',
  'rar',
  'docx',
  'xlsx'
] as const;

export const FILE_TYPES = {
  img: 'img',
  audio: 'audio',
  pdf: 'pdf',
  doc: 'doc',
  xls: 'xls',
  'video-file': 'video-file',
  archive: 'zip'
} as const;

export type FileType = keyof typeof FILE_TYPES;

export const FILES_UPLOAD_ACCEPT = [
  ...FILES_UPLOAD_ALLOWED_MIME_TYPES,
  ...FILES_UPLOAD_ALLOWED_EXTENSIONS.map((ext) => `.${ext}`)
].join(',');
export const FILES_PAGE_TITLE = 'Файли';
export const FILES_UPLOAD_BUTTON_LABEL = 'Завантажити файл';
export const FILES_UPLOAD_ERROR = 'Підтримуються зображення, PDF, аудіо, документи (Docx, Xlsx) та архіви (Zip, Rar)';
export const FILES_UPLOAD_READ_ERROR = 'Не вдалося прочитати файл для завантаження.';
export const FILES_UPLOAD_FAILED_ERROR = 'Не вдалося завантажити файл. Спробуйте ще раз.';
export const FILES_UNKNOWN_SECTION_LABEL = 'Невідомий розділ';
export const FILES_LOADING_STATE_TITLE = 'Завантаження файлів';
export const FILES_LOADING_STATE_DESCRIPTION = 'Зачекайте, поки завершиться запит.';
export const FILES_ERROR_STATE_TITLE = 'Не вдалося завантажити файли';
export const FILES_ERROR_STATE_DESCRIPTION = 'Спробуйте оновити сторінку або повторити пізніше.';
export const FILES_EMPTY_STATE_TITLE = 'Файли відсутні';
export const FILES_EMPTY_STATE_DESCRIPTION = 'Файли для цієї вкладки поки відсутні.';
export const FILES_EMPTY_STATE_NO_RESULTS_TITLE = 'Результатів немає';
export const FILES_EMPTY_STATE_NO_RESULTS_DESCRIPTION =
  'За цими критеріями нічого не знайдено.\nСпробуйте змінити параметри фільтрів або пошуку.';
export const FILES_FAVORITES_EMPTY_STATE_TITLE = 'Немає обраних файлів';
export const FILES_FAVORITES_EMPTY_STATE_DESCRIPTION =
  'Позначайте важливі файли зірочкою, щоб мати до них швидкий доступ тут.';
export const FILES_FAVORITES_EMPTY_STATE_BUTTON = 'Переглянути всі файли';

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

