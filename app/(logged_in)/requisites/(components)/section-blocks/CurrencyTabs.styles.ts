import { type SxProps, type Theme } from '@mui/material';

import { buttonGroupColors } from '~/shared/theme/colors';

export const styles = {
  wrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    minHeight: '40px'
  },
  dividerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    height: '1px',
    backgroundColor: 'adminBlue.200',
    zIndex: 0
  },
  tabsContainer: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
    backgroundColor: 'background.default',
    paddingRight: 2
  },
  groupCapsule: {
    display: 'inline-flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: '9999px',
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
    top: 3,
    height: 'calc(100% - 6px)',
    borderRadius: '9999px',
    backgroundColor: buttonGroupColors.primary.selectedButton,
    transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
    transition: 'opacity 0.15s ease',
    '&:hover': {
      opacity: 0.75
    }
  },
  actionButtonWrapper: {
    position: 'relative',
    zIndex: 1,
    backgroundColor: 'background.default',
    paddingLeft: 2,
    marginLeft: 'auto',
  },
  addButton: {
    borderRadius: '24px',
    textTransform: 'none',
    fontWeight: 500
  }
} satisfies Record<string, SxProps<Theme>>;
