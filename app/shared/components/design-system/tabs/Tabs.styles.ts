import type { SxProps, Theme } from '@mui/material';

const gutter = '24px';

export const styles: Record<string, SxProps<Theme>> = {
  container: {
    display: 'block',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    width: { xs: `calc(100% + ${gutter})`, sm: '100%' },
    mr: { xs: `-${gutter}`, sm: 0 },
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' }
  },

  root: {
    minWidth: 'max-content',

    '& .MuiTabs-flexContainer': {
      display: {
        xs: 'inline-flex',
        sm: 'flex'
      },

      width: {
        xs: 'max-content',
        sm: '100%'
      },

      whiteSpace: 'nowrap',
      position: 'relative'
    },

    '& .MuiTab-root': {
      flex: {
        xs: '0 0 auto',
        sm: '1 1 0'
      },

      padding: '12px 28px',
      typography: { xs: 'textMd', md: 'subtitle1'},
      whiteSpace: 'nowrap'
    }
  }
};
