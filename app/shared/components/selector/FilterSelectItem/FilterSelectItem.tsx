import { Box, MenuItemProps, Typography } from '@mui/material';
import Image from 'next/image';
import React from 'react';

import { styles } from './FilterSelectItem.styles';

export interface FilterSelectItemProps extends MenuItemProps {
  label: string;
  onClick?: () => void;
}

const FilterSelectItem = ({ label, onClick, sx, selected }: FilterSelectItemProps) => {
  return (
    <Box onClick={onClick} sx={{ ...sx, ...styles.container }}>
      <Typography variant="customMedium16">{label}</Typography>
      <Box sx={{ width: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {selected ? <Image src="/icons/checkmark.svg" alt="selected" width={16} height={16} /> : null}
      </Box>
    </Box>
  );
};

export default FilterSelectItem;
