'use client';

import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import { Plus } from 'lucide-react';
import { useMemo } from 'react';

import { styles } from './CompositionTitleInput.styles';
import { COMPOSITION_SEARCH_LABELS } from '~/constants/opus';
import { useDebounce } from '~/shared/hooks/use-debounce/useDebounce';
import { useSearchCompositions } from '~/shared/hooks/use-opuses/useOpuses';
import type { OpusCompositionSuggestion } from '~/types/opus';

const CREATE_OPTION_ID = '__create_new__';
const MIN_SEARCH_LENGTH = 2;

interface CompositionOption {
  id: string;
  title: string;
  isCreate: boolean;
  suggestion?: OpusCompositionSuggestion;
}

interface CompositionTitleInputProps {
  value: string;
  onChangeText: (title: string) => void;
  onSelectSuggestion: (suggestion: OpusCompositionSuggestion) => void;
  onCreateNew: () => void;
}

export default function CompositionTitleInput({
  value,
  onChangeText,
  onSelectSuggestion,
  onCreateNew
}: Readonly<CompositionTitleInputProps>) {
  const debouncedSearch = useDebounce(value.trim(), 300);

  const { data } = useSearchCompositions(debouncedSearch, { skip: debouncedSearch.length < MIN_SEARCH_LENGTH });

  const options = useMemo<CompositionOption[]>(() => {
    const suggestions = (data?.searchCompositions ?? []).map((suggestion, index) => ({
      id: `suggestion-${index}-${suggestion.id}`,
      title: suggestion.title?.uk ?? suggestion.title?.en ?? '',
      isCreate: false,
      suggestion
    }));

    return [...suggestions, { id: CREATE_OPTION_ID, title: COMPOSITION_SEARCH_LABELS.createNew, isCreate: true }];
  }, [data]);

  return (
    <Autocomplete<CompositionOption, false, false, true>
      freeSolo
      fullWidth
      value={null}
      inputValue={value}
      options={options}
      filterOptions={(currentOptions) => currentOptions}
      noOptionsText={COMPOSITION_SEARCH_LABELS.noOptions}
      getOptionLabel={(option) => (typeof option === 'string' ? option : option.title)}
      onInputChange={(_, nextInput, reason) => {
        if (reason === 'input' || reason === 'clear') {
          onChangeText(nextInput);
        }
      }}
      onChange={(_, selected) => {
        if (!selected || typeof selected === 'string') {
          return;
        }

        if (selected.isCreate) {
          onCreateNew();

          return;
        }

        if (selected.suggestion) {
          onSelectSuggestion(selected.suggestion);
        }
      }}
      renderOption={(props, option) => {
        const { key: _key, ...rest } = props;

        return (
          <Box
            component="li"
            key={option.id}
            {...rest}
            sx={option.isCreate ? styles.createOption : styles.option}
          >
            {option.isCreate && <Plus size={18} strokeWidth={1.75} />}
            <Typography sx={styles.optionText}>{option.title}</Typography>
          </Box>
        );
      }}
      renderInput={(params) => <TextField {...params} size="small" sx={styles.input} />}
    />
  );
}
