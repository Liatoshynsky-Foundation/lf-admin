import { Autocomplete, IconButton, Stack,TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';
import { CloudUpload, Trash2 } from 'lucide-react';
import React from 'react';

import { styles } from './ActionableSuggestItem.style';

interface ActionableSuggestItemProps {
  suggestions: string[];
  onUpload: () => void;
  onDelete: () => void;
  onSelect: (value: string | null) => void;
  mode?: 'audio' | 'notes';
  value?: string | null;
  date: Dayjs | null;
  onDateChange: (newDate: Dayjs | null) => void;
}

const ActionableSuggestItem: React.FC<ActionableSuggestItemProps> = ({
  suggestions,
  onUpload,
  onDelete,
  onSelect,
  mode = 'audio',
  value = null,
  date = null,
  onDateChange,
}) => {
  const label = mode === 'audio' ? 'Назва аудіо *' : 'Назва нот *';
  const placeholder = mode === 'audio' ? 'Введіть назву нот' : 'Введіть назву аудіо';

  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={styles.container}>
      <Autocomplete
        options={suggestions}
        value={value}
        onChange={(_, newValue) => onSelect(newValue)}
        fullWidth
        freeSolo
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            sx={styles.inputRoot}
          />
        )}
      />

      {mode === 'notes' && (
        <DatePicker
          label="Дата видання *"
          format="DD/MM/YYYY"
          value={date}
          onChange={(newValue) => onDateChange?.(newValue)}
          sx={styles.datePicker}
        />
      )}

      <IconButton onClick={onUpload} sx={styles.iconButton}>
        <CloudUpload />
      </IconButton>
      <IconButton onClick={onDelete} sx={styles.iconButton}>
        <Trash2 />
      </IconButton>
    </Stack>
  );
};

export default ActionableSuggestItem;
