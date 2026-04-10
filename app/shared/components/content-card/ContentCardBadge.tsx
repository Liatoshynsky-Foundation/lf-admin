import { Box, Chip } from '@mui/material';
import { CircleCheckBig } from 'lucide-react';

import { ContentType } from './ContentCard';
import styles from './ContentCardBadge.styles';
import { getLocalizations } from '~/lib/utils/localizations';
import { BaseContentStatuses } from '~/types/enums/common.enums';
interface ContentCardBadgeProps {
  type: ContentType;
  status: string;
  localizations: Array<string>;
}

const ContentCardBadge = ({ type, status, localizations }: ContentCardBadgeProps) => {
  const getContentTypeLabel = (contentType: 'news' | 'event' | 'media'): string => {
    switch (contentType) {
    case 'news':
      return 'Новина';
    case 'event':
      return 'Подія';
    case 'media':
      return 'Ми у ЗМІ';
    }
  };

  const getContentTypeColor = (contentType: 'news' | 'event' | 'media'): string => {
    switch (contentType) {
    case 'news':
      return '#93CCF4';
    case 'event':
      return '#EC93F4';
    case 'media':
      return '#B6F7CF';
    }
  };

  const localizationLabel = getLocalizations(localizations);

  return (
    <Box sx={styles.badgeContainer}>
      <Chip
        label={getContentTypeLabel(type)}
        size="small"
        variant="filled"
        sx={{ backgroundColor: getContentTypeColor(type) }}
      ></Chip>
      <Box
        sx={{
          ...styles.localizationsBadge,
          padding: localizationLabel ? '4px 8px' : '4px 6px'
        }}
      >
        <CircleCheckBig size={15} />
        {getLocalizations(localizations) && <Box>{getLocalizations(localizations)}</Box>}
      </Box>
      {status === BaseContentStatuses.Draft && <Box sx={styles.draftBadge}>Чернетка {getLocalizations(localizations)}</Box>}
    </Box>
  );
};
export default ContentCardBadge;
