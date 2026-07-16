'use client';

import CloseIcon from '@mui/icons-material/Close';
import { Box } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

import { filterDropdownStyles } from './FilterDropdown.styles';
import ActionMenu from '~/shared/components/dropdown-menu/ActionMenu';

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

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const selectedOption = options.find((opt) => opt.value === value);
  const hasValue = Boolean(value);

  const menuItems = [
    {
      items: options.map((option) => ({
        id: option.value,
        text: {
          name: option.label
        },
        selected: option.value === value,
        onClick: () => onChange(option.value)
      }))
    }
  ];

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
            <ChevronDown size={24} />
          </>
        ) : (
          <>
            <span>{label}</span>
            <ChevronDown size={24} />
          </>
        )}
      </Box>

      <ActionMenu
        anchorEl={anchorEl}
        onClose={handleClose}
        menuItems={menuItems}
        isSelectable={true}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
      />
    </>
  );
}
