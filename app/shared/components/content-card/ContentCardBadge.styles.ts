import { SxProps } from '@mui/material';

import { ContentType } from './ContentCard';
import { chipsColors } from '~/shared/theme/colors';

export const badgeColors: Record<ContentType, string> = {
  news: chipsColors.newsChipBg,
  events: chipsColors.eventChipBg,
  media: chipsColors.mediaChipBg
};

export const styles = {
  badgeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px'
  },

  typeBadge: (type: ContentType): SxProps => ({
    backgroundColor: badgeColors[type],
    padding: '5.5px 8px'
  }),

  localizationsBadge: (hasLabel: boolean): SxProps => ({
    backgroundColor: 'green.600',
    color: 'adminBlue.50',

    display: 'flex',
    alignItems: 'center',
    borderRadius: '15px',
    gap: '4px',
    typography: 'subtitle2',

    padding: hasLabel ? '4px 8px' : '7px',

    '& svg': {
      color: 'inherit'
    }
  }),

  draftBadge: {
    backgroundColor: 'red.200',

    display: 'flex',
    padding: '4px 8px',
    borderRadius: '15px',
    gap: '4px',
    typography: 'subtitle2'
  }
};

export default styles;
