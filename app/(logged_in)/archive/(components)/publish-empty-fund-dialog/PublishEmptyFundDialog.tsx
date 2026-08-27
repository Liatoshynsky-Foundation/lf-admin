'use client';

import { Box, Modal, Paper, Typography } from '@mui/material';
import Image from 'next/image';

import { styles } from './PublishEmptyFundDialog.styles';
import { FUND_PUBLISH_EMPTY_WARNING_MESSAGE } from '~/constants/fund';
import Button from '~/shared/components/design-system/button/Button';
import { fontFamilies } from '~/shared/theme/theme';

interface PublishEmptyFundDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const PublishEmptyFundDialog = ({ open, onCancel, onConfirm }: PublishEmptyFundDialogProps) => {
  return (
    <Modal open={open} onClose={onCancel}>
      <Paper variant="discardChangesModal">
        <Box sx={styles.modalHeader}>
          <Image src="/icons/warning.svg" alt="warning" width={40} height={40} />
          <Typography variant="h5" fontFamily={fontFamilies.body} lineHeight={1.4}>
            Опублікувати фонд?
          </Typography>
        </Box>
        <Typography sx={styles.mainContent}>{FUND_PUBLISH_EMPTY_WARNING_MESSAGE}</Typography>
        <Box sx={styles.modalFooter}>
          <Button variant="outlined" color="primary" size="medium" sx={styles.modalBtn} onClick={onCancel}>
            Скасувати
          </Button>
          <Button variant="filled" color="primary" size="medium" sx={styles.modalBtn} onClick={onConfirm}>
            Опублікувати
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
};
