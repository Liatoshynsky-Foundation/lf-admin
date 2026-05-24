'use client';

import { Box, Divider, Typography } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { useRef, useState } from 'react';

import { styles } from './SortSelect.styles';
import DropdownMenu from '~/shared/components/dropdown-menu/DropdownMenu';
import FilterSelectItem from '~/shared/components/selector/FilterSelectItem/FilterSelectItem';

export type SortFieldOption<FieldValue extends string> = {
  value: FieldValue;
  label: string;
};

export type SortOrderOption<SortValue extends string> = {
  value: SortValue;
  label: string;
};

export type SortSelectProps<FieldValue extends string, SortValue extends string> = Readonly<{
  fieldOptions: readonly SortFieldOption<FieldValue>[];
  orderOptions: Readonly<Record<FieldValue, readonly SortOrderOption<SortValue>[]>>;
  fieldValue: FieldValue;
  value: SortValue;
  triggerLabel: string;
  onFieldChange: (value: FieldValue) => void;
  onValueChange: (value: SortValue) => void;
  disabled?: boolean;
  minWidth?: number;
  fieldSectionLabel?: string;
  orderSectionLabel?: string;
  dataTestId?: string;
}>;

export function SortSelect<FieldValue extends string, SortValue extends string>({
  fieldOptions,
  orderOptions,
  fieldValue,
  value,
  triggerLabel,
  onFieldChange,
  onValueChange,
  disabled = false,
  minWidth = 208,
  fieldSectionLabel = 'Сортувати за',
  orderSectionLabel = 'Порядок',
  dataTestId = 'sort-select'
}: SortSelectProps<FieldValue, SortValue>) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  const handleToggleMenu = () => {
    if (disabled) {
      return;
    }

    setAnchorEl((previous) => (previous ? null : triggerRef.current));
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  return (
    <>
      <Box
        ref={triggerRef}
        onClick={handleToggleMenu}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="dialog"
        aria-expanded={Boolean(anchorEl)}
        data-testid={dataTestId}
        sx={{
          ...styles.root('filled', disabled),
          minWidth: `${minWidth}px`
        }}
      >
        <Typography variant='textMd' sx={styles.label(disabled)}>{triggerLabel}</Typography>
        <Box sx={styles.dropdownIcon(disabled)}>
          <ChevronDown size={16} strokeWidth={2.25} aria-hidden="true" />
        </Box>
      </Box>

      <DropdownMenu
        disableScrollLock
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        sx={styles.dropdownMenu(minWidth)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        menuList={
          <Box sx={styles.menuList}>
            <Typography
              sx={styles.sortMethodHeading}
            >
              {fieldSectionLabel}
            </Typography>

            {fieldOptions.map((option) => (
              <FilterSelectItem
                key={option.value}
                label={option.label}
                selected={fieldValue === option.value}
                onClick={() => onFieldChange(option.value)}
                sx={styles.menuItem}
              />
            ))}

            <Divider sx={styles.divider} />

            <Typography
              sx={styles.sortMethodHeading}
            >
              {orderSectionLabel}
            </Typography>

            {orderOptions[fieldValue].map((option) => (
              <FilterSelectItem
                key={option.value}
                label={option.label}
                selected={value === option.value}
                onClick={() => {
                  onValueChange(option.value);
                  handleCloseMenu();
                }}
                sx={styles.menuItem}
              />
            ))}
          </Box>
        }
      />
    </>
  );
}