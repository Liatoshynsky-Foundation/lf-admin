import { SxProps, Theme } from '@mui/material';

// export const HORIZONTAL_ROW_DIVIDER_COLOR = 'blue.100';
export const HORIZONTAL_ROW_DIVIDER_COLOR = '#D9DCE866';
export const ACTIONS_COLUMN_WIDTH = '80px';
export const BORDER = `2px solid ${HORIZONTAL_ROW_DIVIDER_COLOR}`;

export const TABLE_GAP = '16px';

export const SINGLE_LINE_ELLIPSIS = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
} satisfies SxProps<Theme>;

export const TWO_LINE_ELLIPSIS = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  wordBreak: 'break-word'
} satisfies SxProps<Theme>;

export const TABLE_TEXT = {
  fontSize: '16px',
  fontWeight: 600,
  lineHeight: '150%'
} satisfies SxProps<Theme>;
