import type { SxProps, Theme } from '@mui/material';

export const sharedViewStyles = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  } as SxProps<Theme>,

  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '24px',
    '@media (max-width: 1023px)': {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '16px'
    }
  } as SxProps<Theme>,

  title: {
    fontFamily: 'Mulish',
    fontWeight: 700,
    fontSize: '24px',
    lineHeight: '140%',
    letterSpacing: 0,
    color: '#FCFCFC',
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
