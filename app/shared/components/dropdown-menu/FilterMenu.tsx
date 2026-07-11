'use client';

import { Box, Button, Divider } from '@mui/material';
import React from 'react';

import DropdownMenu from '../dropdown-menu/DropdownMenu';
import FilterSelectItem from '../selector/FilterSelectItem/FilterSelectItem';
import { filterSelectStyles } from './FilterSelectMenu.styles';

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectMenuProps {
  anchorEl: null | HTMLElement;
  open: boolean;
  onClose: () => void;
  menuMinWidth?: number;
  menuItems: readonly FilterOption[];
  selectedValues: string[];
  maxSelections?: number;
  hideClearAction?: boolean;
  clearLabel?: string;
  onOptionClick: (option: FilterOption) => void;
  onClearAll: () => void;
}

export const FilterSelectMenu: React.FC<FilterSelectMenuProps> = ({
  anchorEl,
  open,
  onClose,
  menuMinWidth,
  menuItems,
  selectedValues,
  maxSelections,
  hideClearAction = false,
  clearLabel = 'Очистити',
  onOptionClick,
  onClearAll
}) => {
  const isMaxReached = maxSelections ? selectedValues.length >= maxSelections : false;

  return (
    <DropdownMenu
      disableScrollLock
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      sx={filterSelectStyles.dropdownMenu(menuMinWidth)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      maxHeight={300}
      menuList={
        <Box sx={filterSelectStyles.menuListWrapper}>
          <Box sx={filterSelectStyles.menuItemsContainer}>
            {menuItems.map((item) => {
              const isSelected = selectedValues.includes(item.value);
              const optionDisabled = !isSelected && isMaxReached;

              return (
                <FilterSelectItem
                  key={item.value}
                  label={item.label}
                  onClick={() => !optionDisabled && onOptionClick(item)}
                  selected={isSelected}
                  disabled={optionDisabled}
                  sx={filterSelectStyles.menuItem}
                />
              );
            })}
          </Box>
          {!hideClearAction && (
            <>
              <Divider sx={filterSelectStyles.divider} />
              <Button variant="text" onClick={onClearAll} sx={filterSelectStyles.clearButton}>
                {clearLabel}
              </Button>
            </>
          )}
        </Box>
      }
    />
  );
};
