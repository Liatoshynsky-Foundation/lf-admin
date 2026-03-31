import { Box, Collapse, Stack } from '@mui/material';
import type { ReactNode } from 'react';

import { styles } from './ControlPanel.styles';

type ControlPanelProps = Readonly<{
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  bottomContent?: ReactNode;
  isBottomOpen?: boolean;
  dataTestId?: string;
}>;

export function ControlPanel({
  leftContent,
  rightContent,
  bottomContent,
  isBottomOpen = false,
  dataTestId = 'ControlPanel'
}: ControlPanelProps) {
  const hasLeftContent = leftContent !== undefined && leftContent !== null;
  const hasRightContent = rightContent !== undefined && rightContent !== null;

  return (
    <Box sx={styles.wrapper} data-testid={dataTestId}>
      <Stack direction="row" sx={styles.root}>
        {hasLeftContent ? <Box sx={styles.left}>{leftContent}</Box> : null}
        {hasRightContent ? <Box sx={styles.right}>{rightContent}</Box> : null}
      </Stack>

      {bottomContent && (
        <Collapse in={isBottomOpen} timeout={220} unmountOnExit>
          <Box sx={styles.bottom}>{bottomContent}</Box>
        </Collapse>
      )}
    </Box>
  );
}
