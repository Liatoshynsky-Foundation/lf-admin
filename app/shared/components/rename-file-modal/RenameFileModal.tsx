import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Dialog, IconButton, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
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
  const { initialBaseName, extension } = useMemo(() => {
    const lastDotIndex = currentFilename.lastIndexOf('.');
    const hasExtension = lastDotIndex > 0;

    return {
      initialBaseName: hasExtension ? currentFilename.substring(0, lastDotIndex) : currentFilename,
      extension: hasExtension ? currentFilename.substring(lastDotIndex) : ''
    };
  }, [currentFilename]);

  const [baseName, setBaseName] = useState(initialBaseName);
  const [updateAsset, { loading }] = useUpdateAssetMutation();
  const hasInvalidChars = /[\\/:*?"<>|]/.test(baseName);

  useEffect(() => {
    if (open) {
      setBaseName(initialBaseName);
    }
  }, [open, initialBaseName]);

  const handleSave = async () => {
    const trimmedBaseName = baseName.trim();
    const newFilename = trimmedBaseName + extension;

    if (!trimmedBaseName || newFilename === currentFilename || hasInvalidChars) {
      onClose();
      return;
    }

    if (!trimmedBaseName || newFilename === currentFilename) {
      onClose();
      return;
    }

    try {
      await updateAsset({
        variables: {
          id: fileId,
          input: { filename: newFilename }
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
      onClose={loading ? undefined : onClose}
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
          value={baseName}
          onChange={(e) => setBaseName(e.target.value)}
          disabled={loading}
          error={hasInvalidChars}
          helperText={hasInvalidChars ? 'Ім\'я файлу містить заборонені символи: \\ / : * ? " < > |' : ''}
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
          disabled={loading || hasInvalidChars || !baseName.trim()}
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
