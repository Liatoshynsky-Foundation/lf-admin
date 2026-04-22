import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Dialog, IconButton,Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { renameFileModalStyles as styles } from './RenameFileModalStyles';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';
import { useUpdateAssetMutation } from '~/types/graphql/generated/graphql';

export type RenameFileModalProps = {
  open: boolean;
  onClose: () => void;
  fileId: string;
  currentFilename: string;
};

export function RenameFileModal({ open, onClose, fileId, currentFilename }: Readonly<RenameFileModalProps>) {
  const [filename, setFilename] = useState(currentFilename);
  const [updateAsset, { loading }] = useUpdateAssetMutation();

  useEffect(() => {
    if (open) {
      setFilename(currentFilename);
    }
  }, [open, currentFilename]);

  const handleSave = async () => {
    const trimmedName = filename.trim();

    if (!trimmedName || trimmedName === currentFilename) {
      onClose();
      return;
    }

    try {
      await updateAsset({
        variables: {
          id: fileId,
          input: { filename: trimmedName }
        }
      });

      onClose();
      toast.success('Файл успішно перейменовано');
    } catch {
      toast.error('Помилка при перейменуванні файлу');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={!loading ? onClose : undefined}
      disableScrollLock
      slotProps={{
        paper: {
          sx: styles.paper
        }
      }}
    >
      <Box sx={styles.header}>
        <Typography sx={styles.title}>Перейменувати файл</Typography>
        <IconButton onClick={onClose} disabled={loading} sx={{ color: 'text.primary', p: 0 }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={styles.inputContainer}>
        <CustomTextField
          fullWidth
          autoFocus
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          disabled={loading}
        />
      </Box>

      <Box sx={styles.actions}>
        <Button
          onClick={handleSave}
          disabled={loading}
          variant="contained"
          color="tertiary"
          size="medium"
          sx={styles.saveButton}
        >
          Зберегти
        </Button>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          color="primary"
          size="medium"
          sx={styles.cancelButton}
        >
          Скасувати
        </Button>
      </Box>
    </Dialog>
  );
}
