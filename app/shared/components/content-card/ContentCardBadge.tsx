import { Box, Chip } from '@mui/material';
import { CircleCheckBig } from 'lucide-react';

import { ContentType } from './ContentCard';
import { styles } from './ContentCardBadge.styles';
import { getLocalizations } from '~/lib/utils/localizations';
import { BaseContentStatuses } from '~/types/enums/common.enums';
interface ContentCardBadgeProps {
  type: ContentType;
  status: string;
  localizations: Array<string>;
}

const ContentCardBadge = ({ type, status, localizations }: ContentCardBadgeProps) => {
  const getContentTypeLabel = (contentType: ContentType): string => {
    switch (contentType) {
    case 'news':
      return 'Новина';
    case 'events':
      return 'Подія';
    case 'media':
      return 'Ми у ЗМІ';
    }
  };

  const localizationLabel = getLocalizations(localizations);
  const hasLocalizationLabel = Boolean(localizationLabel);

  return (
    <Box sx={styles.badgeContainer}>
      <Chip
        label={getContentTypeLabel(type)}
        size="small"
        variant="filled"
        sx={styles.typeBadge(type)}
      ></Chip>

      {status === BaseContentStatuses.Published && 
      <Box
        sx={styles.localizationsBadge(hasLocalizationLabel)}
      >
        <CircleCheckBig size={15} />
        {localizationLabel && <Box>{localizationLabel}</Box>}
      </Box>}

      {status === BaseContentStatuses.Draft && (
        <Box sx={styles.draftBadge}>
          {`Чернетка ${localizationLabel || ''}`.trim()}
        </Box>
      )}
    </Box>
  );
};
export default ContentCardBadge;
