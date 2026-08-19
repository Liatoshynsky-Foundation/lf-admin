'use client';

import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { styles } from './CompositionTitleInput.styles';
import { COMPOSITION_SEARCH_LABELS } from '~/constants/opus';
import { useDebounce } from '~/shared/hooks/use-debounce/useDebounce';
import { useSearchCompositions } from '~/shared/hooks/use-opuses/useOpuses';
import type { OpusCompositionSuggestion } from '~/types/opus';

const CREATE_OPTION_ID = '__create_new__';
const NO_RESULTS_OPTION_ID = '__no_results__';

interface CompositionOption {
  id: string;
  title: string;
  isCreate: boolean;
  isNoResults?: boolean;
  suggestion?: OpusCompositionSuggestion;
}

export interface CompositionTitleInputProps {
  value: string;
  error?: boolean;
  helperMessage?: string;
  excludedSuggestionIds?: string[];
  onChangeText: (title: string) => void;
  onSelectSuggestion: (suggestion: OpusCompositionSuggestion) => void;
  onCreateNew: () => void;
}

export default function CompositionTitleInput({
  value,
  error = false,
  helperMessage,
  excludedSuggestionIds = [],
  onChangeText,
  onSelectSuggestion,
  onCreateNew
}: Readonly<CompositionTitleInputProps>) {
  const [open, setOpen] = useState(false);

  const debouncedSearch = useDebounce(value.trim(), 300);
  const { data, loading } = useSearchCompositions(debouncedSearch);
  const suggestions = useMemo(() => {
    const excludedIds = new Set(excludedSuggestionIds);

    return (data?.searchCompositions ?? []).filter((suggestion) => !suggestion.id || !excludedIds.has(suggestion.id));
  }, [data, excludedSuggestionIds]);

  const options = useMemo<CompositionOption[]>(() => {
    const suggestionOptions = suggestions.map((suggestion, index) => ({
      id: `suggestion-${index}-${suggestion.id}`,
      title: suggestion.name?.uk ?? suggestion.name?.en ?? '',
      isCreate: false,
      suggestion
    }));

    const noResultsOption: CompositionOption[] =
      !loading && suggestions.length === 0
        ? [{ id: NO_RESULTS_OPTION_ID, title: COMPOSITION_SEARCH_LABELS.noOptions, isCreate: false, isNoResults: true }]
        : [];

    return [
      ...noResultsOption,
      ...suggestionOptions,
      { id: CREATE_OPTION_ID, title: COMPOSITION_SEARCH_LABELS.createNew, isCreate: true }
    ];
  }, [suggestions, loading]);

  return (
    <Autocomplete<CompositionOption, false, false, true>
      freeSolo
      fullWidth
      open={open}
      onOpen={() => setOpen(true)}
      onClose={(_, reason) => {
        if (reason !== 'selectOption') {
          setOpen(false);
        }
      }}
      value={null}
      inputValue={value}
      options={options}
      filterOptions={(currentOptions) => currentOptions}
      getOptionLabel={(option) => (typeof option === 'string' ? option : option.title)}
      getOptionDisabled={(option) => typeof option !== 'string' && !!option.isNoResults}
      onInputChange={(_, nextInput, reason) => {
        if (reason === 'input' || reason === 'clear') {
          onChangeText(nextInput);
        }
      }}
      onChange={(_, selected) => {
        if (!selected || typeof selected === 'string') {
          return;
        }

        if (selected.isNoResults) {
          return;
        }

        if (selected.isCreate) {
          setOpen(false);
          onCreateNew();

          return;
        }

        if (selected.suggestion) {
          setOpen(false);
          onSelectSuggestion(selected.suggestion);
        }
      }}
      renderOption={(props, option) => {
        const { key: _key, ...rest } = props;

        if (option.isNoResults) {
          return (
            <Box component="li" key={option.id} {...rest} sx={styles.option}>
              <Typography sx={styles.optionText} color="text.secondary">
                {option.title}
              </Typography>
            </Box>
          );
        }

        return (
          <Box component="li" key={option.id} {...rest} sx={option.isCreate ? styles.createOption : styles.option}>
            {option.isCreate && <Plus size={18} strokeWidth={1.75} />}
            <Typography sx={styles.optionText}>{option.title}</Typography>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField {...params} size="small" error={error} helperText={helperMessage} sx={styles.input} />
      )}
    />
  );
}
