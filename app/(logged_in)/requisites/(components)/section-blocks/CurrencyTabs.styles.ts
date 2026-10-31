import { type SxProps, type Theme } from '@mui/material';

import { buttonGroupColors } from '~/shared/theme/colors';

export const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    minHeight: '40px',
    gap: 2
  },
  tabsContainer: {
    display: 'flex',
    alignItems: 'center',
    maxWidth: 'calc(100% - 180px)',
    minWidth: 0,
    flexShrink: 1
  },
  groupCapsule: {
    display: 'inline-flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    rowGap: '4px',
    borderRadius: '24px',
    padding: '2px',
    backgroundColor: buttonGroupColors.primary.groupBackground,
    color: 'adminBlue.800',
    fontFamily: 'inherit',
    position: 'relative',
    width: 'fit-content',
    maxWidth: '100%',
    overflow: 'hidden'
  },
  indicator: {
    position: 'absolute',
    borderRadius: '9999px',
    backgroundColor: buttonGroupColors.primary.selectedButton,
    transition:
      'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), top 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 0,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)'
  },
  tabItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.75,
    borderRadius: '9999px',
    padding: '6px 14px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    position: 'relative',
    zIndex: 1,
    backgroundColor: 'transparent',
    transition: 'color 0.2s ease',
    border: 'none',
    outline: 'none'
  },
  tabItemActive: {
    color: buttonGroupColors.primary.selectedButtonText,
    fontWeight: 600,
    cursor: 'default'
  },
  tabItemInactive: {
    color: 'adminBlue.800',
    '&:hover': {
      color: 'text.primary'
    }
  },
  tabButton: {
    background: 'none',
    border: 'none',
    outline: 'none',
    color: 'inherit',
    font: 'inherit',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    padding: 0,
    margin: 0,
    cursor: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    userSelect: 'none'
  },
  tabInput: {
    backgroundColor: 'transparent',
    color: buttonGroupColors.primary.selectedButtonText,
    borderRadius: '9999px',
    border: 'none',
    outline: 'none',
    padding: 0,
    fontSize: '14px',
    fontWeight: 600,
    width: '70px',
    textAlign: 'center',
    fontFamily: 'inherit'
  },
  menuTrigger: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'inherit',
    cursor: 'pointer',
    padding: '2px',
    borderRadius: '4px',
    margin: 0,
    background: 'none',
    border: 'none',
    outline: 'none',
    transition: 'opacity 0.15s ease',
    '&:hover': {
      opacity: 0.75
    }
  },
  dividerLine: {
    flexGrow: 1,
    height: '1px',
    backgroundColor: 'adminBlue.200',
    minWidth: '24px'
  },
  actionButtonWrapper: {
    flexShrink: 0
  },
  addButton: {
    borderRadius: '24px',
    textTransform: 'none',
    fontWeight: 500,
    whiteSpace: 'nowrap'
  }
} satisfies Record<string, SxProps<Theme>>;
