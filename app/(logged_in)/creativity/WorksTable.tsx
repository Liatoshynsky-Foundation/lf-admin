'use client';

import { Accordion, AccordionDetails, AccordionSummary, Box, IconButton, MenuItem, Typography } from '@mui/material';
import { ChevronRight, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';

import { StatusWithDate } from './components/StatusWithDate';
import { type WorkStatus } from './works.mock';
import { getContextMenuDropdownItem, getGroupedWorkRowSx, styles, TABLE_DIVIDER_COLOR } from './WorksTable.styles';
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

const GROUP_MENU_ITEMS = [
  { id: 'edit', label: 'Редагувати' },
  { id: 'publish', label: 'Опублікувати' },
  { id: 'unpublish', label: 'Зняти з публікації' },
  { id: 'ungroup', label: 'Розгрупувати' },
  { id: 'seo', label: 'SEO налаштування' },
  { id: 'share', label: 'Поширити' },
  { id: 'delete', label: 'Видалити', danger: true }
] as const;

const WORK_MENU_ITEMS = [
  { id: 'upload_audio', label: 'Завантажити аудіо' },
  { id: 'upload_pdf', label: 'Завантажити PDF' },
  { id: 'seo', label: 'SEO налаштування' },
  { id: 'share', label: 'Поширити' },
  { id: 'delete', label: 'Видалити', danger: true }
] as const;

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
              ...(col.hasRightDivider ? { borderRight: `1px solid ${TABLE_DIVIDER_COLOR}`, pr: '10px' } : {}),
              ...(col.id === 'status' ? { display: 'flex', justifyContent: 'center', width: '100%' } : {})
            };

            const textStyle = {
              ...(col.id === 'title' ? styles.mainRowText : styles.metaText),
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
                const content = col.renderSub ? col.renderSub(work) : null;

                const cellStyle = {
                  minWidth: 0,
                  ...(col.id === 'status' ? { display: 'flex', justifyContent: 'center', width: '100%' } : {})
                };

                return (
                  <Box key={col.id} sx={cellStyle}>
                    {typeof content === 'string' ? (
                      <Typography sx={{ ...styles.subRowText, textAlign: col.id === 'status' ? 'center' : 'left' }}>
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
          // Об'єднуємо клітинку Опуси (яку пропустили) та Назва разом за допомогою span 2
          ...(col.id === 'title' ? { gridColumn: 'span 2' } : {}),
          ...(col.hasRightDivider ? { borderRight: `1px solid ${TABLE_DIVIDER_COLOR}`, pr: '10px' } : {}),
          ...(col.id === 'status' ? { display: 'flex', justifyContent: 'center', width: '100%' } : {})
        };

        const textStyle = {
          ...(col.id === 'title' ? styles.mainRowText : styles.metaText),
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
  const COLUMNS: readonly ColumnConfig[] = [
    {
      id: 'opus',
      headerLabel: 'Опуси',
      width: '88px',
      hasRightDivider: true,
      renderWork: (data) => ('numberLabel' in data ? data.numberLabel : ''),
      renderSub: () => null
    },
    {
      id: 'title',
      headerLabel: 'Назва',
      width: 'minmax(220px, 1fr)',
      renderWork: (data) => data.title,
      renderSub: (work) => work.title
    },
    {
      id: 'genre',
      headerLabel: 'Жанр',
      width: '216px',
      renderWork: (data) => ('genre' in data ? data.genre : ''),
      renderSub: () => null
    },
    {
      id: 'years',
      headerLabel: 'Роки',
      width: '96px',
      hasRightDivider: true,
      renderWork: (data) => {
        if ('startDate' in data) {
          return data.endDate && data.endDate !== data.startDate
            ? `${data.startDate} - ${data.endDate}`
            : data.startDate;
        }
        return data.year;
      },
      renderSub: () => null
    },
    {
      id: 'status',
      headerLabel: 'Статус',
      width: '48px',
      hasRightDivider: true,
      renderWork: (data) => {
        if ('status' in data) {
          return (
            <StatusWithDate
              status={data.status}
              createdAt={'createdAt' in data ? data.createdAt : data.updatedAt}
              updatedAt={data.updatedAt}
              publishedAt={'publishedAt' in data ? data.publishedAt : undefined}
              dividerColor={TABLE_DIVIDER_COLOR}
            />
          );
        }
        return null;
      },
      renderSub: () => null
    }
  ];

  const gridTemplate = COLUMNS.map((c) => c.width).join(' ');

  return (
    <Box sx={styles.worksListContainer}>
      <Box sx={styles.tableHeader(gridTemplate, COLUMNS[0].width)}>
        <Box sx={styles.markerColumn} />
        {COLUMNS.map((col) => (
          <Typography
            key={col.id}
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
