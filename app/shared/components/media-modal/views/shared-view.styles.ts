import type { SxProps, Theme } from '@mui/material';

export const sharedViewStyles = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  } as SxProps<Theme>,

  header: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    paddingBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    '@media (max-width: 1023px)': {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '16px'
    }
  } as SxProps<Theme>,

  title: {
    color: 'white',
    flexShrink: 0,
    whiteSpace: 'nowrap',
    '@media (max-width: 1023px)': {
      width: '100%'
    }
  } as SxProps<Theme>,

  controlsGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    alignItems: 'center',
    marginLeft: 'auto',
    '@media (max-width: 1023px)': {
      marginLeft: 0,
      width: '100%',
      '& > *:first-of-type': {
        flexBasis: '100%'
      }
    }
  } as SxProps<Theme>,

  gridContainer: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    '&::-webkit-scrollbar': {
      display: 'none'
    },
    scrollbarWidth: 'none',
    msOverflowStyle: 'none'
  } as SxProps<Theme>
};
