'use client';

import { Box, Button, Chip, Divider, Typography } from '@mui/material';
import Image from 'next/image';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { filterSelectStyles } from './FilterSelect.styles';
import FilterSelectItem from './FilterSelectItem/FilterSelectItem';
import CloseIcon from '~/public/icons/close.svg';
import DropdownMenu from '~/shared/components/dropdown-menu/DropdownMenu';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  options: readonly FilterOption[];
  defaultValues?: string[];
  variant?: 'filled' | 'outlined';
  disabled?: boolean;
  maxSelections?: number;
  hideCounterChip?: boolean;
  hideClearAction?: boolean;
  menuMinWidth?: number;
  onAdd?: (value: string, label: string, allSelected: string[]) => void;
  onRemove?: (value: string, label: string, allSelected: string[]) => void;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
  label,
  options,
  defaultValues,
  variant = 'filled',
  disabled = false,
  maxSelections,
  hideCounterChip = false,
  hideClearAction = false,
  menuMinWidth,
  onAdd,
  onRemove
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedValues, setSelectedValues] = useState<string[]>(() => defaultValues ?? []);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSelectedValues(defaultValues ?? []);
  }, [defaultValues]);

  const handleToggleMenu = () => {
    if (disabled) return;
    setAnchorEl((prev) => (prev ? null : triggerRef.current));
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const handleOptionClick = (option: FilterOption) => {
    const isSelected = selectedValues.includes(option.value);
    let newValues: string[];

    if (isSelected) {
      newValues = selectedValues.filter((val) => val !== option.value);
      onRemove?.(option.value, option.label, newValues);
    } else if (maxSelections === 1) {
      const previousValue = selectedValues[0];
      if (previousValue) {
        const previousOption = options.find((item) => item.value === previousValue);
        onRemove?.(previousValue, previousOption?.label ?? '', []);
      }

      newValues = [option.value];
      onAdd?.(option.value, option.label, newValues);
    } else if (!maxSelections || selectedValues.length < maxSelections) {
      newValues = [...selectedValues, option.value];
      onAdd?.(option.value, option.label, newValues);
    } else {
      return;
    }

    setSelectedValues(newValues);

    if (maxSelections === 1) {
      handleCloseMenu();
    }
  };

  const clearAll = () => {
    const removed = [...selectedValues];
    setSelectedValues([]);
    removed.forEach((value) => {
      const option = options.find((item) => item.value === value);
      onRemove?.(value, option?.label ?? '', []);
    });
  };

  const selectedOptionsCount = selectedValues.length;
  const isMaxReached = maxSelections ? selectedValues.length >= maxSelections : false;
  const selectedOptionsLabel = useMemo(() => {
    return selectedValues
      .map((value) => options.find((option) => option.value === value)?.label ?? value)
      .join(', ');
  }, [options, selectedValues]);
  return (
    <Box>
      <Box
        ref={triggerRef}
        sx={filterSelectStyles.root(variant, disabled)}
        onClick={handleToggleMenu}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="dialog"
        aria-expanded={Boolean(anchorEl)}
      >
        <Typography sx={filterSelectStyles.label(disabled)}>{label}</Typography>
        <Box sx={filterSelectStyles.chipContainer}>
          {!hideCounterChip && selectedOptionsCount > 0 && (
            <Chip
              label={selectedOptionsLabel}
              variant={variant}
              disabled={disabled}
              onDelete={clearAll}
              deleteIcon={<CloseIcon width={16} height={20} data-testid="clear-all-icon" />}
              size="small"
              sx={filterSelectStyles.selectedOptionsChip(disabled)}
            />
          )}
          <Box sx={filterSelectStyles.dropdownIcon(disabled)}>
            <Image
              src="/icons/chevron-down-dark.svg"
              alt="chevron-down"
              width={12}
              height={12}
              style={{ transform: 'translateY(1px)' }}
            />
          </Box>
        </Box>
      </Box>

      <DropdownMenu
        disableScrollLock
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        sx={{
          '& .MuiPaper-root': {
            minWidth: menuMinWidth ? `${menuMinWidth}px` : undefined
          }
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        maxHeight={300}
        menuList={
          <Box sx={{ padding: '0 8px' }}>
            <Box sx={{ maxHeight: 220, overflowY: 'auto' }}>
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                const optionDisabled = !isSelected && isMaxReached;

                return (
                  <FilterSelectItem
                    key={option.value}
                    label={option.label}
                    onClick={() => !optionDisabled && handleOptionClick(option)}
                    selected={isSelected}
                    disabled={optionDisabled}
                    sx={filterSelectStyles.menuItem}
                  />
                );
              })}
            </Box>
            {!hideClearAction && (
              <>
                <Divider sx={{ my: 1 }} />
                <Button variant="text" onClick={clearAll} sx={{ textTransform: 'none' }}>
                  Очистити
                </Button>
              </>
            )}
          </Box>
        }
      />
    </Box>
  );
};
