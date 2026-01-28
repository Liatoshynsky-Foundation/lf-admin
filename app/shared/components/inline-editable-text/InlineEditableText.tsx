'use client';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import { styles } from './InlineEditableText.styles';

type InlineEditableTextProps = {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  label?: string;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  variant?: 'body1' | 'body2' | 'h6' | 'subtitle1';
  disabled?: boolean;
};

export const InlineEditableText = ({
  value,
  onSave,
  label,
  multiline = false,
  rows = 1,
  placeholder = 'Не вказано',
  variant = 'body1',
  disabled = false
}: InlineEditableTextProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    setHasChanges(editValue !== value);
  }, [editValue, value]);

  const handleEditClick = () => {
    if (disabled) return;
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    setError(null);
    setHasChanges(false);
  };

  const handleSave = async () => {
    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onSave(editValue);
      setIsEditing(false);
      setHasChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && !multiline && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <Box sx={styles.editContainer}>
        {label && <Typography sx={styles.label}>{label}</Typography>}
        <TextField
          fullWidth
          multiline={multiline}
          rows={multiline ? rows : 1}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          disabled={isSaving}
          error={!!error}
          helperText={error}
          size="small"
          sx={styles.textField}
        />
        <Box sx={styles.buttonGroup}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            startIcon={isSaving ? <CircularProgress size={16} /> : <CheckIcon />}
          >
            {isSaving ? 'Збереження...' : 'Зберегти'}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={handleCancel}
            disabled={isSaving}
            startIcon={<CloseIcon />}
          >
            Скасувати
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={styles.viewContainer} onClick={handleEditClick}>
      {label && <Typography sx={styles.label}>{label}</Typography>}
      <Box sx={styles.textContainer}>
        <Typography variant={variant} sx={styles.text}>
          {value || placeholder}
        </Typography>
        {!disabled && <EditIcon sx={styles.editIcon} fontSize="small" />}
      </Box>
    </Box>
  );
};
