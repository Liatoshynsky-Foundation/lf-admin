'use client';

import { Accordion, AccordionDetails, AccordionSummary, Box, IconButton, MenuItem, Typography } from '@mui/material';
import { ChevronRight, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';

import { type WorkStatus } from './works.mock';
import { getContextMenuDropdownItem, getGroupedWorkRowSx, styles, TABLE_DIVIDER_COLOR } from './WorksTable.styles';
import { COLUMNS, GROUP_MENU_ITEMS, WORK_MENU_ITEMS } from './WorksTableConent';
import { WORKS_BASE_PATH } from '~/constants/creativity';
import PencilIcon from '~/public/icons/pencil.svg';
import DropdownMenu from '~/shared/components/dropdown-menu/DropdownMenu';

export type TableGroupRowData = Readonly<{
  id: string;
  numberLabel: string;
  title: string;
  genre: string;
  startDate: string;
  endDate?: string;
  status: WorkStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  works: ReadonlyArray<{ id: string; title: string; year: string }>;
}>;

export type TableIndividualWorkData = Readonly<{
  id: string;
  title: string;
  year: string;
  genre: string;
  status: WorkStatus;
  updatedAt: string;
  language: 'uk' | 'en' | 'bilingual';
}>;

type WorksTableProps = Readonly<{
  visibleOpusGroups: readonly TableGroupRowData[];
  visibleUngroupedGroups: readonly TableGroupRowData[];
  visibleUngroupedWorks: readonly TableIndividualWorkData[];
  showOpus: boolean;
  showUngrouped: boolean;
  showIndividualWorks: boolean;
}>;

type ColumnConfig = {
  id: string;
  headerLabel: string;
  width: string;
  hasRightDivider?: boolean;
  renderWork: (data: TableGroupRowData | TableIndividualWorkData) => React.ReactNode;
  renderSub?: (work: { id: string; title: string; year: string }) => React.ReactNode;
};

function useDropdownState() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  return { anchorEl, triggerRef, handleOpen, handleClose };
}

function ContextMenu({
  items,
  triggerLabel
}: Readonly<{ items: readonly { id: string; label: string; danger?: boolean }[]; triggerLabel: string }>) {
  const { anchorEl, triggerRef, handleOpen, handleClose } = useDropdownState();

  return (
    <>
      <Box sx={styles.contextMenuWrapper}>
        <IconButton
          component="span"
          ref={triggerRef}
          onClick={handleOpen}
          aria-label={triggerLabel}
          aria-haspopup="menu"
          aria-expanded={Boolean(anchorEl)}
          sx={styles.contentMenuButton}
        >
          <MoreVertical size={22} color="#190D03" />
        </IconButton>
      </Box>

      <DropdownMenu
        disableScrollLock
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={styles.contextMenuDropdown}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        menuList={
          <Box sx={styles.menuList}>
            {items.map((item) => (
              <MenuItem key={item.id} onClick={handleClose} sx={getContextMenuDropdownItem(item.danger)}>
                {item.label}
              </MenuItem>
            ))}
          </Box>
        }
      />
    </>
  );
}

function EditAction({ href, label }: Readonly<{ href: string; label: string }>) {
  return (
    <Box sx={styles.editActionWrapper}>
      <IconButton
        component={Link}
        href={href}
        onClick={(e) => e.stopPropagation()}
        aria-label={label}
        sx={styles.editActionButton}
      >
        <PencilIcon />
      </IconButton>
    </Box>
  );
}

