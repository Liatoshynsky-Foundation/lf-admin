import { SxProps, Theme } from '@mui/material';

import contentCardStyles from '~/shared/components/content-card/ContentCard.styles';

export const styles = {
  statusText: {
    ...contentCardStyles.date,
    fontSize: '14px',
    fontStyle: 'italic',
    mt: 0,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
} satisfies Record<string, SxProps<Theme>>;

export const getStatusWithDateWrapper = (dividerColor: string): SxProps<Theme> => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  pl: '10px',
  pr: '4px',
  borderLeft: `1px solid ${dividerColor}`,
  minWidth: 0
});
