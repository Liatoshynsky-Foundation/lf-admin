import { SxProps, Theme } from '@mui/material';

export const TABLE_DIVIDER_COLOR = '#E6E7ED';
const HORIZONTAL_ROW_DIVIDER_COLOR = '#E6E7ED';
const ACTIONS_COLUMN_WIDTH = '80px';

const SINGLE_LINE_ELLIPSIS = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} satisfies SxProps<Theme>;

export const styles = {
  markerColumn: {
    width: '1px',
  },
  
  actionsSpacer: {
    width: ACTIONS_COLUMN_WIDTH,
  },

  tableHeader: (gridTemplate: string, firstColWidth: string): SxProps<Theme> => {
    const restTemplates = gridTemplate.substring(gridTemplate.indexOf(' ') + 1);
    return {
      display: 'grid',
      gridTemplateColumns: `1px calc(${firstColWidth} + 26px) ${restTemplates} ${ACTIONS_COLUMN_WIDTH}`,
      columnGap: '8px',
      alignItems: 'center',
      py: '8px',
      borderBottom: `1px solid ${HORIZONTAL_ROW_DIVIDER_COLOR}`,
      minWidth: 0,
      '& .status-header': {
        overflow: 'visible',
        textOverflow: 'clip',
        whiteSpace: 'nowrap',
        width: 'auto',
        display: 'inline-block',
      },
    };
  },

  tableHeaderText: {
    fontSize: '16px',
    lineHeight: '22px',
    fontWeight: 700,
    color: '#63666E',
    fontStyle: 'normal',
    ...SINGLE_LINE_ELLIPSIS,
  },

  headerTextCell: (colId: string, align?: 'left' | 'center' | 'right'): SxProps<Theme> => ({
    ...styles.tableHeaderText,
    textAlign: align ?? (colId === 'status' ? 'center' : 'left'),
    width: '100%',
  }),
};
