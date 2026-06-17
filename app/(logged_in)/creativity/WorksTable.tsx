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

// ── Types ────────────────────────────────────────────────────────────────────
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

// ── Menus Configuration ──────────────────────────────────────────────────────
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

type ContextMenuItem = { id: string; label: string; danger?: boolean };

// ── Sub-components (State & Row logic) ───────────────────────────────────────
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

function DropdownItemsList<T extends { id: string }>({
  items,
  renderItem
}: Readonly<{ items: readonly T[]; renderItem: (item: T) => React.ReactNode }>) {
  return <Box sx={styles.menuList}>{items.map((item) => renderItem(item))}</Box>;
}

function ContextMenu({ items, triggerLabel }: Readonly<{ items: readonly ContextMenuItem[]; triggerLabel: string }>) {
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
          <DropdownItemsList
            items={items}
            renderItem={(item) => (
              <MenuItem key={item.id} onClick={handleClose} sx={getContextMenuDropdownItem(item.danger)}>
                {item.label}
              </MenuItem>
            )}
          />
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

function WorkRowCells({ title, year }: Readonly<{ title: string; year: string }>) {
  return (
    <>
      <Typography sx={styles.workRowTitle}>{title}</Typography>
      <Box sx={styles.genreSpacer} />
      <Typography sx={styles.yearText}>{year}</Typography>
      <Box sx={styles.statusSpacer} />
      <Box sx={styles.rowActionsCell}>
        <ContextMenu items={WORK_MENU_ITEMS} triggerLabel={`Дії твору ${title}`} />
      </Box>
    </>
  );
}

function WorksTableHeader() {
  return (
    <Box sx={styles.tableHeader}>
      <Box sx={styles.markerColumn} />
      <Typography sx={styles.tableHeaderFirstText}>Опуси</Typography>
      <Typography sx={styles.tableHeaderText}>Назва</Typography>
      <Typography sx={styles.tableHeaderText}>Жанр</Typography>
      <Typography sx={styles.tableHeaderText}>Роки</Typography>
      <Typography sx={styles.tableHeaderText}>Статус</Typography>
      <Box sx={styles.actionsSpacer} />
    </Box>
  );
}

function formatGroupYears(startDate: string, endDate?: string): string {
  if (!endDate || endDate === startDate) return startDate;
  return `${startDate} - ${endDate}`;
}

function GroupedRow({ group, defaultExpanded }: Readonly<{ group: TableGroupRowData; defaultExpanded?: boolean }>) {
  return (
    <Accordion defaultExpanded={defaultExpanded} disableGutters elevation={0} sx={styles.accordion}>
      <AccordionSummary expandIcon={<ChevronRight size={18} />} sx={styles.accordionSummary}>
        <Box sx={styles.accordionSummaryContent}>
          <Box sx={styles.accordionSummaryContentSpacer} />
          <Typography sx={styles.opusNumberTypography}>{group.numberLabel}</Typography>
          <Typography sx={styles.groupTitleText}>{group.title}</Typography>
          <Typography sx={styles.groupGenreText}>{group.genre}</Typography>
          <Typography sx={styles.groupYearsText}>{formatGroupYears(group.startDate, group.endDate)}</Typography>
          <Box sx={styles.statusColumnWrapper}>
            <StatusWithDate
              status={group.status}
              createdAt={group.createdAt}
              updatedAt={group.updatedAt}
              publishedAt={group.publishedAt}
              dividerColor={TABLE_DIVIDER_COLOR}
            />
          </Box>
          <Box sx={styles.rowActionsCell}>
            <EditAction href={`${WORKS_BASE_PATH}/group/${group.id}/edit`} label={`Редагувати групу ${group.title}`} />
            <ContextMenu items={GROUP_MENU_ITEMS} triggerLabel={`Дії групи ${group.title}`} />
          </Box>
        </Box>
      </AccordionSummary>

      {group.works.length > 0 && (
        <AccordionDetails sx={styles.accordionDetails}>
          {group.works.map((work, index) => (
            <Box key={work.id} sx={getGroupedWorkRowSx(index === group.works.length - 1)}>
              <Box sx={styles.markerColumn} />
              <WorkRowCells title={work.title} year={work.year} />
            </Box>
          ))}
        </AccordionDetails>
      )}
    </Accordion>
  );
}

function IndividualWorkRow({ work }: Readonly<{ work: TableIndividualWorkData }>) {
  return (
    <Box sx={styles.individualWorkRow}>
      <Box sx={styles.markerColumn} />
      <Typography sx={styles.workRowTitle}>{work.title}</Typography>
      <Box sx={styles.genreSpacer} />
      <Typography sx={styles.individualWorkYearText}>{work.year}</Typography>
      <Box sx={styles.statusSpacer} />
      <Box sx={styles.rowActionsCell}>
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
  return (
    <Box sx={styles.worksListContainer}>
      <WorksTableHeader />

      {showOpus && visibleOpusGroups.map((group) => <GroupedRow key={group.id} group={group} defaultExpanded />)}

      {showUngrouped &&
        visibleUngroupedGroups.map((group) => <GroupedRow key={group.id} group={group} defaultExpanded />)}

      {showIndividualWorks && visibleUngroupedWorks.map((work) => <IndividualWorkRow key={work.id} work={work} />)}
    </Box>
  );
}
