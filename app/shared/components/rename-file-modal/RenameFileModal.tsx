import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Dialog, IconButton, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { renameFileModalStyles as styles } from './RenameFileModal.styles';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';
import { useUpdateAssetMutation } from '~/types/graphql/generated/graphql';

export type RenameFileModalProps = {
  open: boolean;
  onClose: () => void;
  fileId: string;
  currentFilename: string;
  onRename?: (fileId: string, filename: string) => Promise<void> | void;
};

const INVALID_FILENAME_MESSAGE = 'Введіть назву файлу без крапки та розширення';

export function RenameFileModal({ open, onClose, fileId, currentFilename, onRename }: Readonly<RenameFileModalProps>) {
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
  const hasInvalidChars = /[\\/:*?"<>|.]/.test(baseName);

  useEffect(() => {
    if (open) {
      setBaseName(initialBaseName);
    }
  }, [open, initialBaseName]);

  const handleSave = async () => {
    if (hasInvalidChars) {
      toast.error(INVALID_FILENAME_MESSAGE);
      return;
    }

    const trimmedBaseName = baseName.trim();
    const newFilename = trimmedBaseName + extension;

    if (!trimmedBaseName || newFilename === currentFilename) {
      onClose();
      return;
    }

    try {
      if (onRename) {
        await onRename(fileId, newFilename);
        onClose();
        toast.success('Файл успішно перейменовано');
        return;
      }

      await updateAsset({
        variables: {
          id: fileId,
          input: { filename: newFilename }
        }
      });
      onClose();
      toast.success('Файл успішно перейменовано');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Помилка при перейменуванні файлу');
    }
  };

  const isUnchanged = baseName.trim() === initialBaseName;

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
        <Typography variant="h6" sx={styles.renameFileText}>
          Перейменувати файл
        </Typography>
        <IconButton onClick={onClose} disabled={loading} sx={styles.renameFileIcon}>
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
          helperText={hasInvalidChars ? INVALID_FILENAME_MESSAGE : ''}
        />
      </Box>

      <Box sx={styles.actions}>
        <Button
          onClick={handleSave}
          disabled={loading || hasInvalidChars || !baseName.trim() || isUnchanged}
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
