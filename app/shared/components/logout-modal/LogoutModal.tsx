'use client';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { styles } from './LogoutModal.styles';
import Button from '~/components/design-system/button/Button';
import { logoutAction } from '~/shared/actions/auth';

interface LogoutModalProps {
  open: boolean;
  onClose: () => void;
  disableScrollLock?: boolean;
}

const LogoutModal = ({ open, onClose, disableScrollLock }: LogoutModalProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutAction();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Помилка при виході', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} disableScrollLock={disableScrollLock} PaperProps={{ sx: styles.dialogPaper }}>
      <Box sx={styles.closeIcon} onClick={onClose}>
        <X />
      </Box>

      <DialogTitle sx={styles.title}>Вийти з акаунту</DialogTitle>

      <DialogContent sx={styles.content}>
        <Typography variant="textMd" sx={styles.description}>
          Ви дійсно хочете вийти з акаунту адміністратора?
        </Typography>
      </DialogContent>

      <DialogActions sx={styles.actions}>
        <Button variant="filled" size="medium" sx={styles.logoutBtn} onClick={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? 'Виходимо...' : 'Вийти'}
        </Button>
        <Button variant="outlined" size="medium" color="primary" onClick={onClose} disabled={isLoggingOut}>
          Скасувати
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutModal;
