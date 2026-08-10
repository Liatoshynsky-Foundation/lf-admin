import { Box, Stack, SxProps, Theme, Typography } from '@mui/material';
import { Trash2 } from 'lucide-react';
import { ReactNode } from 'react';

interface SectionDividerProps {
  children: ReactNode;
  onDelete?: () => void;
  sx?: SxProps<Theme>;
  testId?: string;
}

const SectionDivider = ({ children, onDelete, sx, testId }: SectionDividerProps) => {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={sx}>
      <Typography sx={{ color: 'blue.800' }} variant="body2">
        {children}
      </Typography>

      <Box sx={{ height: '1px', bgcolor: 'blue.200', flexGrow: 1 }} />
      {onDelete && (
        <Box
          data-testid={testId}
          sx={{ marginLeft: '16px', cursor: 'pointer', color: 'blue.800' }}
          onClick={onDelete}
        >
          <Trash2 strokeWidth={1} size={20} />
        </Box>
      )}
    </Stack>
  );
};

export default SectionDivider;
