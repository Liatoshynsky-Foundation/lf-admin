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

  localizationsBadge: {
    backgroundColor: 'green.600',
    color: 'adminBlue.50',

    display: 'flex',
    alignItems: 'center',
    borderRadius: '15px',
    gap: '4px',
    fontWeight: 500,
    fontSize: '14px',

    '& svg': {
      color: 'inherit'
    }
  },

  draftBadge: {
    backgroundColor: 'red.200',

    display: 'flex',
    padding: '4px 8px',
    borderRadius: '15px',
    gap: '4px',
    fontSize: '14px',
    fontWeight: 500
  }
};

export default styles;
