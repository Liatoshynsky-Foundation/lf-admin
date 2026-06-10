import { SxProps, Theme } from '@mui/material';

interface GridStyleArgs {
  xsCols?: number;
  smCols?: number;
  mdCols?: number;
  xlCols?: number;
  gap?: string | number;
}

export const styles = {
  grid: ({ xsCols = 1, smCols = 2, mdCols = 3, xlCols = 4, gap = '24px' }: GridStyleArgs): SxProps<Theme> => ({
    display: 'grid',
    gridTemplateColumns: {
      xs: `repeat(${xsCols}, minmax(0, 1fr))`, 
      sm: `repeat(${smCols}, minmax(0, 1fr))`,
      md: `repeat(${mdCols}, minmax(0, 1fr))`,
      xl: `repeat(${xlCols}, minmax(0, 1fr))`
    },
    gap: gap,
    width: '100%'
  }),
  
  cardWrapper: ({
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch'
  } satisfies SxProps<Theme>)
};