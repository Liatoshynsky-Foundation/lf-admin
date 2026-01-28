import { SxProps, Theme } from '@mui/material';

export const styles = {
  card: {
    height: '344px',
    width: '301px',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '16px',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: 4
    }
  } as SxProps<Theme>,

  cardActionArea: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    p: 0
  } as SxProps<Theme>,

  cardMedia: {
    objectFit: 'cover',
    flexShrink: 0
  } as SxProps<Theme>,

  chipContainer: {
    display: 'flex',
    gap: 1,
    px: 2,
    pt: 1.5,
    flexWrap: 'wrap'
  } as SxProps<Theme>,

  chip: {
    fontSize: '14px',
    color: '#190D03',
    height: '28px'
  } as SxProps<Theme>,

  cardContent: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    px: 2,
    pt: 1,
    pb: '12px !important',
    height: 'calc(100% - 140px)',
    overflow: 'hidden'
  } as SxProps<Theme>,

  title: {
    fontWeight: 600,
    fontSize: '18px',
    lineHeight: 1.3,
    mb: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    minHeight: '2.47em',
    flexShrink: 0
  } as SxProps<Theme>,

  metaContainer: {
    mb: 1,
    flexShrink: 0
  } as SxProps<Theme>,

  caption: {
    fontSize: '0.7rem'
  } as SxProps<Theme>,

  viewsCaption: {
    ml: 1.5,
    fontSize: '0.7rem'
  } as SxProps<Theme>,

  button: {
    flexShrink: 0,
    py: 0.75,
    fontSize: '0.875rem'
  } as SxProps<Theme>
};
