'use client';

import { Box, Typography } from '@mui/material';
import React from 'react';

export function CropView({ selectedName }: { selectedName: string }) {
  return (
    <Box data-testid="CropView">
      <Typography variant="body2" data-testid="CropView-cropArea">
        Crop area placeholder
      </Typography>

      <Typography variant="body2" data-testid="CropView-selectedName">
        Selected: {selectedName}
      </Typography>
    </Box>
  );
}
