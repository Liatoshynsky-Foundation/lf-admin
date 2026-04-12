export const ALL_FORMAT_FILTER_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'jpg', label: 'jpg' },
  { value: 'png', label: 'png' },
  { value: 'bmp', label: 'bmp' },
  { value: 'gif', label: 'gif' },
  { value: 'webp', label: 'webp' },
  { value: 'svg', label: 'svg' },
  { value: 'pdf', label: 'pdf' },
  { value: 'msword', label: 'doc' },
  { value: 'vnd.openxmlformats-officedocument.wordprocessingml.document', label: 'docx' },
  { value: 'vnd.ms-excel', label: 'xls' },
  { value: 'vnd.openxmlformats-officedocument.spreadsheetml.sheet', label: 'xlsx' },
  { value: 'mp4', label: 'mp4' },
  { value: 'mpeg', label: 'mpeg' },
  { value: 'wav', label: 'wav' },
  { value: 'mp3', label: 'mp3' },
  { value: 'zip', label: 'zip' },
  { value: 'x-zip-compressed', label: 'zip' }
];

export const VISIBLE_FORMAT_FILTER_VALUES = new Set<string>(['jpg', 'png', 'bmp', 'gif', 'webp', 'svg']);
export const FORMAT_FILTER_OPTIONS = ALL_FORMAT_FILTER_OPTIONS.filter((option) =>
  VISIBLE_FORMAT_FILTER_VALUES.has(option.value)
);
