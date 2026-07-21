'use client';

import { useCallback, useEffect, useState } from 'react';

import { type FilesSortValue, SORT_OPTIONS, type SortFieldValue } from '~/constants/sort';

const VALID_SORT_VALUES: ReadonlySet<string> = new Set(['date_desc', 'date_asc', 'name_asc', 'name_desc']);
const isFilesSortValue = (value: string): value is FilesSortValue => VALID_SORT_VALUES.has(value);

export function useSortValue(storageKey: string) {
  const [sortValue, setSortValue] = useState<FilesSortValue>('date_desc');

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved && isFilesSortValue(saved)) {
      setSortValue(saved);
    }
  }, [storageKey]);

  const currentSortField: SortFieldValue = sortValue.startsWith('date') ? 'date' : 'name';
  const currentSortOption = SORT_OPTIONS.find((option) => option.value === sortValue) ?? SORT_OPTIONS[0];

  const handleSortFieldChange = useCallback(
    (field: SortFieldValue) => {
      setSortValue((previous) => {
        const isDate = field === 'date';
        const prefix = isDate ? 'date' : 'name';
        const defaultSort: FilesSortValue = isDate ? 'date_desc' : 'name_asc';
        const nextValue: FilesSortValue = previous.startsWith(prefix) ? (previous as FilesSortValue) : defaultSort;
        localStorage.setItem(storageKey, nextValue);
        return nextValue;
      });
    },
    [storageKey]
  );

  const handleSortValueChange = useCallback(
    (nextValue: FilesSortValue) => {
      setSortValue(nextValue);
      localStorage.setItem(storageKey, nextValue);
    },
    [storageKey]
  );

  return { sortValue, currentSortField, currentSortOption, handleSortFieldChange, handleSortValueChange };
}