import { Box, Stack } from '@mui/material';
import type { ReactNode } from 'react';

import { styles } from './ControlPanel.styles';

type ControlPanelProps = Readonly<{
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  dataTestId?: string;
}>;

export function ControlPanel({ leftContent, rightContent, dataTestId = 'ControlPanel' }: ControlPanelProps) {
  return (
    <Stack direction="row" sx={styles.root} data-testid={dataTestId}>
      <Box sx={styles.left}>{leftContent}</Box>
      <Box sx={styles.right}>{rightContent}</Box>
    </Stack>
  );
}
