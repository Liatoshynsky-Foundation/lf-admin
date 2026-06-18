import { alpha } from '@mui/material/styles';

import { mainHexPalette as colors } from '~/shared/theme/colors';

export const styles = {
  editActionWrapper: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    mr: 0,
    flexShrink: 0,
  },
  editActionButton: {
    color: colors.black,
    width: '40px',
    height: '40px',
    p: 0,
    borderRadius: '50%',
    '& svg': { 
      width: '20px', 
      height: '20px',
    },
    '&:hover': {
      bgcolor: alpha(colors.black, 0.08),
    },
  },
};
