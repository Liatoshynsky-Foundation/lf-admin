import { SxProps, Theme } from '@mui/material';

import {  singleLineEllipsis, tableBorderWidth, tableDividerColor, tableGap } from '../TableLayout.styles';

export const styles = {


  tableHeader: (gridTemplate: string, firstColWidth: string): SxProps<Theme> => {
    const restTemplates = gridTemplate.substring(gridTemplate.indexOf(' ') + 1);
    return {
      display: 'grid',
      gridTemplateColumns: `calc(${firstColWidth} + 26px) ${restTemplates}`,
      columnGap: tableGap,
      alignItems: 'center',
      py: '16px',
      borderBottom: `${tableBorderWidth} solid`,
      borderBottomColor: tableDividerColor,
      minWidth: 0,
    };
  },

  tableHeaderText: {
    fontSize: '16px',
    lineHeight: '20px',
    fontWeight: 700,
    color: 'blue.700',
    fontStyle: 'normal',
    ...singleLineEllipsis,
  },

  headerTextCell: (): SxProps<Theme> => ({
    ...styles.tableHeaderText,
    textAlign: 'left',
    width: '100%',
  }),
};
