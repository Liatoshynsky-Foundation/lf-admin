'use client';

import { Box, Typography } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { useRef, useState } from 'react';

import ActionMenu from '../dropdown-menu/ActionMenu';
import { styles } from './SortSelect.styles';

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

  const groups = [
    {
      title: fieldSectionLabel,
      items: fieldOptions.map((option) => ({
        id: option.value,
        text: {
          name: option.label
        },
        selected: fieldValue === option.value,
        onClick: () => onFieldChange(option.value)
      }))
    },
    {
      title: orderSectionLabel,
      items: orderOptions[fieldValue].map((option) => ({
        id: option.value,
        text: {
          name: option.label
        },
        selected: value === option.value,
        onClick: () => {
          onValueChange(option.value);
          handleCloseMenu();
        }
      }))
    }
  ];

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
        <Typography variant="textMd" sx={styles.label(disabled)}>
          {triggerLabel}
        </Typography>
        <Box sx={styles.dropdownIcon(disabled)}>
          <ChevronDown size={16} strokeWidth={2.25} aria-hidden="true" />
        </Box>
      </Box>

      <ActionMenu
        anchorEl={anchorEl}
        onClose={handleCloseMenu}
        menuItems={groups}
        isSelectable={true}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      />
    </>
  );
}
