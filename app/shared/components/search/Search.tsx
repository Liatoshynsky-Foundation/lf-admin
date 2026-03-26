'use client';

import {
  Autocomplete,
  Box,
  InputAdornment,
  ListItem,
  OutlinedInput,
  Typography
} from '@mui/material';
import Image from 'next/image';
import { useMemo } from 'react';

import { colors } from '~/shared/components/design-system/button/Button.styles';

export type SearchOption = {
  id: string;
  title: string;
};

type SearchProps = Readonly<{
  search: string;
  setSearch: (value: string) => void;
  options: SearchOption[];
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

export function Search({ search, setSearch, options }: SearchProps) {
  const selectedOption = useMemo(
    () => options.find((option) => option.title.toLowerCase() === search.toLowerCase()) ?? null,
    [options, search]
  );

  const filteredOptions = useMemo(() => filterAndSortOptions(options, search), [options, search]);

  return (
    <Autocomplete<SearchOption, false, false, true>
      freeSolo
      options={filteredOptions}
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
        const { key, ...rest } = props;

        return (
          <ListItem key={key} {...rest} sx={{ py: '8px' }}>
            <Typography variant="customMedium16">{option.title}</Typography>
          </ListItem>
        );
      }}
      sx={{
        width: '100%',
        maxWidth: '300px',
        '& .MuiAutocomplete-inputRoot[class*="MuiOutlinedInput-root"]': {
          paddingRight: '12px !important'
        }
      }}
      renderInput={(params) => (
        <OutlinedInput
          {...params.InputProps}
          inputProps={params.inputProps}
          placeholder="Пошук"
          fullWidth
          startAdornment={
            <InputAdornment position="start">
              <Image src="/icons/search-dark.svg" alt="search" width={24} height={24} />
            </InputAdornment>
          }
          endAdornment={
            search ? (
              <Box
                component="button"
                type="button"
                onClick={() => setSearch('')}
                sx={{
                  border: 'none',
                  background: 'transparent',
                  color: colors.blue[700],
                  cursor: 'pointer',
                  fontSize: '13px',
                  px: '4px'
                }}
              >
                ✕
              </Box>
            ) : null
          }
          sx={{
            borderRadius: '8px',
            height: '40px',
            bgcolor: colors.white,
            '& .MuiOutlinedInput-input::placeholder': {
              color: '#190D03',
              opacity: 1
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#ADAEBA'
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#8D8E99'
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#565656'
            }
          }}
        />
      )}
    />
  );
}
