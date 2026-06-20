'use client';

import { Box } from '@mui/material';
import React from 'react';

import { useSortableItemContext } from '../sortable-item-wrapper/SortableItemWrapper';
import { styles } from './Grip.styles';
import GripVertical from '~/public/icons/grip-vertical.svg';

export type GripPosition = 'center' | 'top'
interface GripProps {
  orientation?: 'horizontal' | 'vertical';
  gripPosition?: GripPosition;
}

export const Grip = ({ orientation = 'vertical', gripPosition = 'center' }: GripProps) => {
  const { attributes, listeners } = useSortableItemContext();

  return (
    <Box
      {...attributes}
      {...listeners}
      sx={{
        ...styles.box,
        ...styles.getGripStyles(orientation),
        ...(gripPosition === 'top' && { marginTop: '12px' })
      }}
    >
      <GripVertical width={24} height={24} />
    </Box>
  );
};
