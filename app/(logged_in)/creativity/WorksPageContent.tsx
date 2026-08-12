'use client';

import { Box, Button } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';

import { useCreateWorkAction } from './(composition)/useCreateWorkAction';
import { useWorksFiltering } from './useWorksFiltering';
import { styles } from './WorksPageContent.styles';
import { WorksTable } from './WorksTable';
import {
  ITEMS_PER_PAGE,
  WORKS_BASE_PATH,
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
  type WorksTabValue
} from '~/constants/creativity';
import ActionMenu from '~/shared/components/dropdown-menu/ActionMenu';
import { EmptyState } from '~/shared/components/empty-state';
import { FilteringToolbar, SortSelect } from '~/shared/components/filtering-toolbar';
import CompositionModal from '~/shared/components/forms/opus-details-block/composition-modal/CompositionModal';
import { PageHeader } from '~/shared/components/page-header/PageHeader';
import { Pagination } from '~/shared/components/pagination/Pagination';
import { usePaginatedWorks } from '~/shared/hooks/use-opuses/useOpuses';
import { WorksTab } from '~/types/graphql/generated/graphql';
import { normalizeSearch } from '~/utils/normalizeSearch';

type WorksPageContentProps = Readonly<{
  activeTab: WorksTabValue;
}>;

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
  const { isModalOpen, openModal, closeModal, clearError, error, handleSubmit } = useCreateWorkAction();

  return (
    <>
      <Button
        ref={triggerRef}
        variant="contained"
        onClick={handleToggle}
        endIcon={<ChevronDown size={18} aria-hidden="true" />}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchorEl)}
        sx={styles.createButton}
      >
        Створити
      </Button>

      <ActionMenu
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        menuItems={[
          {
            items: [
              { id: 'work', text: { name: 'Твір' }, onClick: openModal },
              { id: 'group', text: { name: 'Група' }, href: `${WORKS_BASE_PATH}/group/create` }
            ]
          }
        ]}
      />

      {isModalOpen && (
        <CompositionModal
          open={isModalOpen}
          mode="create"
          onClose={closeModal}
          onSubmit={handleSubmit}
          error={error}
          onClearError={clearError}
        />
      )}
    </>
  );
}

export function WorksPageContent({ activeTab }: WorksPageContentProps) {
  const [page, setPage] = useState(1);

  const { requestFilters, sortValue, selectedFilters, toolbarProps, sortProps } = useWorksFiltering();
  const searchValue = normalizeSearch(toolbarProps.search?.search ?? '');

  useEffect(() => {
    setPage(1);
  }, [activeTab, searchValue, selectedFilters.status, selectedFilters.language, sortValue]);

  const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const { items, totalPages, totalItems, loading, error } = usePaginatedWorks(activeTab as WorksTab, {
    ...requestFilters,
    limit: ITEMS_PER_PAGE,
    skip: (page - 1) * ITEMS_PER_PAGE
  });

  const hasBaseItems = totalItems > 0;
  const hasActiveCriteria = Boolean(searchValue) || Boolean(toolbarProps.activeFiltersCount);

  const shouldShowLoadingState = !hasBaseItems && loading;
  const shouldShowErrorState = !hasBaseItems && Boolean(error);

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

    return <WorksTable items={items} activeTab={activeTab} />;
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

      {totalPages > 1 && <Pagination totalPages={totalPages} currentPage={page} onPageChange={handlePageChange} />}
    </Box>
  );
}
