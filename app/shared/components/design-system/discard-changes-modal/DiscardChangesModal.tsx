'use client';

import { Box, Button, Modal, Typography } from '@mui/material';
import Image from 'next/image';
import React from 'react';

import { styles } from './DiscardChangesModal.styles';

interface DiscardChangesModalProps {
  open: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
}

const DiscardsChangesModal: React.FC<DiscardChangesModalProps> = ({ open, handleClose, handleSubmit }) => {
  return (
    <Modal sx={styles.modal} open={open} onClose={handleClose}>
      <Box sx={styles.contentWrapper}>
        <Box sx={styles.modalHeader}>
          <Image src="./icons/warning.svg" alt="warning" width={40} height={40} />
          <Typography sx={styles.headerTitle}>Скасувати зміни?</Typography>
        </Box>
        <Typography sx={styles.mainContent}>
          Усі внесені зміни буде втрачено. Ви впевнені, що хочете вийти без збереження?
        </Typography>
        <Box sx={styles.modalFooter}>
          <Button variant="outlined" sx={styles.goBackBtn} onClick={handleClose}>
            Повернутись
          </Button>

          <Button variant="contained" sx={styles.discardChangesBtn} onClick={handleSubmit}>
            Скасувати зміни
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DiscardsChangesModal;
