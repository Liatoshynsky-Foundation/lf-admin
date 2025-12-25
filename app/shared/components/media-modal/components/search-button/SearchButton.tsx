'use client';

import { Box, InputAdornment, TextField } from '@mui/material';
import { useRef, useState } from 'react';

import { getInputStyle, iconWrapperStyles, inputAdornmentStyles, textFieldStyles } from './SearchButton.styles';
import SearchIcon from '~/public/icons/search.svg';

type SearchButtonProps = {
  value: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  testId?: string;
};

export function SearchButton({ value, onSearch, placeholder = 'Пошук...', testId }: SearchButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  return (
    <TextField
      data-testid={testId}
      inputRef={inputRef}
      value={value}
      onChange={(e) => onSearch(e.target.value)}
      placeholder={focused ? placeholder : ''}
      variant="outlined"
      size="small"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      sx={textFieldStyles}
      slotProps={{
        input: {
          style: getInputStyle(focused),
          startAdornment: (
            <InputAdornment position="start" sx={inputAdornmentStyles}>
              <Box sx={iconWrapperStyles} onClick={() => inputRef.current?.focus()}>
                <SearchIcon width={20} height={20} aria-hidden focusable={false} />
              </Box>
            </InputAdornment>
          )
        }
      }}
    />
  );
}
