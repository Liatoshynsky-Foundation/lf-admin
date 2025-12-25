'use client';

import { Box } from '@mui/material';

import { filterButtonStyles } from './FilterButton.styles';
import ChevronDownIcon from '~/public/icons/chevronDown.svg';

type FilterButtonProps = Readonly<{
  label: string;
  onClick: () => void;
  active?: boolean;
  testId?: string;
}>;

export function FilterButton({ label, onClick, active = false, testId }: FilterButtonProps) {
  return (
    <Box onClick={onClick} data-testid={testId} sx={filterButtonStyles.button(active)}>
      {label}
      <ChevronDownIcon width={24} height={24} aria-hidden focusable={false} />
    </Box>
  );
}
