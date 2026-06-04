'use client';

import { Box, Dialog, IconButton } from '@mui/material';
import React, { ReactNode } from 'react';

import { styles } from './MediaModalContainer.styles';
import CloseIcon from '~/public/icons/close.svg';

type Props = Readonly<{
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
}>;

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
  const hasFooter = Boolean(footerTop || footerLeft || footerRight);

  return (
    <Dialog
      open={open}
      onClose={(_, reason: 'backdropClick' | 'escapeKeyDown') => {
        if (reason === 'backdropClick') return;
        onClose();
      }}
      sx={styles.dialog}
      maxWidth={false}
      data-testid={baseTestId}
      slotProps={{
        paper: { sx: styles.paper }
      }}
    >
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
            sx={styles.closeIcon}
          >
            <CloseIcon aria-hidden focusable={false} width={24} height={24} />
          </IconButton>
        </Box>
      </Box>

      <Box sx={styles.body} data-testid={`${baseTestId}-body`}>
        {children}
      </Box>

      {hasFooter ? (
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
      ) : null}
    </Dialog>
  );
}
