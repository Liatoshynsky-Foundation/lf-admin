import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { X } from 'lucide-react';

import { styles } from './DeleteCardModal.styles';
import Button from '~/components/design-system/button/Button';

interface DeleteCardModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  description?: string;
  title?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const DeleteCardModal = ({
  open,
  onClose,
  onDelete,
  description,
  title = 'Підтвердити видалення',
  confirmButtonText = 'Видалити',
  cancelButtonText = 'Скасувати'
}: DeleteCardModalProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <Box sx={styles.closeIcon} onClick={onClose}>
        <X></X>
      </Box>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{description || 'Ви впевнені, що хочете видалити цю картку?'} </Typography>
      </DialogContent>
      <DialogActions sx={styles.actions}>
        <Button variant="filled" size="medium" sx={styles.deleteBtn} onClick={onDelete}>
          {confirmButtonText}
        </Button>
        <Button variant="outlined" size="medium" color="primary" onClick={onClose}>
          {cancelButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteCardModal;
