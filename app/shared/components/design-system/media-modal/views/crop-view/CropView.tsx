'use client';

import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

type Props = {
  resetSeq: number;
  onCropChanges: (hasCropChanges: boolean) => void;
};

export function CropView({ resetSeq, onCropChanges }: Props) {
  const [hasCropChanges, setHasCropChanges] = useState(false);

  const onCropChangesRef = useRef(onCropChanges);
  useEffect(() => {
    onCropChangesRef.current = onCropChanges;
  }, [onCropChanges]);

  useEffect(() => {
    setHasCropChanges(false);
    onCropChangesRef.current(false);
  }, [resetSeq]);

  const markChanged = () => {
    if (hasCropChanges) return;
    setHasCropChanges(true);
    onCropChangesRef.current(true);
  };

  return (
    <Box data-testid="CropView" sx={{ height: '100%' }}>
      <Box
        data-testid="CropView-cropArea"
        role="button"
        tabIndex={0}
        onClick={markChanged}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') markChanged();
        }}
      >
        Crop placeholder ({hasCropChanges ? 'CHANGED' : 'UNCHANGED'})
      </Box>
    </Box>
  );
}
