'use client';

import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import { styles } from './NewsDetails.styles';
import { NewsStatus } from '~/types/enums/common.enums';

type NewsDetailsProps = {
  title: string;
  status: NewsStatus;
  publicationDate?: string;
};

const getStatusStyles = (status: NewsStatus) => {
  const statusStyleMap = {
    [NewsStatus.Draft]: styles.statusDraft,
    [NewsStatus.Published]: styles.statusPublished,
    [NewsStatus.Hidden]: styles.statusHidden,
    [NewsStatus.Archived]: styles.statusArchived,
    [NewsStatus.Editing]: styles.statusEditing
  };

  return statusStyleMap[status] || styles.statusDraft;
};

const getStatusLabel = (status: NewsStatus) => {
  const statusLabelMap = {
    [NewsStatus.Draft]: 'Чернетка',
    [NewsStatus.Published]: 'Опубліковано',
    [NewsStatus.Hidden]: 'Приховано',
    [NewsStatus.Archived]: 'Архівовано',
    [NewsStatus.Editing]: 'Редагується'
  };

  return statusLabelMap[status] || 'Невідомий статус';
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Не вказано';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Невірний формат дати';
  }
};

export const NewsDetails = ({ title, status, publicationDate }: NewsDetailsProps) => {
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setFormattedDate(formatDate(publicationDate));
  }, [publicationDate]);

  return (
    <Box sx={styles.container}>
      <Box sx={styles.metadataRow}>
        <Typography sx={styles.label}>Назва новини:</Typography>
        <Typography sx={styles.value}>{title}</Typography>
      </Box>

      <Box sx={styles.metadataRow}>
        <Typography sx={styles.label}>Статус:</Typography>
        <Box sx={{ ...styles.statusBadge, ...getStatusStyles(status) }}>{getStatusLabel(status)}</Box>
      </Box>

      <Box sx={styles.metadataRow}>
        <Typography sx={styles.label}>Дата публікації:</Typography>
        <Typography sx={styles.value}>{isMounted ? formattedDate : 'Завантаження...'}</Typography>
      </Box>
    </Box>
  );
};
