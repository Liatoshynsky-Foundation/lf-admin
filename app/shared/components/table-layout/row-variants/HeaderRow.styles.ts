import { SxProps, Theme } from '@mui/material';

import { singleLineEllipsis, tableBorderWidth, tableDividerColor, tableGap } from '../TableLayout.styles';

const EXPAND_ICON_GUTTER = '26px';

export const styles = {
  tableHeader: (
    gridTemplate: string,
    firstColWidth: string,
    includeExpandGutter = false,
    withoutFirstColOffset = false
  ): SxProps<Theme> => {
    const restTemplates = gridTemplate.substring(gridTemplate.indexOf(' ') + 1);
    const firstColumn = includeExpandGutter && !withoutFirstColOffset
      ? `calc(${firstColWidth} + ${EXPAND_ICON_GUTTER})`
      : firstColWidth;
    return {
      display: 'grid',
      gridTemplateColumns: `${firstColumn} ${restTemplates}`,
      columnGap: tableGap,
      alignItems: 'center',
      py: '16px',
      borderBottom: `${tableBorderWidth} solid`,
      borderBottomColor: tableDividerColor,
      minWidth: 0
    };
  },

  tableHeaderText: {
    fontSize: '16px',
    lineHeight: '20px',
    fontWeight: 700,
    color: 'blue.700',
    fontStyle: 'normal',
    ...singleLineEllipsis
  },

  headerTextCell: (): SxProps<Theme> => ({
    ...styles.tableHeaderText,
    textAlign: 'left',
    width: '100%'
  })
};
