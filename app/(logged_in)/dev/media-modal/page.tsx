'use client';

import { Box, Typography } from '@mui/material';
import React, { useState } from 'react';

import Button from '~/shared/components/design-system/button/Button';
import { MediaModal } from '~/shared/components/design-system/media-modal/MediaModal';
import type {
  MediaModalOpenState,
  MediaModalResult
} from '~/shared/components/design-system/media-modal/MediaModal.types';

export default function MediaModalPlaygroundPage() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<MediaModalResult | null>(null);
  const [initial, setInitial] = useState<MediaModalOpenState>({ tab: 'GALLERY' });

  const openWith = (next: MediaModalOpenState) => () => {
    setInitial(next);
    setOpen(true);
  };

  return (
    <Box sx={{ p: 3, display: 'grid', gap: 2 }}>
      <Typography variant="h4">MediaModal playground</Typography>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button color="primary" variant="filled" label="Open Gallery" onClick={openWith({ tab: 'GALLERY' })} />
        <Button color="primary" variant="filled" label="Open Upload" onClick={openWith({ tab: 'UPLOAD' })} />
        <Button color="primary" variant="filled" label="Open Used" onClick={openWith({ tab: 'USED' })} />
        <Button
          color="primary"
          variant="filled"
          label="Open Crop (demo)"
          onClick={openWith({
            tab: 'GALLERY',
            step: 'CROP',
            selected: { kind: 'gallery', name: 'gallery-1.png', locale: 'UA' }
          })}
        />
        <Button
          color="primary"
          variant="outlined"
          label="Clear result"
          disabled={!result}
          onClick={() => setResult(null)}
        />
      </Box>

      {result ? (
        <Box component="pre" sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, m: 0 }}>
          {JSON.stringify(result, null, 2)}
        </Box>
      ) : (
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          No result yet.
        </Typography>
      )}

      <MediaModal open={open} onClose={() => setOpen(false)} onApply={setResult} initial={initial} />
    </Box>
  );
}
