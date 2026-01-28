'use client';

import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import { styles } from './NewsDetails.styles';
import { InlineEditableDate } from '~/shared/components/inline-editable-date/InlineEditableDate';
import { InlineEditableSelect } from '~/shared/components/inline-editable-select/InlineEditableSelect';
import { InlineEditableText } from '~/shared/components/inline-editable-text/InlineEditableText';
import { NewsStatus } from '~/types/enums/common.enums';

type NewsDetailsProps = {
  title: string;
  status: NewsStatus;
  publicationDate?: string;
  onTitleChange?: (newTitle: string) => Promise<void>;
  onStatusChange?: (newStatus: NewsStatus) => Promise<void>;
  onPublicationDateChange?: (newDate: string) => Promise<void>;
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

const STATUS_OPTIONS = [
  { value: NewsStatus.Draft, label: 'Чернетка' },
  { value: NewsStatus.Published, label: 'Опубліковано' },
  { value: NewsStatus.Hidden, label: 'Приховано' },
  { value: NewsStatus.Archived, label: 'Архівовано' },
  { value: NewsStatus.Editing, label: 'Редагується' }
];

export const NewsDetails = ({
  title,
  status,
  publicationDate,
  onTitleChange,
  onStatusChange,
  onPublicationDateChange
}: NewsDetailsProps) => {
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
        {onTitleChange ? (
          <InlineEditableText value={title} onSave={onTitleChange} variant="body1" placeholder="Введіть назву новини" />
        ) : (
          <Typography sx={styles.value}>{title}</Typography>
        )}
      </Box>

      <Box sx={styles.metadataRow}>
        <Typography sx={styles.label}>Статус:</Typography>
        {onStatusChange ? (
          <InlineEditableSelect
            value={status}
            options={STATUS_OPTIONS}
            onSave={(newStatus) => onStatusChange(newStatus as NewsStatus)}
            renderValue={(value) => (
              <Box sx={{ ...styles.statusBadge, ...getStatusStyles(value as NewsStatus) }}>
                {getStatusLabel(value as NewsStatus)}
              </Box>
            )}
          />
        ) : (
          <Box sx={{ ...styles.statusBadge, ...getStatusStyles(status) }}>{getStatusLabel(status)}</Box>
        )}
      </Box>

      <Box sx={styles.metadataRow}>
        <Typography sx={styles.label}>Дата публікації:</Typography>
        {onPublicationDateChange ? (
          <InlineEditableDate
            value={publicationDate}
            onSave={onPublicationDateChange}
            formatDisplay={(date) => (isMounted ? formatDate(date ?? undefined) : 'Завантаження...')}
          />
        ) : (
          <Typography sx={styles.value}>{isMounted ? formattedDate : 'Завантаження...'}</Typography>
        )}
      </Box>
    </Box>
  );
};
