'use client';

import { Autocomplete, Box, InputAdornment, ListItem, OutlinedInput, Typography } from '@mui/material';
import Image from 'next/image';
import { useMemo } from 'react';

import { styles } from './Search.styles';

export type SearchOption = {
  id: string;
  title: string;
};

export type SearchProps = Readonly<{
  onEnter?: () => void;
  search: string;
  setSearch: (value: string) => void;
  options: SearchOption[];
  placeholder?: string;
  maxWidth?: number | string;
  noOptionsText?: string;
  clearButtonAriaLabel?: string;
}>;

const filterAndSortOptions = (list: SearchOption[], inputValue: string): SearchOption[] => {
  const trimmedInput = inputValue.trim().toLowerCase();
  if (!trimmedInput) {
    return list;
  }

  const words = trimmedInput.split(/\s+/).filter(Boolean);

  const filtered = list.filter((option) => {
    const label = option.title.toLowerCase();
    return words.every((word) => label.includes(word));
  });

  return filtered.sort((a, b) => {
    const aLabel = a.title.toLowerCase();
    const bLabel = b.title.toLowerCase();

    if (aLabel === trimmedInput) return -1;
    if (bLabel === trimmedInput) return 1;

    if (aLabel.startsWith(trimmedInput) && !bLabel.startsWith(trimmedInput)) return -1;
    if (!aLabel.startsWith(trimmedInput) && bLabel.startsWith(trimmedInput)) return 1;

    const aIndex = aLabel.indexOf(trimmedInput);
    const bIndex = bLabel.indexOf(trimmedInput);

    if (aIndex !== bIndex) return aIndex - bIndex;

    return aLabel.localeCompare(bLabel, ['uk', 'en'], {
      sensitivity: 'base',
      numeric: true
    });
  });
};

export function Search({
  onEnter,
  search,
  setSearch,
  options,
  placeholder = 'Пошук',
  maxWidth = '300px',
  noOptionsText = 'Нічого не знайдено',
  clearButtonAriaLabel = 'Очистити пошук'
}: SearchProps) {
  const selectedOption = useMemo(
    () => options.find((option) => option.title.toLowerCase() === search.toLowerCase()) ?? null,
    [options, search]
  );

  const filteredOptions = useMemo(() => filterAndSortOptions(options, search), [options, search]);

  return (
    <Autocomplete<SearchOption, false, false, true>
      freeSolo
      options={filteredOptions}
      noOptionsText={noOptionsText}
      value={selectedOption}
      inputValue={search}
      onInputChange={(_, value) => setSearch(value)}
      onChange={(_, value) => {
        if (typeof value === 'string') {
          setSearch(value);
          return;
        }

        setSearch(value?.title ?? '');
      }}
      getOptionLabel={(option) => (typeof option === 'string' ? option : option.title)}
      isOptionEqualToValue={(left, right) => left.id === right.id}
      filterOptions={(list) => list}
      renderOption={(props, option) => {
        const { key: _key, ...rest } = props;

        return (
          <ListItem key={option.id} {...rest} sx={styles.listItem}>
            <Typography variant="textMd">{option.title}</Typography>
          </ListItem>
        );
      }}
      sx={styles.autocomplete(maxWidth)}
      renderInput={(params) => (
        <OutlinedInput
          {...params.InputProps}
          inputProps={params.inputProps}
          placeholder={placeholder}
          fullWidth
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onEnter?.();
            }
          }}
          startAdornment={
            <InputAdornment
              position="start"
              sx={styles.startAdornment}
            >
              <Image src="/icons/search-dark.svg" alt="search" width={24} height={24} />
            </InputAdornment>
          }
          endAdornment={
            search ? (
              <Box
                component="button"
                type="button"
                aria-label={clearButtonAriaLabel}
                onClick={() => setSearch('')}
                sx={styles.clearButton}
              >
                ✕
              </Box>
            ) : null
          }
          sx={styles.input}
        />
      )}
    />
  );
}
