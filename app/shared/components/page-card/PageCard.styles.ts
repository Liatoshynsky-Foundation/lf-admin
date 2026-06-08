import { SxProps, Theme } from '@mui/material';


const styles: Record<string, SxProps<Theme>> = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '266px',
    width: '100%',
    maxWidth: '100%',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid',
    borderColor: 'blue.200',
    boxShadow: 0
  },

  imageContainer: {
    width: '100%',
    height: '148px',
    overflow: 'hidden',
  },

  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: '16px',
    p: '16px',
    overflow: 'hidden',
    '&:last-child': {
      pb: '16px'
    }
  },

  mainInfo: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '4px',
    overflow: 'hidden'
  },

  titleContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },

  title: {
    fontWeight: 700,
    color: 'text.primary',
    flex: 1,
    minWidth: 0,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  
  date: {
    color: 'blue.600',
    fontStyle: 'italic',
    mt: 'auto',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }
};

export default styles;
