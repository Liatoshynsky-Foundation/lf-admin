'use client';

import { Box, Chip, Divider, Typography } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';

import Button from '../design-system/button/Button';
import DropdownMenu from '../dropdown-menu/DropdownMenu';
import { filterSelectStyles } from './FilterSelect.styles';
import FilterSelectItem from './FilterSelectItem/FilterSelectItem';
import CloseIcon from '~/public/icons/close.svg';
import Badge from '~/shared/components/badge/Badge';
import { useMenuScrollClose } from '~/shared/hooks/use-menu-scroll-close/useMenuScrollClose';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export interface FilterOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

export interface FilterSelectProps {
  label: string;
  options: readonly FilterOption[];
  value?: string[];
  defaultValue?: string[];
  defaultValues?: string[];
  variant?: 'filled' | 'outlined';
  disabled?: boolean;
  maxSelections?: number;
  hideCounterChip?: boolean;
  hideClearAction?: boolean;
  menuMinWidth?: number;
  clearLabel?: string;
  persistLabel?: boolean;
  menuAlign?: 'left' | 'right';
  onChange?: (allSelected: string[]) => void;
  onAdd?: (value: string, label: string, allSelected: string[]) => void;
  onRemove?: (value: string, label: string, allSelected: string[]) => void;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
  label,
  options,
  value,
  defaultValue,
  defaultValues,
  variant = 'filled',
  disabled = false,
  maxSelections,
  hideCounterChip = false,
  hideClearAction = false,
  menuMinWidth,
  clearLabel = 'Очистити',
  persistLabel = false,
  menuAlign = 'left',
  onChange,
  onAdd,
  onRemove
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [uncontrolledValues, setUncontrolledValues] = useState<string[]>(
    () => value ?? defaultValue ?? defaultValues ?? []
  );
  const { disableTransition, handleClose } = useMenuScrollClose({
    onClose: () => setAnchorEl(null),
    anchorEl
  });
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const selectedValues = value ?? uncontrolledValues;

  useEffect(() => {
    if (value !== undefined) return;
    setUncontrolledValues(defaultValue ?? defaultValues ?? []);
  }, [defaultValue, defaultValues, value]);

  const updateSelectedValues = (nextValues: string[]) => {
    if (value === undefined) {
      setUncontrolledValues(nextValues);
    }
    onChange?.(nextValues);
  };

  const handleToggleMenu = () => {
    if (disabled) return;
    setAnchorEl((prev) => (prev ? null : triggerRef.current));
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

    updateSelectedValues(newValues);

    if (maxSelections === 1) {
      handleClose();
    }
  };

  const clearAll = () => {
    const removed = [...selectedValues];
    updateSelectedValues([]);
    removed.forEach((val) => {
      const option = options.find((item) => item.value === val);
      onRemove?.(val, option?.label ?? '', []);
    });
  };

  const isMaxReached = maxSelections && maxSelections > 1 ? selectedValues.length >= maxSelections : false;
  const selectedOptionsCount = selectedValues.length;
  const selectedOptionsLabel = useMemo(() => {
    return selectedValues.map((val) => options.find((opt) => opt.value === val)?.label ?? val).join(', ');
  }, [options, selectedValues]);

  const triggerAriaLabel = selectedOptionsCount > 0 && !hideCounterChip ? `${label}: ${selectedOptionsLabel}` : label;

  const isBadgeableStatus = (
    value: string
  ): value is
    | typeof BaseContentStatuses.Published
    | typeof BaseContentStatuses.Hidden
    | typeof BaseContentStatuses.Draft =>
    value === BaseContentStatuses.Published ||
    value === BaseContentStatuses.Hidden ||
    value === BaseContentStatuses.Draft;

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
        aria-label={triggerAriaLabel}
      >
        {(selectedOptionsCount === 0 || hideCounterChip || persistLabel) && (
          <Typography variant="textMd" sx={filterSelectStyles.label(disabled)}>
            {label}
          </Typography>
        )}
        <Box sx={filterSelectStyles.chipContainer}>
          {selectedOptionsCount > 0 && !hideCounterChip && (
            <Chip
              label={selectedOptionsLabel}
              variant={variant}
              disabled={disabled}
              onDelete={clearAll}
              deleteIcon={<CloseIcon width={12} height={12} data-testid="clear-all-icon" aria-hidden />}
              size="small"
              sx={filterSelectStyles.selectedOptionsChip(disabled)}
            />
          )}
          <Box sx={filterSelectStyles.dropdownIcon(disabled)}>
            <ChevronDown size={16} strokeWidth={2.25} aria-hidden="true" />
          </Box>
        </Box>
      </Box>

      <DropdownMenu
        disableScrollLock
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={filterSelectStyles.dropdownMenu(menuMinWidth)}
        anchorOrigin={{ vertical: 'bottom', horizontal: menuAlign }}
        transformOrigin={{ vertical: 'top', horizontal: menuAlign }}
        maxHeight={300}
        transitionDuration={disableTransition ? 0 : undefined}
        menuList={
          <Box sx={filterSelectStyles.menuListWrapper}>
            <Box sx={filterSelectStyles.menuItemsContainer}>
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                const optionDisabled = !isSelected && isMaxReached;

                return (
                  <FilterSelectItem
                    key={option.value}
                    label={option.label}
                    icon={
                      isBadgeableStatus(option.value) ? (
                        <Badge
                          variant={
                            option.value === BaseContentStatuses.Draft ? BaseContentStatuses.Hidden : option.value
                          }
                        />
                      ) : undefined
                    }
                    onClick={() => handleOptionClick(option)}
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
                <Button variant="text" onClick={clearAll} sx={filterSelectStyles.clearButton}>
                  {clearLabel}
                </Button>
              </>
            )}
          </Box>
        }
      />
    </Box>
  );
};
