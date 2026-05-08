'use client';

import { Box, Fade, IconButton, Modal } from '@mui/material';
import React, { useEffect, useRef } from 'react';

import { styles } from './ImagePreviewModal.styles';
import { sxToArray } from '~/lib/utils/sxToArray';
import CloseIcon from '~/public/icons/close.svg';
import { useZoomPan } from '~/shared/hooks/use-zoom-pan/useZoomPan';

type ImagePreviewModalProps = {
  open: boolean;
  src: string;
  alt: string;
  onClose: () => void;
  padding?: number;
};

export function ImagePreviewModal({ open, src, alt, onClose, padding = 40 }: Readonly<ImagePreviewModalProps>) {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const imageWrapRef = useRef<HTMLDivElement | null>(null);

  const { reset, zoomIn, zoomOut, onImageClick, onMouseDown, onMouseMove, endPan, getImageSx, containerCursor } =
    useZoomPan({ minZoom: 0.5, maxZoom: 2, step: 0.1, enabled: open });

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  useEffect(() => {
    if (!open) return;

    const handler = (ev: WheelEvent) => {
      ev.preventDefault();
      if (ev.deltaY < 0) zoomIn();
      else zoomOut();
    };

    window.addEventListener('wheel', handler, { passive: false });

    return () => {
      window.removeEventListener('wheel', handler);
    };
  }, [open, zoomIn, zoomOut]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      disableScrollLock
      closeAfterTransition
      slotProps={{
        backdrop: { sx: styles.backdrop }
      }}
    >
      <Fade in={open} timeout={{ enter: 500, exit: 300 }}>
        <Box sx={styles.root({ padding })}>
          <Box
            ref={viewerRef}
            onClick={(e) => {
              if (e.target === e.currentTarget) onClose();
            }}
            onMouseMove={onMouseMove}
            onMouseUp={endPan}
            onMouseLeave={endPan}
            sx={styles.viewer({ padding, containerCursor })}
          >
            <Box ref={imageWrapRef} sx={[...sxToArray(styles.imageWrap), ...sxToArray(getImageSx())]}>
              <IconButton
                size="small"
                aria-label="Close preview"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                sx={styles.closeButton}
              >
                <CloseIcon />
              </IconButton>

              <Box
                component="img"
                src={src}
                alt={alt}
                draggable={false}
                onClick={onImageClick}
                onMouseDown={onMouseDown}
                sx={styles.img({ padding })}
              />
            </Box>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}
