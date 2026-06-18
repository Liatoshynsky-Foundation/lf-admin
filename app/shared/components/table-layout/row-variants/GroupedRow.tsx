import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { ChevronRight } from 'lucide-react';
import React from 'react';

import { ContextMenu } from '../components/ContextMenu';
import { EditAction } from '../components/EditAction';
import { HeaderConfig } from '../TableHeader';
import { getGroupedWorkRowSx, styles, TABLE_DIVIDER_COLOR } from '../TableLayout.styles';
import { GroupRowRenderer, RowActionConfig } from './Row.types';

type GroupedRowProps<TGroup, TSub> = Readonly<{
  groupData: TGroup;
  subRows: readonly TSub[];
  columns: readonly HeaderConfig[];
  gridTemplate: string;
  actionsColumnWidth?: string;
  renderer: GroupRowRenderer<TGroup, TSub>;
  actions?: RowActionConfig;
  subRowActions?: (subItem: TSub) => RowActionConfig;
  renderGroupActions?: (group: TGroup) => React.ReactNode;
  renderSubActions?: (sub: TSub) => React.ReactNode;
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
  renderGroupActions,
  renderSubActions,
  defaultExpanded = true
}: GroupedRowProps<TGroup, TSub>) {
  return (
    <Accordion defaultExpanded={defaultExpanded} disableGutters elevation={0} sx={styles.accordion}>
      <AccordionSummary expandIcon={<ChevronRight size={18} />} sx={styles.accordionSummary}>
        <Box sx={styles.gridRowBase(gridTemplate)}>
          <Box sx={styles.markerColumn} />

          {columns.map((col) => {
            const content = renderer.renderGroupCell(col.id, groupData);

            const cellStyle = {
              minWidth: 0,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              pr: col.hasRightDivider ? '10px' : 0,
              borderRight: col.hasRightDivider ? `1px solid ${TABLE_DIVIDER_COLOR}` : 'none',
              ...(col.id === 'status' ? { justifyContent: 'center', width: '100%' } : { justifyContent: 'flex-start' })
            };

            const textStyle = {
              ...(col.id === 'title' ? styles.mainRowText : styles.metaText),
              width: '100%',
              ...(col.id === 'status' ? { textAlign: 'center' } : { textAlign: 'left' })
            };

            return (
              <Box key={col.id} sx={cellStyle}>
                {typeof content === 'string' ? <Typography sx={textStyle}>{content}</Typography> : content}
              </Box>
            );
          })}

          <Box sx={{ ...styles.rowActionsCell, width: actionsColumnWidth }}>
            {renderGroupActions ? (
              renderGroupActions(groupData)
            ) : actions ? (
              <>
                {actions.editHref && <EditAction href={actions.editHref} label={actions.editLabel ?? ''} />}
                <ContextMenu items={actions.menuItems} triggerLabel={actions.menuTriggerLabel} />
              </>
            ) : null}
          </Box>
        </Box>
      </AccordionSummary>

      {subRows.length > 0 && (
        <AccordionDetails sx={{ p: 0 }}>
          {subRows.map((subItem, index) => {
            const currentSubActions = subRowActions?.(subItem);

            return (
              <Box
                key={index}
                sx={{
                  ...getGroupedWorkRowSx(gridTemplate, index === subRows.length - 1),
                  pl: '32px'
                }}
              >
                <Box sx={styles.markerColumn} />

                {columns.map((col) => {
                  if (col.id === 'opus' || col.id === 'group') {
                    return <Box key={col.id} sx={{ height: '100%', borderRight: 'none' }} />;
                  }

                  const content = renderer.renderSubCell(col.id, subItem);
                  const hasContent = content !== null && content !== '';

                  const cellStyle = {
                    minWidth: 0,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    pr: col.hasRightDivider && hasContent ? '10px' : 0,
                    borderRight: col.hasRightDivider && hasContent ? `1px solid ${TABLE_DIVIDER_COLOR}` : 'none',
                    ...(col.id === 'status'
                      ? { justifyContent: 'center', width: '100%' }
                      : { justifyContent: 'flex-start' })
                  };

                  return (
                    <Box key={col.id} sx={cellStyle}>
                      {typeof content === 'string' ? (
                        <Typography
                          sx={{
                            ...styles.subRowText,
                            width: '100%',
                            textAlign: col.id === 'status' ? 'center' : 'left'
                          }}
                        >
                          {content}
                        </Typography>
                      ) : (
                        content
                      )}
                    </Box>
                  );
                })}

                <Box sx={{ ...styles.rowActionsCell, width: actionsColumnWidth }}>
                  {renderSubActions ? (
                    renderSubActions(subItem)
                  ) : currentSubActions ? (
                    <>
                      {currentSubActions.editHref && (
                        <EditAction href={currentSubActions.editHref} label={currentSubActions.editLabel ?? ''} />
                      )}
                      <ContextMenu
                        items={currentSubActions.menuItems}
                        triggerLabel={currentSubActions.menuTriggerLabel}
                      />
                    </>
                  ) : null}
                </Box>
              </Box>
            );
          })}
        </AccordionDetails>
      )}
    </Accordion>
  );
}
