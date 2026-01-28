import { Box, Chip } from '@mui/material';

import { styles } from './ContentCard.styles';

interface ContentCardChipsProps {
  contentType: 'news' | 'event' | 'media';
  status: string;
}

const getContentTypeLabel = (contentType: 'news' | 'event' | 'media'): string => {
  /* eslint-disable */
  switch (contentType) {
    case 'news':
      return 'Новина';
    case 'event':
      return 'Подія';
    case 'media':
      return 'Медіа';
    default:
      return 'Новини';
  }
};

const getStatusLabel = (status: string): string => {
  /* eslint-disable */
  switch (status.toLowerCase()) {
    case 'published':
      return 'Опубліковано';
    case 'draft':
      return 'Чернетка';
    case 'hidden':
      return 'Приховано';
    case 'archived':
      return 'Архів';
    case 'editing':
      return 'Редагування';
    default:
      return status;
  }
};

const getContentTypeColor = (contentType: 'news' | 'event' | 'media'): string => {
  /* eslint-disable */
  switch (contentType) {
    case 'news':
      return '#93CCF4';
    case 'event':
      return '#EC93F4';
    case 'media':
      return '#FCBD28';
    default:
      return '#93CCF4';
  }
};

const getStatusColor = (status: string): string => {
  /* eslint-disable */
  switch (status.toLowerCase()) {
    case 'published':
      return '#13A818';
    case 'draft':
      return '#F4A593';
    case 'hidden':
      return '#F4A593';
    case 'archived':
      return '#F4A593';
    case 'editing':
      return '#F4A593';
    default:
      return '#F4A593';
  }
};

export function ContentCardChips({ contentType, status }: Readonly<ContentCardChipsProps>) {
  return (
    <Box sx={styles.chipContainer}>
      <Chip
        label={getContentTypeLabel(contentType)}
        size="small"
        variant="filled"
        sx={{
          ...styles.chip,
          backgroundColor: getContentTypeColor(contentType),
          color: '#190D03',
          '&:hover': {
            backgroundColor: getContentTypeColor(contentType)
          }
        }}
      />
      <Chip
        label={getStatusLabel(status)}
        size="small"
        sx={{
          ...styles.chip,
          backgroundColor: getStatusColor(status),
          color: '#190D03',
          '&:hover': {
            backgroundColor: getStatusColor(status)
          }
        }}
      />
    </Box>
  );
}
