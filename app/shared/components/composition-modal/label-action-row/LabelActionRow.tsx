import { Box, Button, Stack, SxProps,Theme, Typography } from '@mui/material';
import React from 'react';

import { styles } from './LabelActionRow.styles';
import { sxToArray } from '~/lib/utils/sxToArray';

interface Props {
  title?: string;
  action: () => void;
  sx?: SxProps<Theme>;
}

const LabelActionRow = ({ title = 'Текст', action, sx }: Props) => {
  return (
    <Stack direction="row" alignItems="center" spacing={2} sx={[styles.container, ...sxToArray(sx)]}>
      <Typography title={title} variant="subtitle2" sx={styles.title}>
        {title}
      </Typography>
      <Box sx={styles.horizontalDivider} />
      <Button variant="contained" disableElevation onClick={action} sx={styles.button}>
        {'Додати'}
      </Button>
    </Stack>
  );
};

export default LabelActionRow;
