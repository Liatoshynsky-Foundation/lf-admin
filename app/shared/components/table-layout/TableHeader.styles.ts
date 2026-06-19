import { SxProps, Theme } from '@mui/material';

import { ACTIONS_COLUMN_WIDTH, HORIZONTAL_ROW_DIVIDER_COLOR, SINGLE_LINE_ELLIPSIS, TABLE_GAP } from './TableLayout.styles';

export const styles = {
  actionsSpacer: {
    width: ACTIONS_COLUMN_WIDTH,
  },

  tableHeader: (gridTemplate: string, firstColWidth: string): SxProps<Theme> => {
    const restTemplates = gridTemplate.substring(gridTemplate.indexOf(' ') + 1);
    return {
      display: 'grid',
      gridTemplateColumns: `calc(${firstColWidth} + 26px) ${restTemplates} ${ACTIONS_COLUMN_WIDTH}`,
      columnGap: TABLE_GAP,
      alignItems: 'center',
      py: '16px',
      borderBottom: '2px solid',
      borderBottomColor: HORIZONTAL_ROW_DIVIDER_COLOR,
      minWidth: 0,
      '& .status-header': {
        overflow: 'visible',
      },
    };
  },

  tableHeaderText: {
    fontSize: '16px',
    lineHeight: '20px',
    fontWeight: 700,
    color: 'blue.700',
    fontStyle: 'normal',
    ...SINGLE_LINE_ELLIPSIS,
  },

  headerTextCell: (colId: string, align?: 'left' | 'center' | 'right'): SxProps<Theme> => ({
    ...styles.tableHeaderText,
    textAlign: align ?? (colId === 'status' ? 'center' : 'left'),
    width: '100%',
  }),
};