function GroupedRow({
  group,
  columns,
  gridTemplate,
  defaultExpanded
}: Readonly<{
  group: TableGroupRowData;
  columns: readonly ColumnConfig[];
  gridTemplate: string;
  defaultExpanded?: boolean;
}>) {
  return (
    <Accordion defaultExpanded={defaultExpanded} disableGutters elevation={0} sx={styles.accordion}>
      <AccordionSummary expandIcon={<ChevronRight size={18} />} sx={styles.accordionSummary}>
        <Box sx={styles.gridRowBase(gridTemplate)}>
          <Box sx={styles.markerColumn} />

          {columns.map((col) => {
            const content = col.renderWork(group);

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

          <Box sx={styles.rowActionsCell}>
            <EditAction href={`${WORKS_BASE_PATH}/group/${group.id}/edit`} label={`Редагувати групу ${group.title}`} />
            <ContextMenu items={GROUP_MENU_ITEMS} triggerLabel={`Дії групи ${group.title}`} />
          </Box>
        </Box>
      </AccordionSummary>

      {group.works.length > 0 && (
        <AccordionDetails sx={{ p: 0 }}>
          {group.works.map((work, index) => (
            <Box
              key={work.id}
              sx={{
                ...getGroupedWorkRowSx(gridTemplate, index === group.works.length - 1),
                pl: '32px'
              }}
            >
              <Box sx={styles.markerColumn} />

              {columns.map((col) => {
                if (col.id === 'opus') {
                  return (
                    <Box
                      key={col.id}
                      sx={{
                        height: '100%',
                        borderRight: 'none'
                      }}
                    />
                  );
                }

                const content = col.renderSub ? col.renderSub(work) : null;

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

              <Box sx={styles.rowActionsCell}>
                <ContextMenu items={WORK_MENU_ITEMS} triggerLabel={`Дії твору ${work.title}`} />
              </Box>
            </Box>
          ))}
        </AccordionDetails>
      )}
    </Accordion>
  );
}

function IndividualWorkRow({
  work,
  columns,
  gridTemplate
}: Readonly<{
  work: TableIndividualWorkData;
  columns: readonly ColumnConfig[];
  gridTemplate: string;
}>) {
  return (
    <Box sx={styles.individualWorkRow(gridTemplate)}>
      <Box sx={styles.markerColumn} />

      {columns.map((col) => {
        if (col.id === 'opus') return null;

        const content = col.renderWork(work);

        const cellStyle = {
          minWidth: 0,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          pr: col.hasRightDivider ? '10px' : 0,
          borderRight: col.hasRightDivider ? `1px solid ${TABLE_DIVIDER_COLOR}` : 'none',
          ...(col.id === 'title' ? { gridColumn: 'span 2' } : {}),
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

      <Box sx={styles.rowActionsCell}>
        <EditAction href={`${WORKS_BASE_PATH}/work/${work.id}/edit`} label={`Редагувати твір ${work.title}`} />
        <ContextMenu items={WORK_MENU_ITEMS} triggerLabel={`Дії твору ${work.title}`} />
      </Box>
    </Box>
  );
}

export function WorksTable({
  visibleOpusGroups,
  visibleUngroupedGroups,
  visibleUngroupedWorks,
  showOpus,
  showUngrouped,
  showIndividualWorks
}: WorksTableProps) {
  const gridTemplate = COLUMNS.map((c) => c.width).join(' ');

  return (
    <Box sx={styles.worksListContainer}>
      <Box sx={styles.tableHeader(gridTemplate, COLUMNS[0].width)}>
        <Box sx={styles.markerColumn} />
        {COLUMNS.map((col) => (
          <Typography
            key={col.id}
            className={col.id === 'status' ? 'status-header' : ''}
            sx={{
              ...styles.tableHeaderText,
              textAlign: col.id === 'status' ? 'center' : 'left',
              width: '100%'
            }}
          >
            {col.headerLabel}
          </Typography>
        ))}
        <Box sx={styles.actionsSpacer} />
      </Box>

      {showOpus &&
        visibleOpusGroups.map((group) => (
          <GroupedRow key={group.id} group={group} columns={COLUMNS} gridTemplate={gridTemplate} defaultExpanded />
        ))}

      {showUngrouped &&
        visibleUngroupedGroups.map((group) => (
          <GroupedRow key={group.id} group={group} columns={COLUMNS} gridTemplate={gridTemplate} defaultExpanded />
        ))}

      {showIndividualWorks &&
        visibleUngroupedWorks.map((work) => (
          <IndividualWorkRow key={work.id} work={work} columns={COLUMNS} gridTemplate={gridTemplate} />
        ))}
    </Box>
  );
}
