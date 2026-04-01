import { Box, Chip } from '@mui/material';
import Image from 'next/image';

import { ContentType } from './ContentCard';
import styles from './ContentCardBadge.styles';
import { getLocalizations } from '~/lib/utils/localizations';

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

  return (
    <Box sx={styles.badgeContainer}>
      <Chip
        label={getContentTypeLabel(type)}
        size="small"
        variant="filled"
        sx={{ backgroundColor: getContentTypeColor(type) }}
      ></Chip>
      <Box sx={styles.localizationsBadge}>
        <Image src="/icons/circleCheckBig.svg" alt="check" width={15} height={15}></Image>
        {getLocalizations(localizations) && <Box>{getLocalizations(localizations)}</Box>}
      </Box>
      {status === 'draft' && <Box sx={styles.draftBadge}>Чернетка {getLocalizations(localizations)}</Box>}
    </Box>
  );
};
export default ContentCardBadge;
