import { MenuItem, MenuItemProps, Typography } from '@mui/material';
import React from 'react';

import { styles } from './FilterSelectItem.styles';
import CheckmarkIcon from '~/public/icons/checkmark.svg';

export interface FilterSelectItemProps extends MenuItemProps {
  label: string;
}

const FilterSelectItem = ({ label, sx, selected, ...props }: FilterSelectItemProps) => {
  return (
    <MenuItem selected={selected} sx={[styles.menuItem, ...(Array.isArray(sx) ? sx : [sx])]} {...props}>
      <Typography variant="textMd">{label}</Typography>
      {selected && <CheckmarkIcon width={15} height={11} aria-hidden />}
    </MenuItem>
  );
};

export default FilterSelectItem;
