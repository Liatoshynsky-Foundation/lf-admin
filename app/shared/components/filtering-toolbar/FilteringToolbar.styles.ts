import { alpha, SxProps } from '@mui/material';

import { mainHexPalette as colors } from '~/shared/theme/colors';

export const styles = {
  searchContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-start'
  },
  
  badge: {
    '& .MuiBadge-badge:not(.MuiBadge-invisible)': {
      top: '4px',
      fontSize: '14px',
      minWidth: '22px',
      height: '22px',
      borderRadius: '50%',
      backgroundColor: 'red.700', 
      transform: 'translate(18px, -50%)'
    }
  },

  filterButton: (isFiltersOpen: boolean): SxProps => ({
    bgcolor: isFiltersOpen ? alpha(colors.black, 0.1) : colors.white,
    '&:hover': {
      bgcolor: isFiltersOpen ? alpha(colors.black, 0.1) : colors.blue[50]
    }
  }),

  tooltip: {
    minWidth: '153px',
    height: '28px',
    px: '16px',
    py: '4px',
    borderRadius: '20px',
    bgcolor: 'blue.900',
    fontStyle: 'italic',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  tooltipArrow: {
    color: 'blue.900'
  },

  clearButton: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    bgcolor: 'white',
    color: 'black',
    '&:hover': {
      bgcolor: 'white'
    },
    '&.Mui-disabled': {
      opacity: 0.5,
      color: 'black'
    }
  },

  bottomContentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },

  bottomContentRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  filtersList: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  }
};