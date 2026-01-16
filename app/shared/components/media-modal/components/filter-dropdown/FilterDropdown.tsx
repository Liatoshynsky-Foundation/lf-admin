'use client';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Menu, MenuItem } from '@mui/material';
import React, { useState } from 'react';

import { filterDropdownStyles } from './FilterDropdown.styles';
import ChevronDownIcon from '~/public/icons/chevronDown.svg';

type FilterOption = {
  value: string;
  label: string;
};

type FilterDropdownProps = Readonly<{
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  testId?: string;
}>;

export function FilterDropdown({ label, value, options, onChange, testId = 'FilterDropdown' }: FilterDropdownProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    handleClose();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const selectedOption = options.find((opt) => opt.value === value);
  const hasValue = Boolean(value);

  return (
    <>
      <Box onClick={handleClick} data-testid={testId} sx={filterDropdownStyles.button}>
        {hasValue ? (
          <>
            <Box sx={filterDropdownStyles.chip} onClick={handleClear}>
              <Box component="span" sx={filterDropdownStyles.chipText}>
                {selectedOption?.label}
              </Box>
              <CloseIcon sx={filterDropdownStyles.closeIcon} />
            </Box>
            <ChevronDownIcon width={24} height={24} aria-hidden focusable={false} />
          </>
        ) : (
          <>
            <span>{label}</span>
            <ChevronDownIcon width={24} height={24} aria-hidden focusable={false} />
          </>
        )}
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <MenuItem key={option.value} onClick={() => handleSelect(option.value)} sx={filterDropdownStyles.menuItem}>
              <span>{option.label}</span>
              {isSelected && <CheckIcon sx={filterDropdownStyles.checkIcon} />}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
