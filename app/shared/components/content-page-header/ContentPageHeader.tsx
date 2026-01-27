'use client';

import { Box, Stack, Typography } from '@mui/material';

import { styles } from './ContentPageHeader.styles';

type Props = {
  title: string;
};

export const ContentPageHeader = ({ title }: Props) => {
  return (
    <Box sx={styles.container}>
      <Box>
        <Typography variant="h5" fontWeight="bold" mb={0.5}>
          {title}
        </Typography>
      </Box>

      <Stack
        width="100%"
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
      ></Stack>
    </Box>
  );
};
