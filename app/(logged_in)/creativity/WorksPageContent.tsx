'use client';

import { Box, Button, MenuItem } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';

import { useWorksFiltering } from './useWorksFiltering';
import { type OpusGroup, type UngroupedGroup, WORKS_MOCK_DATA, type WorkStatus } from './works.mock';
import { styles } from './WorksPageContent.styles';
import { WorksTable } from './WorksTable';
import {
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

    const mappedOpusGroups = visibleOpusGroups.map(toGroupRowData);
    const mappedUngroupedGroups = visibleUngroupedGroups.map(toGroupRowData);

    const hasOpus = showOpus && mappedOpusGroups.length > 0;
    const hasUngrouped = showUngrouped && mappedUngroupedGroups.length > 0;
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
      <WorksTable
        visibleOpusGroups={mappedOpusGroups}
        visibleUngroupedGroups={mappedUngroupedGroups}
        visibleUngroupedWorks={visibleUngroupedWorks}
        showOpus={showOpus}
        showUngrouped={showUngrouped}
        showIndividualWorks={showIndividualWorks}
      />
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
