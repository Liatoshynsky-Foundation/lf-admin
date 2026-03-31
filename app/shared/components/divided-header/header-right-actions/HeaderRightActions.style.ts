import { SxProps, Theme } from '@mui/material';

const COLORS = {
  yellow: '#FCBD28',
  yellowHover: '#F59E0B',
  grayBg: '#E2E8F0',
  grayHover: '#CBD5E1',
  textGray: '#4B5563',
  borderGray: '#9CA3AF',
  outlineBorder: '#63666E'
};

export const styles = {
  pillRadius: '28px',

  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  } as SxProps<Theme>,

  pill: (variant: 'yellow' | 'outline' | 'gray' = 'yellow'): SxProps<Theme> => {
    const variants: Record<string, SxProps<Theme>> = {
      yellow: {
        bgcolor: COLORS.yellow,
        color: 'black',
        '&:hover': { bgcolor: COLORS.yellowHover }
      },
      outline: {
        color: COLORS.textGray,
        borderColor: COLORS.borderGray,
        '&:hover': { borderColor: COLORS.outlineBorder, bgcolor: 'transparent' }
      },
      gray: {
        bgcolor: COLORS.grayBg,
        color: COLORS.textGray,
        '&:hover': { bgcolor: COLORS.grayHover }
      }
    };

    return {
      borderRadius: '28px',
      textTransform: 'none',
      px: 3,
      py: 1,
      fontSize: '16px',
      ...variants[variant]
    };
  },

  group: {
    gap: '2px',
    '& .MuiButtonGroup-grouped,  & .MuiIconButton-root': {
      bgcolor: COLORS.yellow,
      color: 'black',
      textTransform: 'none',
      fontSize: '16px',
      fontWeight: 500,
      lineHeight: '150%',
      border: 'none',
      '&:hover': { bgcolor: COLORS.yellowHover }
    }
  } as SxProps<Theme>,

  groupLeft: { borderRadius: '28px 0 0 28px', px: 3 } as SxProps<Theme>,
  groupRight: { borderRadius: '0 28px 28px 0', p: '8px 24px 8px 14px' } as SxProps<Theme>
};
