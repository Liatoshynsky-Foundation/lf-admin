import { Autocomplete, IconButton, Stack, TextField } from '@mui/material';
import { CloudUpload, Trash2 } from 'lucide-react';
import React from 'react';

import { suggestItemConfigs, SuggestItemMode } from './ActionableSuggestItem.config';
import { styles } from './ActionableSuggestItem.style';


interface ActionableSuggestItemProps {
  suggestions: string[];
  onUpload: () => void;
  onDelete: () => void;
  onSelect: (value: string | null) => void;
  mode?: SuggestItemMode;
  value?: string | null;
}

const ActionableSuggestItem: React.FC<ActionableSuggestItemProps> = ({
  suggestions,
  onUpload,
  onDelete,
  onSelect,
  mode = 'audio',
  value = null,
}) => {
  const config = suggestItemConfigs[mode];
  const label = config.label;
  const placeholder = config.placeholder;

  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={styles.container}>
      <Autocomplete
        options={suggestions}
        value={value}
        onChange={(_, newValue) => onSelect(newValue)}
        freeSolo
        fullWidth
        sx={styles.inputRoot}
        renderInput={(params) => <TextField {...params} label={label} placeholder={placeholder} variant="outlined" />}
      />

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
