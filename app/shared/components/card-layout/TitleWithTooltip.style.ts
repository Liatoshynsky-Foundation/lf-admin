import { SxProps, Theme } from '@mui/material';

const styles = {
  title: (lineClamp: number = 2, fontWeight: number = 700): SxProps<Theme> => ({
    fontWeight: fontWeight,
    color: 'text.primary',
    flex: 1,
    minWidth: 0,
    display: '-webkit-box',
    WebkitLineClamp: lineClamp,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  }),
};

export default styles;