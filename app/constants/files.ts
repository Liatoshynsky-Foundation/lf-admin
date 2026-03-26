export type FilesTabValue = 'all' | 'image' | 'pdf' | 'audio' | 'favorites';

export const FILE_TABS: ReadonlyArray<{ value: FilesTabValue; label: string }> = [
  { value: 'all', label: 'Всі' },
  { value: 'image', label: 'Зображення' },
  { value: 'pdf', label: 'PDF' },
  { value: 'audio', label: 'Аудіо' },
  { value: 'favorites', label: 'Обрані' }
];

export const FILES_UPLOAD_ACCEPT = 'image/jpeg,image/jpg,image/png,application/pdf,audio/mpeg,audio/wav';
export const FILES_UPLOAD_ERROR = 'Підтримуються зображення, PDF та аудіо';