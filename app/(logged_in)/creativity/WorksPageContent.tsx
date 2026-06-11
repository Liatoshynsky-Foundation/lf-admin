'use client';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  IconButton,
  MenuItem,
  Typography
} from '@mui/material';
import { ChevronDown, ChevronRight, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';

import { StatusWithDate } from './components/StatusWithDate';
import { useWorksFiltering } from './useWorksFiltering';
import { type OpusGroup, type UngroupedGroup, WORKS_MOCK_DATA, type WorkStatus } from './works.mock';
import { getContextMenuDropdownItem, getGroupedWorkRowSx, styles, TABLE_DIVIDER_COLOR } from './WorksPageContent.styles';
import {
  WORKS_BASE_PATH,
  WORKS_CREATE_OPTIONS,
  WORKS_EMPTY_STATE_DESCRIPTION,
  WORKS_EMPTY_STATE_NO_RESULTS_DESCRIPTION,
  WORKS_EMPTY_STATE_NO_RESULTS_TITLE,
  WORKS_EMPTY_STATE_TITLE,
  WORKS_PAGE_TITLE,
  WORKS_STATUSES,
  WORKS_TABS,
  type WorksStatusValue,
  type WorksTabValue
} from '~/constants/creativity';
import type { FilesSortValue } from '~/constants/sort';
import PencilIcon from '~/public/icons/pencil.svg';
import DropdownMenu from '~/shared/components/dropdown-menu/DropdownMenu';
import { EmptyState } from '~/shared/components/empty-state';
import { FilteringToolbar, SortSelect } from '~/shared/components/filtering-toolbar';
import { PageHeader } from '~/shared/components/page-header/PageHeader';
import { normalizeSearch } from '~/utils/normalizeSearch';

type WorksPageContentProps = Readonly<{
  activeTab: WorksTabValue;
}>;

type GroupRowData = Readonly<{
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

type GroupFilterData = Readonly<{
  title: string;
  genre: string;
  language: 'uk' | 'en' | 'bilingual';
  status: WorkStatus;
  updatedAt: string;
  works: ReadonlyArray<{ title: string }>;
}>;

type FilterableItemData = Readonly<{
  title: string;
  genre: string;
  language: 'uk' | 'en' | 'bilingual';
  status: WorkStatus;
  updatedAt: string;
}>;

function isWorksStatusValue(status: WorkStatus): status is WorksStatusValue {
  return WORKS_STATUSES.includes(status as WorksStatusValue);
}

type IndividualWorkData = Readonly<{
  id: string;
  title: string;
  year: string;
  genre: string;
  status: WorkStatus;
  updatedAt: string;
  language: 'uk' | 'en' | 'bilingual';
}>;

function toGroupRowData(group: OpusGroup | UngroupedGroup): GroupRowData {
  const [rawStartDate, rawEndDate] = group.yearRange.split('-').map((part) => part.trim());
  const startDate = rawStartDate || group.updatedAt.slice(0, 4);
  const endDate = rawEndDate || undefined;

  return {
    id: group.id,
    numberLabel: 'opusNumber' in group ? group.opusNumber : group.boNumber,
    title: group.title,
    genre: group.genre,
    startDate,
    endDate,
    status: group.status,
    createdAt: group.createdAt ?? group.updatedAt,
    updatedAt: group.updatedAt,
    publishedAt: group.publishedAt,
    works: group.works
  };
}

function formatGroupYears(startDate: string, endDate?: string): string {
  if (!endDate || endDate === startDate) {
    return startDate;
  }

  return `${startDate} - ${endDate}`;
}

function getGroupEditHref(groupId: string): string {
  return `${WORKS_BASE_PATH}/group/${groupId}/edit`;
}

function sortGroups<T extends { title: string; updatedAt: string }>(
  groups: readonly T[],
  sortValue: FilesSortValue
): T[] {
  return [...groups].sort((left, right) => {
    if (sortValue === 'date_desc') {
      return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    }

    if (sortValue === 'date_asc') {
      return new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime();
    }

    if (sortValue === 'name_asc') {
      return left.title.localeCompare(right.title, 'uk', { sensitivity: 'base' });
    }

    return right.title.localeCompare(left.title, 'uk', { sensitivity: 'base' });
  });
}

// ── Opus context menu ─────────────────────────────────────────────────────────
const GROUP_MENU_ITEMS = [
  { id: 'edit', label: 'Редагувати' },
  { id: 'publish', label: 'Опублікувати' },
  { id: 'unpublish', label: 'Зняти з публікації' },
  { id: 'ungroup', label: 'Розгрупувати' },
  { id: 'seo', label: 'SEO налаштування' },
  { id: 'share', label: 'Поширити' },
  { id: 'delete', label: 'Видалити', danger: true }
] as const;

// ── Ungrouped work context menu ───────────────────────────────────────────────
const WORK_MENU_ITEMS = [
  { id: 'upload_audio', label: 'Завантажити аудіо' },
  { id: 'upload_pdf', label: 'Завантажити PDF' },
  { id: 'seo', label: 'SEO налаштування' },
  { id: 'share', label: 'Поширити' },
  { id: 'delete', label: 'Видалити', danger: true }
] as const;

type ContextMenuItem = { id: string; label: string; danger?: boolean };

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

  const handleToggle = () => {
    setAnchorEl((previous) => (previous ? null : triggerRef.current));
  };

  return { anchorEl, triggerRef, handleOpen, handleClose, handleToggle };
}

function DropdownItemsList<T extends { id: string }>({
  items,
  renderItem
}: Readonly<{
  items: readonly T[];
  renderItem: (item: T) => React.ReactNode;
}>) {
  return <Box sx={styles.menuList}>{items.map((item) => renderItem(item))}</Box>;
}

function ContextMenu({
  items,
  triggerLabel
}: Readonly<{
  items: readonly ContextMenuItem[];
  triggerLabel: string;
}>) {
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
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>): void => {
    event.stopPropagation();
  };

  return (
    <Box sx={styles.editActionWrapper}>
      <IconButton component={Link} href={href} onClick={handleClick} aria-label={label} sx={styles.editActionButton}>
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

// ── Opus accordion row ────────────────────────────────────────────────────────
function GroupedRow({
  group,
  defaultExpanded
}: Readonly<{
  group: GroupRowData;
  defaultExpanded?: boolean;
}>) {
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
            <EditAction href={getGroupEditHref(group.id)} label={`Редагувати групу ${group.title}`} />

            <ContextMenu items={GROUP_MENU_ITEMS} triggerLabel={`Дії групи ${group.title}`} />
          </Box>
        </Box>
      </AccordionSummary>

      {group.works.length > 0 && (
        <AccordionDetails sx={styles.accordionDetails}>
          {group.works.map((work, index) => (
            <Box
              key={work.id}
              sx={getGroupedWorkRowSx(index === group.works.length - 1)}
            >
              <Box sx={styles.markerColumn} />
              <WorkRowCells title={work.title} year={work.year} />
            </Box>
          ))}
        </AccordionDetails>
      )}
    </Accordion>
  );
}

// ── Individual work (ungrouped work without container) ──────────────────────
function IndividualWorkRow({ work }: Readonly<{ work: IndividualWorkData }>) {
  return (
    <Box sx={styles.individualWorkRow}>
      {/* Left marker column (empty for individual works) */}
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

function GroupRowsList({ groups }: Readonly<{ groups: readonly (OpusGroup | UngroupedGroup)[] }>) {
  return (
    <>
      {groups.map((group) => (
        <GroupedRow key={group.id} group={toGroupRowData(group)} defaultExpanded />
      ))}
    </>
  );
}

// ── Create button (same pattern as PublicationsCreateAction) ──────────────────
function WorksCreateAction() {
  const { anchorEl, triggerRef, handleClose, handleToggle } = useDropdownState();

  const handleToggleMenu = handleToggle;
  const handleCloseMenu = handleClose;

  return (
    <>
      <Button
        ref={triggerRef}
        variant="contained"
        onClick={handleToggleMenu}
        endIcon={<ChevronDown size={18} aria-hidden="true" />}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchorEl)}
        sx={styles.createButton}
      >
        Створити
      </Button>

      <DropdownMenu
        disableScrollLock
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        sx={styles.createDropdownMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        menuList={
          <DropdownItemsList
            items={WORKS_CREATE_OPTIONS}
            renderItem={(option) => (
              <MenuItem
                key={option.id}
                component={Link}
                href={option.href}
                onClick={handleCloseMenu}
                sx={styles.createMenuItem}
              >
                {option.label}
              </MenuItem>
            )}
          />
        }
      />
    </>
  );
}

// ── Main page content ─────────────────────────────────────────────────────────
export function WorksPageContent({ activeTab }: WorksPageContentProps) {
  const { sortValue, selectedFilters, toolbarProps, sortProps } = useWorksFiltering();

  const searchValue = (toolbarProps.search?.search ?? '').trim().toLowerCase();
  const normalizedSearch = normalizeSearch(searchValue);

  const matchesSearch = (text: string) =>
    !normalizedSearch || normalizeSearch(text.toLowerCase()).includes(normalizedSearch);

  const matchesSelectedFilters = (item: FilterableItemData) => {
    const statusMatches =
      isWorksStatusValue(item.status) &&
      (selectedFilters.status.length === 0 || selectedFilters.status.includes(item.status));
    const languageMatches = selectedFilters.language.length === 0 || selectedFilters.language.includes(item.language);
    const genreMatches = selectedFilters.genre.length === 0 || selectedFilters.genre.includes(item.genre);

    return statusMatches && languageMatches && genreMatches;
  };

  const getVisibleGroups = <T extends GroupFilterData>(groups: readonly T[], numberSelector: (group: T) => string) =>
    sortGroups(
      groups.filter(
        (group) =>
          matchesSelectedFilters(group) &&
          (matchesSearch(group.title) ||
            matchesSearch(numberSelector(group)) ||
            matchesSearch(group.genre) ||
            group.works.some((work) => matchesSearch(work.title)))
      ),
      sortValue
    );

  const visibleOpusGroups = getVisibleGroups(WORKS_MOCK_DATA.opusGroups, (group) => group.opusNumber);

  const visibleUngroupedGroups = getVisibleGroups(WORKS_MOCK_DATA.ungroupedGroups, (group) => group.boNumber);

  // Extract all individual ungrouped works (when 'works' tab is active)
  const allUngroupedWorks = WORKS_MOCK_DATA.ungroupedGroups.flatMap((group) =>
    group.works.map((work) => ({
      id: work.id,
      title: work.title,
      year: work.year,
      genre: group.genre,
      status: group.status,
      updatedAt: group.updatedAt,
      language: group.language
    }))
  );

  const visibleUngroupedWorks = sortGroups(
    allUngroupedWorks.filter(
      (work) => matchesSelectedFilters(work) && (matchesSearch(work.title) || matchesSearch(work.genre))
    ),
    sortValue
  );

  const hasActiveCriteria = Boolean(searchValue) || Boolean(toolbarProps.activeFiltersCount);

  const content = (() => {
    const showOpus = activeTab === 'all' || activeTab === 'opus';
    const showUngrouped = activeTab === 'all' || activeTab === 'ungrouped';
    const showIndividualWorks = activeTab === 'all' || activeTab === 'works';

    const hasOpus = showOpus && visibleOpusGroups.length > 0;
    const hasUngrouped = showUngrouped && visibleUngroupedGroups.length > 0;
    const hasIndividualWorks = showIndividualWorks && visibleUngroupedWorks.length > 0;

    if (!hasOpus && !hasUngrouped && !hasIndividualWorks) {
      return (
        <EmptyState
          title={hasActiveCriteria ? WORKS_EMPTY_STATE_NO_RESULTS_TITLE : WORKS_EMPTY_STATE_TITLE}
          description={hasActiveCriteria ? WORKS_EMPTY_STATE_NO_RESULTS_DESCRIPTION : WORKS_EMPTY_STATE_DESCRIPTION}
        />
      );
    }

    return (
      <Box sx={styles.worksListContainer}>
        <WorksTableHeader />

        {showOpus && <GroupRowsList groups={visibleOpusGroups} />}

        {showUngrouped && <GroupRowsList groups={visibleUngroupedGroups} />}

        {showIndividualWorks && visibleUngroupedWorks.map((work) => <IndividualWorkRow key={work.id} work={work} />)}
      </Box>
    );
  })();

  return (
    <Box sx={styles.pageContainer}>
      <PageHeader title={WORKS_PAGE_TITLE} activeTab={activeTab} tabs={WORKS_TABS} action={<WorksCreateAction />} />

      <FilteringToolbar
        {...toolbarProps}
        dataTestId="works-control-panel"
        bottomTrailingContent={<SortSelect {...sortProps} minWidth={208} dataTestId="works-sort-select" />}
      />

      {content}
    </Box>
  );
}
