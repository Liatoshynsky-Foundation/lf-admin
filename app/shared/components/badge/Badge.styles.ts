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

const styles = {
  typeBadge: (type: BadgeVariant, hasLabel: boolean): SxProps => ({
    display:'inline-flex',
    justifyContent: 'center',
    alignItems:'center',
    gap: '4px',
    height: '28px',
    flexShrink: 0,
    padding: hasLabel  ? '5px 8px' : '6px', 
    
    typography: 'subtitle2',
    color: type === 'published' ? 'adminBlue.50' : 'black',
    borderRadius: type === 'published' ? '15px' : '20px',
    backgroundColor: badgeColors[type],
    
    '& svg': {
      color: 'inherit'
    }
  }),

  news:{},
  events: {},
  media: {}, 
  draft: {}, 
  published: {}
};

export default styles;
