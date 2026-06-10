import { Box } from '@mui/material';
import { AlertCircle } from 'lucide-react';

export const renderHelperText = (text: string | null) => {
  if (!text) return null;
  return (
    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <AlertCircle size={14} />
      {text}
    </Box>
  );
};
