import type { SxProps, Theme } from '@mui/material';

export const usedViewStyles = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  } as SxProps<Theme>,

  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '26px',
    paddingTop: '4px'
  } as SxProps<Theme>,

  title: {
    fontFamily: 'Mulish',
    fontWeight: 700,
    fontSize: '24px',
    lineHeight: '140%',
    letterSpacing: 0,
    color: '#FCFCFC',
    flexShrink: 0,
    whiteSpace: 'nowrap'
  } as SxProps<Theme>,

  controlsGroup: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    marginLeft: 'auto'
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
