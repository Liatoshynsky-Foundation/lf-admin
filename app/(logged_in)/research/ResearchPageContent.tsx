'use client';

import { Box } from '@mui/material';
import { useState } from 'react';

import { RESEARCH_WORKS_MOCK_DATA, type ResearchWork } from './research.mock';
import { ResearchContent } from './ResearchContent';
import { ResearchCreateAction } from './ResearchCreateAction';
import { styles } from './ResearchPageContent.styles';
import { useResearchWorksFiltering } from './useResearchWorksFiltering';
import { RESEARCH_PAGE_TITLE } from '~/constants/research';
import { FilteringToolbar, SortSelect } from '~/shared/components/filtering-toolbar';
import { PageHeader } from '~/shared/components/page-header/PageHeader';
import ResearchModal from '~/shared/components/research-modal/ResearchModal';
import { FilterSelect } from '~/shared/components/selector/FilterSelect';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { normalizeSearch } from '~/utils/normalizeSearch';

export function ResearchPageContent() {
  const { sortValue, selectedFilters, toolbarProps, sortProps, statusFilterProps, activeFiltersCount } =
    useResearchWorksFiltering();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedWork, setSelectedWork] = useState<ResearchWork | null>(null);

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedWork(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (work: ResearchWork) => {
    setModalMode('edit');
    setSelectedWork(work);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWork(null);
  };

  const searchValue = (toolbarProps.search?.search ?? '').trim().toLowerCase();
  const normalizedSearch = normalizeSearch(searchValue);

  const matchesSearch = (text: string) =>
    !normalizedSearch || normalizeSearch(text.toLowerCase()).includes(normalizedSearch);

  const filtered = RESEARCH_WORKS_MOCK_DATA.filter((work) => {
    const statusMatches = selectedFilters.status.length === 0 || selectedFilters.status.includes(work.status);
    const searchMatches =
      matchesSearch(work.author) || matchesSearch(work.bibliographicDescription) || matchesSearch(work.keywords);

    return statusMatches && searchMatches;
  });

  const visibleWorks = [...filtered].sort((left, right) => {
    if (sortValue === 'name_asc') {
      return left.author.localeCompare(right.author, 'uk');
    }
    if (sortValue === 'name_desc') {
      return right.author.localeCompare(left.author, 'uk');
    }

    const leftDate = new Date(left.updatedAt).getTime();
    const rightDate = new Date(right.updatedAt).getTime();

    return sortValue === 'date_asc' ? leftDate - rightDate : rightDate - leftDate;
  });

  const hasActiveCriteria = Boolean(searchValue) || Boolean(activeFiltersCount);

  return (
    <Box sx={styles.pageContainer}>
      <PageHeader title={RESEARCH_PAGE_TITLE} action={<ResearchCreateAction onClick={handleOpenCreate} />} />

      <FilteringToolbar
        search={toolbarProps.search}
        dataTestId="research-control-panel"
        rightSlot={<FilterSelect {...statusFilterProps} />}
        bottomTrailingContent={<SortSelect {...sortProps} minWidth={208} dataTestId="research-sort-select" />}
      />

      <ResearchContent visibleWorks={visibleWorks} hasActiveCriteria={hasActiveCriteria} onEditWork={handleOpenEdit} />
      <ResearchModal
        isOpen={isModalOpen}
        mode={modalMode}
        onClose={handleCloseModal}
        initialData={
          selectedWork
            ? {
              bibliographicDescription: selectedWork.bibliographicDescription,
              author: selectedWork.author,
              keywords: selectedWork.keywords,
              caseDates: String(selectedWork.year),
              isVisibleOnSite: selectedWork.status === BaseContentStatuses.Published
            }
            : undefined
        }
      />
    </Box>
  );
}
