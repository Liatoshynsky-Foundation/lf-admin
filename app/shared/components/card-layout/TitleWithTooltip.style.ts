import { SxProps, Theme } from '@mui/material';

const styles = {
  title: (lineClamp: number = 2, fontWeight: number = 700, fontSize?: number): SxProps<Theme> => ({
    fontWeight: fontWeight,
    ...(fontSize ? { fontSize: `${fontSize}px` } : {}),
    color: 'text.primary',
    flex: 1,
    minWidth: 0,
    display: '-webkit-box',
    WebkitLineClamp: lineClamp,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    wordBreak: 'break-word'
  }),
};

export default styles;