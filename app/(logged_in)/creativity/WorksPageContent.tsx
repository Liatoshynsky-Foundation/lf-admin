'use client';

import { Box, Button } from '@mui/material';
import { ChevronDown } from 'lucide-react';
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
  WORKS_ERROR_STATE_DESCRIPTION,
  WORKS_ERROR_STATE_TITLE,
  WORKS_LOADING_STATE_DESCRIPTION,
  WORKS_LOADING_STATE_TITLE,
  WORKS_PAGE_TITLE,
  WORKS_TABS,
  WorksLanguageValue,
  WorksStatusValue,
  type WorksTabValue
} from '~/constants/creativity';
import type { FilesSortValue } from '~/constants/sort';
import ActionMenu from '~/shared/components/dropdown-menu/ActionMenu';
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
  titleData: {
    uk?: string | null;
    en?: string | null;
  };
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

type CompositionRowData = Readonly<{
  id: string;
  title: string;
  titleData: {
    uk?: string | null;
    en?: string | null;
  };
  year: string;
  genre: string;
  status: WorksStatusValue;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}>;

const localizedTitle = (title: { uk: string; en: string }) => title.uk || title.en;

function toGroupRowData(opus: GqlOpus): GroupRowData {
  const safeStatus = (opus.status as unknown as WorksStatusValue) || BaseContentStatuses.Draft;
  const safeName = opus.name ?? { uk: '', en: '' };

  return {
    id: opus.id,
    numberLabel: opus.number,
    title: localizedTitle(safeName),
    titleData: safeName,
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

function toStandaloneRowData(composition: GqlComposition): CompositionRowData {
  const safeStatus = (composition.status as unknown as WorksStatusValue) || BaseContentStatuses.Draft;

  return {
    id: composition.id,
    title: localizedTitle(composition.title),
    titleData: composition.title,
    year: composition.year ? String(composition.year) : '',
    genre: composition.genre ?? '',
    status: safeStatus,
    createdAt: composition.createdAt,
    updatedAt: composition.updatedAt
  };
}

function sortGroups<T extends { title: string; createdAt: string }>(
  groups: readonly T[],
  sortValue: FilesSortValue
): T[] {
  return [...groups].sort((left, right) => {
    if (sortValue === 'date_desc') {
      return Number(right.createdAt) - Number(left.createdAt);
    }

    if (sortValue === 'date_asc') {
      return Number(left.createdAt) - Number(right.createdAt);
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
  };

  const handleToggle = () => {
    setAnchorEl((previous) => (previous ? null : triggerRef.current));
  };

  return { anchorEl, triggerRef, handleClose, handleToggle };
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

      <ActionMenu
        anchorEl={anchorEl}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        menuItems={[
          {
            items: WORKS_CREATE_OPTIONS.map((option) => ({
              id: option.id,
              href: option.href,
              text: {
                name: option.label
              }
            }))
          }
        ]}
      />
    </>
  );
}

type ClientFilteringResult = readonly [GroupRowData[], GroupRowData[], ReturnType<typeof toStandaloneRowData>[]];

const clientFiltering = (
  opusGroupsData: AllOpusesQuery | undefined,
  ungroupedGroupsData: AllOpusesQuery | undefined,
  compositionsData: AllCompositionsQuery | undefined,
  selectedFilters: Readonly<{
    status: readonly WorksStatusValue[];
    language: readonly WorksLanguageValue[];
  }>,
  sortValue: FilesSortValue,
  matchesSearch: (text: string) => boolean
): ClientFilteringResult => {
  const getLanguage = (value: { uk?: string | null; en?: string | null }): WorksLanguageValue => {
    const hasUk = Boolean(value.uk?.trim());
    const hasEn = Boolean(value.en?.trim());

    if (hasUk && hasEn) {
      return 'bilingual';
    }

    if (hasEn) {
      return 'en';
    }

    return 'uk';
  };

  const matchesStatus = (status: WorksStatusValue) =>
    selectedFilters.status.length === 0 || selectedFilters.status.includes(status);

  const matchesLanguage = (title: { uk?: string | null; en?: string | null }) =>
    selectedFilters.language.length === 0 || selectedFilters.language.includes(getLanguage(title));

  const matchGroup = (group: { title: string; numberLabel: string; genre: string }) =>
    matchesSearch(group.title) || matchesSearch(group.numberLabel) || matchesSearch(group.genre);

  const matchComposition = (work: { title: string; genre: string }) =>
    matchesSearch(work.title) || matchesSearch(work.genre);

  const mappedOpusGroups = sortGroups(
    (opusGroupsData?.allOpuses ?? [])
      .map(toGroupRowData)
      .filter((group) => matchGroup(group) && matchesLanguage(group.titleData) && matchesStatus(group.status)),
    sortValue
  );

  const mappedUngroupedGroups = sortGroups(
    (ungroupedGroupsData?.allOpuses ?? [])
      .map(toGroupRowData)
      .filter((group) => matchGroup(group) && matchesLanguage(group.titleData) && matchesStatus(group.status)),
    sortValue
  );

  const visibleUngroupedWorks = sortGroups(
    (compositionsData?.allCompositions ?? [])
      .map(toStandaloneRowData)
      .filter((work) => matchComposition(work) && matchesLanguage(work.titleData) && matchesStatus(work.status)),
    sortValue
  );
  return [mappedOpusGroups, mappedUngroupedGroups, visibleUngroupedWorks] as const;
};

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

  const [mappedOpusGroups, mappedUngroupedGroups, visibleUngroupedWorks] = clientFiltering(
    opusGroupsData,
    ungroupedGroupsData,
    compositionsData,
    selectedFilters,
    sortValue,
    matchesSearch
  );

  const hasOpus = mappedOpusGroups.length > 0;
  const hasUngrouped = mappedUngroupedGroups.length > 0;
  const hasCompositions = visibleUngroupedWorks.length > 0;

  const hasBaseItems =
    (showOpus && hasOpus) || (showUngrouped && hasUngrouped) || (showCompositions && hasCompositions);
  const hasActiveCriteria = Boolean(searchValue) || Boolean(toolbarProps.activeFiltersCount);
  const isLoading =
    (showOpus && isOpusGroupsLoading) ||
    (showUngrouped && isUngroupedGroupsLoading) ||
    (showCompositions && isCompositionsLoading);
  const activeError = opusGroupsError ?? ungroupedGroupsError ?? compositionsError;

  const shouldShowLoadingState = !hasBaseItems && isLoading;
  const shouldShowErrorState = !hasBaseItems && Boolean(activeError);

  const content = (() => {
    if (shouldShowLoadingState) {
      return <EmptyState title={WORKS_LOADING_STATE_TITLE} description={WORKS_LOADING_STATE_DESCRIPTION} />;
    }

    if (shouldShowErrorState) {
      return <EmptyState title={WORKS_ERROR_STATE_TITLE} description={WORKS_ERROR_STATE_DESCRIPTION} />;
    }

    if (!hasBaseItems) {
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
