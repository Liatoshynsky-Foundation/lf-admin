'use client';

import { Box } from '@mui/material';
import React from 'react';

import { useSortableItemContext } from '../sortable-item-wrapper/SortableItemWrapper';
import { styles } from './Grip.styles';
import GripVertical from '~/public/icons/grip-vertical.svg';

interface GripProps {
  orientation?: 'horizontal' | 'vertical'
}
export const Grip = ({ orientation = 'vertical' }: GripProps) => {
  const { attributes, listeners } = useSortableItemContext();

  return (
    <Box
      {...attributes}
      {...listeners}
      sx={{...styles.box, ...styles.getGripStyles(orientation)}}
    >
      <GripVertical size={20} />
    </Box>
  );
};
