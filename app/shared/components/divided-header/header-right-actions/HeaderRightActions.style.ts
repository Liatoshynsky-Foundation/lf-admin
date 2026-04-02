import { SxProps, Theme } from '@mui/material';

const COLORS = {
  textBlack: '#190D03',
  yellow: '#FCBD28',
  yellowHover: '#F59E0B',
  grayBg: '#E2E8F0',
  grayHover: '#CBD5E1',
  textGray: '#63666E',
  borderGray: '#63666E'
};

export const styles = {
  pillRadius: '28px',

  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  } as SxProps<Theme>,

  pill: (variant: 'yellow' | 'outline' = 'yellow'): SxProps<Theme> => {
    const variants: Record<string, SxProps<Theme>> = {
      yellow: {
        bgcolor: COLORS.yellow,
        color: COLORS.textBlack,
        '&:hover': { bgcolor: COLORS.yellowHover }
      },
      outline: {
        color: COLORS.textGray,
        borderColor: COLORS.borderGray
      }
    };

    return {
      borderRadius: '28px',
      textTransform: 'none',
      height: '40px',
      fontSize: '16px',
      '&.Mui-disabled': {
        border: 'none',
        bgcolor: COLORS.grayBg,
        color: COLORS.textGray
      },
      ...variants[variant]
    };
  },

  group: {
    gap: '2px',
    '& .MuiButtonGroup-grouped,  & .MuiIconButton-root': {
      bgcolor: COLORS.yellow,
      color: COLORS.textBlack,
      textTransform: 'none',
      fontSize: '16px',
      fontWeight: 500,
      lineHeight: '150%',
      border: 'none',
      '&.Mui-disabled': {
        border: 'none',
        bgcolor: COLORS.grayBg,
        color: COLORS.textGray
      },
      '&:hover': { bgcolor: COLORS.yellowHover }
    }
  } as SxProps<Theme>,

  groupLeft: { borderRadius: '28px 0 0 28px', px: 3 } as SxProps<Theme>,
  groupRight: { borderRadius: '0 28px 28px 0', p: '8px 24px 8px 14px' } as SxProps<Theme>
};
