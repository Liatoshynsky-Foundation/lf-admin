'use client';

import { Box, Typography } from '@mui/material';

import type { UsedRendererProps } from '../../MediaModal.renderers';
import { sharedViewStyles } from '../shared-view.styles';
import Alert from '~/shared/components/design-system/alert/Alert';

export function UsedView(_props: Readonly<UsedRendererProps>) {
  return (
    <Box data-testid="UsedView" sx={sharedViewStyles.container}>
      <Box sx={sharedViewStyles.header}>
        <Typography variant="h6" sx={sharedViewStyles.title}>
          Зображення на сторінці
        </Typography>
      </Box>

      <Box sx={sharedViewStyles.gridContainer}>
        <Alert
          severity="info"
          variant="outlined"
          title="Вкладка тимчасово недоступна"
          description="Дана вкладка не підключена до джерела даних. В майбутньому цей недолік буде виправлено."
        />
      </Box>
    </Box>
  );
}
