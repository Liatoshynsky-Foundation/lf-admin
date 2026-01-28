'use client';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, CircularProgress, FormControl, MenuItem, Select, Typography } from '@mui/material';
import { useState } from 'react';

import { styles } from './InlineEditableSelect.styles';

type Option = {
  value: string;
  label: string;
  color?: string;
};

type InlineEditableSelectProps = {
  value: string;
  options: Option[];
  onSave: (newValue: string) => Promise<void>;
  label?: string;
  disabled?: boolean;
  renderValue?: (value: string) => React.ReactNode;
};

export const InlineEditableSelect = ({
  value,
  options,
  onSave,
  label,
  disabled = false,
  renderValue
}: InlineEditableSelectProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasChanges = editValue !== value;

  const handleEditClick = () => {
    if (disabled) return;
    setIsEditing(true);
    setEditValue(value);
    setError(null);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    setError(null);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <Box sx={styles.editContainer}>
        {label && <Typography sx={styles.label}>{label}</Typography>}
        <FormControl fullWidth size="small">
          <Select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            disabled={isSaving}
            error={!!error}
            sx={styles.select}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {error && (
          <Typography color="error" variant="caption">
            {error}
          </Typography>
        )}
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
        {renderValue ? renderValue(value) : <Typography variant="body1">{value}</Typography>}
        {!disabled && <EditIcon sx={styles.editIcon} fontSize="small" />}
      </Box>
    </Box>
  );
};
