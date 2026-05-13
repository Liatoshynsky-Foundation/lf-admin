import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { X } from 'lucide-react';

import { styles } from './DeleteFileModal.styles';
import Button from '~/components/design-system/button/Button';

export interface UsageRef {
  pageId?: string;
  blockId?: string;
}

export interface FileAsset {
  id: string;
  filename: string;
  usageRefs?: UsageRef[];
}

interface DeleteFileModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  file: FileAsset | null;
  isDeleting?: boolean;
  disableScrollLock?: boolean;
}

const formatUsageRef = (ref: UsageRef) => {
  const parts = [];
  if (ref.pageId) parts.push(ref.pageId);
  if (ref.blockId) parts.push(ref.blockId);
  return parts.length > 0 ? parts.join('/') : 'Невідомий блок';
};

const DeleteFileModal = ({ open, onClose, onConfirm, file, isDeleting, disableScrollLock }: DeleteFileModalProps) => {
  if (!file) return null;

  const blockedRefs = file.usageRefs || [];
  const isBlocked = blockedRefs.length > 0;

  const placesWord = blockedRefs.length === 1 ? 'місці' : 'місцях';

  return (
    <Dialog open={open} onClose={onClose} disableScrollLock={disableScrollLock} PaperProps={{ sx: styles.dialogPaper }}>
      <Box sx={styles.closeIcon} onClick={onClose}>
        <X />
      </Box>

      <DialogTitle sx={styles.title}>{isBlocked ? 'Видалення неможливе' : 'Підтвердити видалення'}</DialogTitle>

      <DialogContent sx={styles.content}>
        {isBlocked ? (
          <Box>
            <Typography sx={styles.description}>
              Файл{' '}
              <Box component="span" sx={styles.filename}>
                {file.filename}
              </Box>{' '}
              використовується на сайті і привʼязаний у {blockedRefs.length} {placesWord}. Щоб видалити файл відвʼяжіть
              його, замінивши зображення на інше на відповідних сторінках:
            </Typography>

            <Box component="ul" sx={styles.usageList}>
              {blockedRefs.map((ref, index) => {
                const uniqueKey = `${ref.pageId || 'no-page'}-${ref.blockId || 'no-block'}-${index}`;
                return (
                  <li key={uniqueKey}>
                    <Typography component="span" sx={styles.usageItem}>
                      {formatUsageRef(ref)}
                    </Typography>
                  </li>
                );
              })}
            </Box>
          </Box>
        ) : (
          <Typography sx={styles.description}>
            Ви збираєтесь видалити файл{' '}
            <Box component="span" sx={styles.filename}>
              {file.filename}
            </Box>
            .
            <br />
            Ви впевнені, що хочете продовжити?
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={styles.actions}>
        {isBlocked ? (
          <Button variant="filled" size="medium" sx={styles.okBtn} onClick={onClose}>
            Гаразд
          </Button>
        ) : (
          <>
            <Button
              variant="filled"
              size="medium"
              sx={styles.deleteBtn}
              onClick={() => onConfirm(file.id)}
              disabled={isDeleting}
            >
              Видалити
            </Button>
            <Button variant="outlined" size="medium" color="primary" onClick={onClose} disabled={isDeleting}>
              Скасувати
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DeleteFileModal;
