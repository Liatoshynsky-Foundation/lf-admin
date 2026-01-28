'use client';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import { styles } from './InlineEditableDate.styles';

type InlineEditableDateProps = {
  value?: string | null;
  onSave: (newValue: string) => Promise<void>;
  label?: string;
  disabled?: boolean;
  formatDisplay?: (date: string | null | undefined) => string;
};

const formatDateForInput = (dateString?: string | null): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return '';
  }
};

const formatDateForDisplay = (dateString?: string | null): string => {
  if (!dateString) return 'Не вказано';

  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'Невірний формат дати';

    return date.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Невірний формат дати';
  }
};

export const InlineEditableDate = ({
  value,
  onSave,
  label,
  disabled = false,
  formatDisplay
}: InlineEditableDateProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setEditValue(formatDateForInput(value));
  }, [value]);

  useEffect(() => {
    if (!editValue && !value) {
      setHasChanges(false);
      return;
    }

    if (!editValue || !value) {
      setHasChanges(true);
      return;
    }

    const originalDate = new Date(value).getTime();
    const currentDate = new Date(editValue).getTime();

    if (Number.isNaN(originalDate) || Number.isNaN(currentDate)) {
      setHasChanges(editValue !== formatDateForInput(value));
      return;
    }

    setHasChanges(originalDate !== currentDate);
  }, [editValue, value]);

  const handleEditClick = () => {
    if (disabled) return;
    setIsEditing(true);
    setEditValue(formatDateForInput(value));
    setError(null);
  };

  const handleCancel = () => {
    setEditValue(formatDateForInput(value));
    setIsEditing(false);
    setError(null);
    setHasChanges(false);
  };

  const handleSave = async () => {
    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    if (!editValue) {
      setError('Будь ласка, оберіть дату');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const date = new Date(editValue);
      if (Number.isNaN(date.getTime())) {
        setError('Невірний формат дати');
        return;
      }

      const isoDate = date.toISOString();
      await onSave(isoDate);
      setIsEditing(false);
      setHasChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const displayValue = formatDisplay ? formatDisplay(value) : formatDateForDisplay(value);

  if (isEditing) {
    return (
      <Box sx={styles.editContainer}>
        {label && <Typography sx={styles.label}>{label}</Typography>}
        <TextField
          type="datetime-local"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          disabled={isSaving}
          error={!!error}
          helperText={error}
          size="small"
          fullWidth
          sx={styles.datePicker}
          slotProps={{
            inputLabel: {
              shrink: true
            }
          }}
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
      <Box sx={styles.valueContainer}>
        <Typography variant="body1">{displayValue}</Typography>
        {!disabled && <EditIcon sx={styles.editIcon} fontSize="small" />}
      </Box>
    </Box>
  );
};
