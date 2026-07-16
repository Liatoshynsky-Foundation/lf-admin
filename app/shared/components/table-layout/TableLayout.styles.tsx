import { SxProps, Theme } from '@mui/material';

export const tableDividerColor = 'blue.200';
export const tableBorderWidth = '2px';

export const tableGap = '16px';

export const singleLineEllipsis = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
} satisfies SxProps<Theme>;

export const twoLineEllipsis = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  wordBreak: 'break-word'
} satisfies SxProps<Theme>;

export const tableText = {
  fontSize: '16px',
  fontWeight: 600,
  lineHeight: '150%'
} satisfies SxProps<Theme>;

export const alignToJustify: Record<'left' | 'center' | 'right', string> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end'
};
