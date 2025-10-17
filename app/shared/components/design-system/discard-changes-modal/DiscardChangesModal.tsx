'use client';

import { Box, Modal, Typography } from '@mui/material';
import Image from 'next/image';
import React from 'react';

import Button from '../button/Button';
import { styles } from './DiscardChangesModal.styles';

interface DiscardChangesModalProps {
  open: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
}

const DiscardChangesModal: React.FC<DiscardChangesModalProps> = ({ open, handleClose, handleSubmit }) => {
  return (
    <Modal sx={styles.modal} open={open} onClose={handleClose}>
      <Box sx={styles.contentWrapper}>
        <Box sx={styles.modalHeader}>
          <Image src="/icons/warning.svg" alt="warning" width={40} height={40} />
          <Typography variant="customBold32" sx={styles.headerTitle}>
            Скасувати зміни?
          </Typography>
        </Box>
        <Typography variant="customMedium18Loose" sx={styles.mainContent}>
          Усі внесені зміни буде втрачено. Ви впевнені, що хочете вийти без збереження?
        </Typography>
        <Box sx={styles.modalFooter}>
          <Button variant="outlined" color="primary" size="medium" sx={styles.modalBtn} onClick={handleClose}>
            Повернутись
          </Button>
          <Button variant="filled" color="primary" size="medium" sx={styles.modalBtn} onClick={handleSubmit}>
            Скасувати зміни
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DiscardChangesModal;
