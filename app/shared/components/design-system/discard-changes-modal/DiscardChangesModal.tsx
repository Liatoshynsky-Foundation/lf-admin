'use client';

import { Box, Modal, Paper, Typography } from '@mui/material';
import Image from 'next/image';
import React from 'react';

import Button from '../button/Button';
import { styles } from './DiscardChangesModal.styles';
import { fontFamilies } from '~/shared/theme/theme';

interface DiscardChangesModalProps {
  open: boolean;
  title?: string;
  description?: string;
  cancelButtonText?: string;
  confirmButtonText?: string;
  handleClose: () => void;
  handleSubmit: () => void;
}

const DiscardChangesModal: React.FC<DiscardChangesModalProps> = ({
  open,
  handleClose,
  handleSubmit,
  title = 'Скасувати зміни?',
  description = 'Усі внесені зміни буде втрачено. Ви впевнені, що хочете вийти без збереження?',
  cancelButtonText = 'Повернутись',
  confirmButtonText = 'Скасувати зміни'
}) => {
  return (
    <Modal open={open} onClose={handleClose}>
      <Paper variant="discardChangesModal">
        <Box sx={styles.modalHeader}>
          <Image src="/icons/warning.svg" alt="warning" width={40} height={40} />
          <Typography variant="h5" fontFamily={fontFamilies.body} lineHeight={1.4}>
            {title}
          </Typography>
        </Box>
        <Typography sx={styles.mainContent}>{description}</Typography>
        <Box sx={styles.modalFooter}>
          <Button variant="outlined" color="primary" size="medium" sx={styles.modalBtn} onClick={handleClose}>
            {cancelButtonText}
          </Button>
          <Button variant="filled" color="primary" size="medium" sx={styles.modalBtn} onClick={handleSubmit}>
            {confirmButtonText}
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
};

export default DiscardChangesModal;
