import { mainHexPallete } from '~/shared/theme/colors';

export const styles = {
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '8px 12px',
    borderRadius: '8px',
    width: '242px',
    boxSizing: 'border-box',
    '&:hover': {
      backgroundColor: 'rgba(25, 13, 3, 0.06)'
    }
  },
  menuText: {
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '150%',
    color: mainHexPallete.black
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    color: mainHexPallete.black
  }
};
