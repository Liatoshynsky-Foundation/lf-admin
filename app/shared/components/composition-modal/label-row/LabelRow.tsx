import { Box, Stack, SxProps, Theme, Typography } from '@mui/material';
import React, { ReactNode } from 'react';

import { styles } from './LabelRow.styles';
import { sxToArray } from '~/lib/utils/sxToArray';

interface Props {
  title?: string;
  children?: ReactNode;
  sx?: SxProps<Theme>;
}

const LabelRow = ({ title = 'Текст', children, sx }: Props) => {
  return (
    <Stack direction="row" alignItems="center" spacing={2} sx={[styles.container, ...sxToArray(sx)]}>
      <Typography title={title} variant="subtitle2" sx={styles.title}>
        {title}
      </Typography>
      <Box sx={styles.horizontalDivider} />
      {children}
    </Stack>
  );
};

export default LabelRow;
