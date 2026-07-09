'use client';

import { Box, Button, MenuItem } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';

import { useWorksFiltering } from './useWorksFiltering';
import { styles } from './WorksPageContent.styles';
import { WorksTable } from './WorksTable';
import {
  WORKS_CREATE_OPTIONS,
  WORKS_EMPTY_STATE_DESCRIPTION,
  WORKS_EMPTY_STATE_NO_RESULTS_DESCRIPTION,
  WORKS_EMPTY_STATE_NO_RESULTS_TITLE,
  WORKS_EMPTY_STATE_TITLE,
  WORKS_PAGE_TITLE,
  WORKS_TABS,
  WorksStatusValue,
  type WorksTabValue
} from '~/constants/creativity';
import type { FilesSortValue } from '~/constants/sort';
import DropdownMenu from '~/shared/components/dropdown-menu/DropdownMenu';
import { EmptyState } from '~/shared/components/empty-state';
import { FilteringToolbar, SortSelect } from '~/shared/components/filtering-toolbar';
import { PageHeader } from '~/shared/components/page-header/PageHeader';
import { useAllCompositions } from '~/shared/hooks/use-compositions/useCompositions';
import { useAllOpusGroups, useAllUngroupedGroups } from '~/shared/hooks/use-opuses/useOpuses';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { AllCompositionsQuery, type AllOpusesQuery } from '~/types/graphql/generated/graphql';
import { normalizeSearch } from '~/utils/normalizeSearch';

type WorksPageContentProps = Readonly<{
  activeTab: WorksTabValue;
}>;

type GqlOpus = AllOpusesQuery['allOpuses'][number];
type GqlComposition = AllCompositionsQuery['allCompositions'][number];

type GroupRowData = Readonly<{
  id: string;
  numberLabel: string;
  title: string;
  genre: string;
  startDate: string;
  endDate?: string;
  status: WorksStatusValue;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  numberKind?: string | null;
  works: ReadonlyArray<{ id: string; title: string }>;
}>;

const localizedTitle = (title: { uk: string; en: string }) => title.uk || title.en;

function toGroupRowData(opus: GqlOpus): GroupRowData {
  const safeStatus = (opus.status as unknown as WorksStatusValue) || BaseContentStatuses.Draft;

  return {
    id: opus.id,
    numberLabel: opus.number,
    title: localizedTitle(opus.title),
    genre: opus.genre ?? '',
    startDate: opus.creationYear,
    endDate: opus.endYear ?? undefined,
    status: safeStatus,
    createdAt: opus.createdAt,
    updatedAt: opus.updatedAt,
    numberKind: opus.numberKind,
    works: (opus.compositions ?? []).map((c) => ({
      id: c.id,
      title: localizedTitle(c.title)
    }))
  };
}

function toStandaloneRowData(composition: GqlComposition) {
  const safeStatus = (composition.status as unknown as WorksStatusValue) || BaseContentStatuses.Draft;

  return {
    id: composition.id,
    title: localizedTitle(composition.title),
    year: composition.year ? String(composition.year) : '',
    genre: composition.genre ?? '',
    status: safeStatus,
    updatedAt: composition.updatedAt
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

  const handleClose = () => {
    setAnchorEl(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const handleToggle = () => {
    setAnchorEl((previous) => (previous ? null : triggerRef.current));
  };

  return { anchorEl, triggerRef, handleClose, handleToggle };
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

export function WorksPageContent({ activeTab }: WorksPageContentProps) {
  const { sortValue, selectedFilters, toolbarProps, sortProps } = useWorksFiltering();

  const searchValue = (toolbarProps.search?.search ?? '').trim().toLowerCase();
  const normalizedSearch = normalizeSearch(searchValue);

  const matchesSearch = (text: string) =>
    !normalizedSearch || normalizeSearch(text.toLowerCase()).includes(normalizedSearch);

  const showOpus = activeTab === 'all' || activeTab === 'opus';
  const showUngrouped = activeTab === 'all' || activeTab === 'ungrouped';
  const showCompositions = activeTab === 'all' || activeTab === 'works';

  const {
    data: opusGroupsData,
    loading: isOpusGroupsLoading,
    error: opusGroupsError
  } = useAllOpusGroups({}, { skip: !showOpus });

  const {
    data: ungroupedGroupsData,
    loading: isUngroupedGroupsLoading,
    error: ungroupedGroupsError
  } = useAllUngroupedGroups({}, { skip: !showUngrouped });

  const {
    data: compositionsData,
    loading: isCompositionsLoading,
    error: compositionsError
  } = useAllCompositions({}, { skip: !showCompositions });

  const matchesGenre = (genre: string) => selectedFilters.genre.length === 0 || selectedFilters.genre.includes(genre);

  const mappedOpusGroups = sortGroups(
    (opusGroupsData?.allOpuses ?? []).map(toGroupRowData).filter((group) => {
      return matchesSearch(group.title) || matchesSearch(group.numberLabel);
    }),
    sortValue
  );

  const mappedUngroupedGroups = sortGroups(
    (ungroupedGroupsData?.allOpuses ?? []).map(toGroupRowData).filter((group) => {
      return matchesSearch(group.title) || matchesSearch(group.numberLabel);
    }),
    sortValue
  );

  const visibleUngroupedWorks = sortGroups(
    (compositionsData?.allCompositions ?? [])
      .map(toStandaloneRowData)
      .filter((work) => matchesGenre(work.genre) && matchesSearch(work.title)),
    sortValue
  );

  const hasActiveCriteria = Boolean(searchValue) || Boolean(toolbarProps.activeFiltersCount);
  const isLoading =
    (showOpus && isOpusGroupsLoading) ||
    (showUngrouped && isUngroupedGroupsLoading) ||
    (showCompositions && isCompositionsLoading);
  const hasError = opusGroupsError || ungroupedGroupsError || compositionsError;

  const content = (() => {
    if (isLoading) {
      return null;
    }

    if (hasError) {
      return null;
    }

    const hasOpus = showOpus && mappedOpusGroups.length > 0;
    const hasUngrouped = showUngrouped && mappedUngroupedGroups.length > 0;
    const hasCompositions = showCompositions && visibleUngroupedWorks.length > 0;

    if (!hasOpus && !hasUngrouped && !hasCompositions) {
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
        showIndividualWorks={showCompositions}
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
