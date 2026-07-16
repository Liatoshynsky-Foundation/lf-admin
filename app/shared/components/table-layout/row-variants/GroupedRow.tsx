import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { ChevronRight } from 'lucide-react';
import React from 'react';

import { styles } from './GroupedRow.styles';
import { ColumnDef } from './Row.types';

type GroupedRowProps<TGroup, TSub, TPlain> = Readonly<{
  groupData: TGroup;
  subRows: readonly (TSub & { id: string })[];
  columns: readonly ColumnDef<TGroup, TSub, TPlain>[];
  gridTemplate: string;
  defaultExpanded?: boolean;
}>;

export function GroupedRow<TGroup, TSub, TPlain>({
  groupData,
  subRows,
  columns,
  gridTemplate,
  defaultExpanded = false
}: GroupedRowProps<TGroup, TSub, TPlain>) {
  return (
    <Accordion defaultExpanded={defaultExpanded} disableGutters elevation={0} sx={styles.accordion}>
      <AccordionSummary component="div" expandIcon={<ChevronRight size={18} />} sx={styles.accordionSummary}>
        <Box sx={styles.gridRowBase(gridTemplate)}>
          {columns.map((col) => {
            const content = col.renderGroup ? col.renderGroup(groupData) : null;

            return (
              <Box key={col.id} sx={styles.groupCell(col.hasRightDivider, col.hasLeftDivider, col.align)}>
                {typeof content === 'string' ? (
                  <Typography sx={styles.groupCellText(col.id)}>{content}</Typography>
                ) : (
                  content
                )}
              </Box>
            );
          })}
        </Box>
      </AccordionSummary>

      {subRows && subRows.length > 0 && (
        <AccordionDetails sx={styles.accordionDetails}>
          {subRows.map((subItem, index) => {
            const isLast = index === subRows.length - 1;

            return (
              <Box key={subItem.id} sx={styles.groupedSubRow(gridTemplate, isLast)}>
                {columns.map((col) => {
                  const content = col.renderSub ? col.renderSub(subItem, groupData) : null;
                  const hasContent = content !== null && content !== '';

                  return (
                    <Box
                      key={col.id}
                      sx={styles.subCell(col.hasRightDivider, col.hasLeftDivider, hasContent, col.align)}
                    >
                      {typeof content === 'string' ? (
                        <Typography sx={styles.subCellText(col.id)}>{content}</Typography>
                      ) : (
                        content
                      )}
                    </Box>
                  );
                })}
              </Box>
            );
          })}
        </AccordionDetails>
      )}
    </Accordion>
  );
}
