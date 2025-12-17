'use client';

import CloseIcon from '@mui/icons-material/Close';
import { Box, Dialog, IconButton } from '@mui/material';
import React, { ReactNode } from 'react';

import { styles } from './MediaModalContainer.styles';

type Props = {
  open: boolean;
  onClose: () => void;
  dataTestId?: string;
  headerLeft?: ReactNode;
  headerCenter?: ReactNode;
  headerRight?: ReactNode;
  children: ReactNode;
  footerTop?: ReactNode;
  footerLeft?: ReactNode;
  footerRight?: ReactNode;
};

export function MediaModalContainer({
  open,
  onClose,
  dataTestId,
  headerLeft,
  headerCenter,
  headerRight,
  children,
  footerTop,
  footerLeft,
  footerRight
}: Props) {
  const baseTestId = dataTestId ?? 'MediaModalContainer';

  return (
    <Dialog open={open} onClose={onClose} sx={styles.dialog} maxWidth={false} PaperProps={{ sx: styles.paper }}>
      <Box sx={styles.header} data-testid={`${baseTestId}-header`}>
        <Box sx={styles.headerLeft} data-testid={`${baseTestId}-headerLeft`}>
          {headerLeft ?? null}
        </Box>

        <Box sx={styles.headerCenter} data-testid={`${baseTestId}-headerCenter`}>
          {headerCenter ?? null}
        </Box>

        <Box sx={styles.headerRight} data-testid={`${baseTestId}-headerRight`}>
          {headerRight ?? null}
          <IconButton
            onClick={onClose}
            aria-label="close"
            data-testid={`${baseTestId}-closeButton`}
            sx={styles.closeButton}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={styles.body} data-testid={`${baseTestId}-body`}>
        {children}
      </Box>

      <Box sx={styles.footer} data-testid={`${baseTestId}-footer`}>
        {footerTop ? <Box data-testid={`${baseTestId}-footerTop`}>{footerTop}</Box> : null}

        <Box sx={styles.footerBottomRow}>
          <Box sx={styles.footerLeft} data-testid={`${baseTestId}-footerLeft`}>
            {footerLeft ?? <Box />}
          </Box>

          <Box sx={styles.footerRight} data-testid={`${baseTestId}-footerRight`}>
            {footerRight ?? null}
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
