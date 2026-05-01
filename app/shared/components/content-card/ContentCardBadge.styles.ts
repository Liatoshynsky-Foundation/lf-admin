import { ContentType } from './ContentCard';
import { chipsColors } from '~/shared/theme/colors';

export const badgeColors: Record<ContentType, string> = {
  news: chipsColors.newsChipBg,
  event: chipsColors.eventChipBg,
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
    '& .MuiChip-icon': {
      color: 'inherit'
    }
  },
  draftBadge: {
    backgroundColor: 'red.200'
  }
};

export default styles;
