'use client';

import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { ChevronRight } from 'lucide-react';
import React from 'react';

import { ContextMenu } from '../components/ContextMenu';
import { EditAction } from '../components/EditAction';
import { styles } from './GroupedRow.styles';
import { ColumnDef, MenuItem } from './Row.types';

type GroupedRowProps<TGroup, TSub> = Readonly<{
  groupData: TGroup;
  subRows: readonly TSub[];
  columns: readonly ColumnDef<TGroup, TSub, any>[];
  gridTemplate: string;
  actionsColumnWidth?: string;
  editAction?: { editHref: string; editLabel: string };
  menuActions?: { menuItems: readonly MenuItem[]; menuTriggerLabel: string };
  subRowActions?: (subItem: TSub) => { menuItems: readonly MenuItem[]; menuTriggerLabel: string };
  defaultExpanded?: boolean;
  status?: string;
}>;

export function GroupedRow<TGroup, TSub>({
  groupData,
  subRows,
  columns,
  gridTemplate,
  actionsColumnWidth,
  editAction,
  menuActions,
  subRowActions,
  defaultExpanded = false
}: GroupedRowProps<TGroup, TSub>) {
  return (
    <Accordion defaultExpanded={defaultExpanded} disableGutters elevation={0} sx={styles.accordion}>
      <AccordionSummary expandIcon={<ChevronRight size={18} />} sx={styles.accordionSummary}>
        <Box sx={styles.gridRowBase(gridTemplate)}>
          {columns.map((col) => {
            const content = col.renderGroup ? col.renderGroup(groupData) : null;

            return (
              <Box key={col.id} sx={styles.groupCell(col.id, col.hasRightDivider, col.hasLeftDivider)}>
                {typeof content === 'string' ? (
                  <Typography sx={styles.groupCellText(col.id)}>{content}</Typography>
                ) : (
                  content
                )}
              </Box>
            );
          })}

          <Box sx={styles.actionsCellWithWidth(actionsColumnWidth)}>
            {editAction && <EditAction href={editAction.editHref} label={editAction.editLabel} />}
            {menuActions && <ContextMenu items={menuActions.menuItems} triggerLabel={menuActions.menuTriggerLabel} />}
          </Box>
        </Box>
      </AccordionSummary>

      {subRows.length > 0 && (
        <AccordionDetails sx={styles.accordionDetails}>
          {subRows.map((subItem, index) => {
            const currentSubActions = subRowActions?.(subItem);
            const isLast = index === subRows.length - 1;

            return (
              <Box key={index} sx={styles.groupedSubRow(gridTemplate, isLast)}>
                {columns.map((col) => {
                  const content = col.renderSub ? col.renderSub(subItem, groupData) : null;
                  const hasContent = content !== null && content !== '';

                  return (
                    <Box key={col.id} sx={styles.subCell(col.id, col.hasRightDivider, col.hasLeftDivider, hasContent)}>
                      {typeof content === 'string' ? (
                        <Typography sx={styles.subCellText(col.id)}>{content}</Typography>
                      ) : (
                        content
                      )}
                    </Box>
                  );
                })}

                <Box sx={styles.actionsCellWithWidth(actionsColumnWidth)}>
                  {currentSubActions && (
                    <ContextMenu
                      items={currentSubActions.menuItems}
                      triggerLabel={currentSubActions.menuTriggerLabel}
                    />
                  )}
                </Box>
              </Box>
            );
          })}
        </AccordionDetails>
      )}
    </Accordion>
  );
}
