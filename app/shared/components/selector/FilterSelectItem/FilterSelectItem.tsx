import { Box, MenuItem, MenuItemProps, Typography } from '@mui/material';
import { Check } from 'lucide-react';
import React from 'react';

import { styles } from './FilterSelectItem.styles';

export interface FilterSelectItemProps extends MenuItemProps {
  label: string;
  icon?: React.ReactNode;
}

const FilterSelectItem = ({ label, icon, sx, selected, ...props }: FilterSelectItemProps) => {
  return (
    <MenuItem selected={selected} sx={[styles.menuItem, ...(Array.isArray(sx) ? sx : [sx])]} {...props}>
      <Box sx={styles.content}>
        {icon && <Box sx={styles.startIcon}>{icon}</Box>}
        <Typography variant="textMd" sx={styles.label}>
          {label}
        </Typography>

        <Box sx={styles.endIcon}>{selected && <Check size={20} />}</Box>
      </Box>
    </MenuItem>
  );
};

export default FilterSelectItem;
