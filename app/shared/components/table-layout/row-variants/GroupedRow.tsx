import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { ChevronRight } from 'lucide-react';
import React from 'react';

import { ContextMenu } from '../components/ContextMenu';
import { EditAction } from '../components/EditAction';
import { styles } from './GroupedRow.styles';
import { ColumnsConfig, GroupRowRenderer, RowActionConfig } from './Row.types';

type GroupedRowProps<TGroup, TSub> = Readonly<{
  groupData: TGroup;
  subRows: readonly TSub[];
  columns: readonly ColumnsConfig[];
  gridTemplate: string;
  actionsColumnWidth?: string;
  renderer: GroupRowRenderer<TGroup, TSub>;
  actions?: RowActionConfig;
  subRowActions?: (subItem: TSub) => RowActionConfig;
  defaultExpanded?: boolean;
}>;

export function GroupedRow<TGroup, TSub>({
  groupData,
  subRows,
  columns,
  gridTemplate,
  actionsColumnWidth,
  renderer,
  actions,
  subRowActions,
  defaultExpanded = false
}: GroupedRowProps<TGroup, TSub>) {
  return (
    <Accordion defaultExpanded={defaultExpanded} disableGutters elevation={0} sx={styles.accordion}>
      <AccordionSummary expandIcon={<ChevronRight size={18} />} sx={styles.accordionSummary}>
        <Box sx={styles.gridRowBase(gridTemplate)}>
          {columns.map((col) => {
            const content = renderer.renderGroupCell(col.id, groupData);

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
            {actions && (
              <>
                {actions.editHref && <EditAction href={actions.editHref} label={actions.editLabel ?? ''} />}
                <ContextMenu items={actions.menuItems} triggerLabel={actions.menuTriggerLabel} />
              </>
            )}
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
                  if (col.id === 'opus' || col.id === 'group') {
                    return <Box key={col.id} sx={styles.emptySubCell} />;
                  }

                  const content = renderer.renderSubCell(col.id, subItem);
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
                    <>
                      {currentSubActions.editHref && (
                        <EditAction href={currentSubActions.editHref} label={currentSubActions.editLabel ?? ''} />
                      )}
                      <ContextMenu
                        items={currentSubActions.menuItems}
                        triggerLabel={currentSubActions.menuTriggerLabel}
                      />
                    </>
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
