export type FilesSortValue = 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc';
export type SortFieldValue = 'date' | 'name';

export const SORT_OPTIONS: ReadonlyArray<{ value: FilesSortValue; label: string }> = [
  { value: 'date_desc', label: 'Нові спочатку' },
  { value: 'date_asc', label: 'Старі спочатку' },
  { value: 'name_asc', label: 'А→Я' },
  { value: 'name_desc', label: 'Я→А' }
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