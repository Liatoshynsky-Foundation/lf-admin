import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { X } from 'lucide-react';

import { styles } from './DeleteCardModal.styles';
import Button from '~/components/design-system/button/Button';

interface DeleteCardModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  description?: string;
}

const DeleteCardModal = ({ open, onClose, onDelete, description }: DeleteCardModalProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <Box sx={styles.closeIcon} onClick={onClose}>
        <X></X>
      </Box>
      <DialogTitle>Підтвердити видалення</DialogTitle>
      <DialogContent>
        <Typography>{description || 'Ви впевнені, що хочете видалити цю картку?'} </Typography>
      </DialogContent>
      <DialogActions sx={styles.actions}>
        <Button variant="filled" size="medium" sx={styles.deleteBtn} onClick={onDelete}>
          Видалити
        </Button>
        <Button variant="outlined" size="medium" color="primary" onClick={onClose}>
          Скасувати
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteCardModal;
