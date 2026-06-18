'use client';

import { Box } from '@mui/material';
import { GripHorizontal } from 'lucide-react';
import React from 'react';

import { useSortableItemContext } from '../sortable-item-wrapper/SortableItemWrapper';

export const Grip = () => {
  const { attributes, listeners } = useSortableItemContext();

  return (
    <Box
      {...attributes}
      {...listeners}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 'auto',
        cursor: 'grab',
        color: 'grey.500',
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      <GripHorizontal size={20} />
    </Box>
  );
};
