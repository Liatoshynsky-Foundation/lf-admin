/* eslint-disable indent */
import { Box, Chip } from '@mui/material';
import { CircleCheckBig } from 'lucide-react';

import { ContentType } from './ContentCard';
import { badgeColors, styles } from './ContentCardBadge.styles';
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

  const localizationLabel = getLocalizations(localizations);

  return (
    <Box sx={styles.badgeContainer}>
      <Chip
        label={getContentTypeLabel(type)}
        size="small"
        variant="filled"
        sx={{ backgroundColor: badgeColors[type] }}
      ></Chip>

      <Chip
        icon={<CircleCheckBig size={15} />}
        label={localizationLabel || ''}
        size="small"
        variant="filled"
        sx={{
          ...styles.localizationsBadge,
          ...(!localizationLabel && {
            '& .MuiChip-label': {
              display: 'none'
            },
            '& .MuiChip-icon, & svg': {
              margin: 0,
              color: 'inherit'
            },
            padding: '6px'
          })
        }}
      ></Chip>

      {status === BaseContentStatuses.Draft && (
        <Chip
          label={`Чернетка ${localizationLabel ? localizationLabel : ''}`.trim()}
          size="small"
          variant="filled"
          sx={styles.draftBadge}
        />
      )}
    </Box>
  );
};
export default ContentCardBadge;
