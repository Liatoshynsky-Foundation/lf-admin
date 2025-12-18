'use client';

import { Box } from '@mui/material';

type Props = {
  cropState: 'INITIAL' | 'RESIZED';
  onSimulateResize: () => void;
};

export function CropView({ cropState, onSimulateResize }: Props) {
  return (
    <Box data-testid="CropView" sx={{ height: '100%' }}>
      <Box
        data-testid="CropView-cropArea"
        role="button"
        tabIndex={0}
        onClick={onSimulateResize}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onSimulateResize();
        }}
      >
        Crop placeholder ({cropState})
      </Box>
    </Box>
  );
}
