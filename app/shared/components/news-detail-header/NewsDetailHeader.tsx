'use client';

import { Box, IconButton, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

import Button from '../design-system/button/Button';
import { styles } from './NewsDetailHeader.styles';
import ArrowLeftIcon from '~/public/icons/arrowLeft.svg';

type NewsDetailHeaderProps = {
  newsId: string;
};

export const NewsDetailHeader = ({ newsId }: NewsDetailHeaderProps) => {
  const router = useRouter();

  const handleBack = () => {
    router.push('/news');
  };

  const handleEdit = () => {
    router.push(`/news/${newsId}/edit`);
  };

  return (
    <Box sx={styles.container}>
      <Box sx={styles.titleSection}>
        <IconButton onClick={handleBack} sx={styles.backButton} aria-label="Back to all news">
          <ArrowLeftIcon />
        </IconButton>
        <Typography variant="h5" fontWeight="bold">
          Редагування новини
        </Typography>
      </Box>

      <Stack direction="row" spacing={2}>
        <Button variant="filled" color="primary" onClick={handleEdit}>
          Перейти до редагування
        </Button>
      </Stack>
    </Box>
  );
};
