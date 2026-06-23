import { SxProps, Theme } from '@mui/material';

import {  BORDER_WIDTH, HORIZONTAL_ROW_DIVIDER_COLOR, SINGLE_LINE_ELLIPSIS, TABLE_GAP } from './TableLayout.styles';

export const styles = {


  tableHeader: (gridTemplate: string, firstColWidth: string): SxProps<Theme> => {
    const restTemplates = gridTemplate.substring(gridTemplate.indexOf(' ') + 1);
    return {
      display: 'grid',
      gridTemplateColumns: `calc(${firstColWidth} + 26px) ${restTemplates}`,
      columnGap: TABLE_GAP,
      alignItems: 'center',
      py: '16px',
      borderBottom: `${BORDER_WIDTH} solid`,
      borderBottomColor: HORIZONTAL_ROW_DIVIDER_COLOR,
      minWidth: 0,
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

  headerTextCell: (): SxProps<Theme> => ({
    ...styles.tableHeaderText,
    textAlign: 'left',
    width: '100%',
  }),
};
