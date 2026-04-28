import { SxProps, Theme } from '@mui/material';

const styles: Record<string, SxProps<Theme>> = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    width: '366px',
    height: '344px',          
    borderRadius: '12px',
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    border: '1px solid rgba(0, 0, 0, 0.08)',
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: '8px',
    p: '12px',
    overflow: 'hidden',
    '&:last-child': {
      pb: '12px',
    },
  },
  mainInfo: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '4px',
    overflow: 'hidden',
  },
  title: {
    fontSize: '18px',
    fontWeight: 700,
    fontFamily: 'Mulish, sans-serif',
    fontStyle: 'normal',
    lineHeight: 1.5,            // 150%
    letterSpacing: '0px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    flex: 1,
    minWidth: 0,
  },
  date: {
    fontSize: '12px',
    color: 'rgba(0, 0, 0, 0.45)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    mt: 'auto',
  },
};

export default styles;