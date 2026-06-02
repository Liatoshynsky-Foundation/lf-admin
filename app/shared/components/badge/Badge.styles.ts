import { SxProps } from '@mui/material';

import { BadgeVariant } from './Badge';
import { chipsColors } from '~/shared/theme/colors';

export const badgeColors = {
  news: chipsColors.newsChipBg,
  events: chipsColors.eventChipBg,
  media: chipsColors.mediaChipBg,
  draft: chipsColors.draft,
  published: chipsColors.published
};

const badgeConfigs: Partial<Record<BadgeVariant, SxProps>> = {
  published: { color: 'adminBlue.50', borderRadius: '15px' },
};

const baseBadgeStyles = {
  display:'inline-flex',
  justifyContent: 'center',
  alignItems:'center',
  gap: '4px',
  height: '28px',
  flexShrink: 0,
  typography: 'subtitle2',
  '& svg': {
    color: 'inherit'
  },
  color: 'black', 
  borderRadius: '20px'
};

const getBadgeStyles = (type: BadgeVariant, hasLabel: boolean): SxProps => 
  ({
    ...baseBadgeStyles,
    padding: hasLabel ? '5px 8px' : '6px', 
    backgroundColor: badgeColors[type],
    ...badgeConfigs[type],
  });


export default getBadgeStyles;
