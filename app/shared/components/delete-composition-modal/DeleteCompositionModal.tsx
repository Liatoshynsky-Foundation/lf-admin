'use client';

import { Box, Dialog, IconButton, Typography } from '@mui/material';
import { X } from 'lucide-react';

import { styles } from './DeleteCompositionModal.styles';
import Button from '~/components/design-system/button/Button';
import { OPUS_DELETE_MODAL } from '~/constants/opus';

interface DeleteCompositionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export const DeleteCompositionModal = ({
  open,
  onClose,
  onConfirm,
  title = OPUS_DELETE_MODAL.title,
  description = OPUS_DELETE_MODAL.description
}: Readonly<DeleteCompositionModalProps>) => {
  return (
    <Dialog open={open} onClose={onClose} disableScrollLock PaperProps={{ sx: styles.deletePaper }}>
      <Box sx={styles.deleteHeader}>
        <Typography sx={styles.deleteTitle}>{title}</Typography>
        <IconButton aria-label="Закрити" onClick={onClose}>
          <X size={24} strokeWidth={1.5} />
        </IconButton>
      </Box>
      <Typography sx={styles.deleteDescription}>{description}</Typography>
      <Box sx={styles.deleteActions}>
        <Button variant="filled" size="medium" color="secondary" onClick={onConfirm} sx={styles.deleteButton}>
          {OPUS_DELETE_MODAL.confirm}
        </Button>
        <Button variant="outlined" size="medium" color="primary" onClick={onClose}>
          {OPUS_DELETE_MODAL.cancel}
        </Button>
      </Box>
    </Dialog>
  );
};
