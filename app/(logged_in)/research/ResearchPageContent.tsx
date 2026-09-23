'use client';

import { Box } from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { ResearchContent } from './ResearchContent';
import { ResearchCreateAction } from './ResearchCreateAction';
import { styles } from './ResearchPageContent.styles';
import { useResearchWorksFiltering } from './useResearchWorksFiltering';
import {
  RESEARCH_DELETE_CONFIRM,
  RESEARCH_ERROR_STATE_DESCRIPTION,
  RESEARCH_ERROR_STATE_TITLE,
  RESEARCH_ITEMS_PER_PAGE,
  RESEARCH_LOADING_STATE_DESCRIPTION,
  RESEARCH_LOADING_STATE_TITLE,
  RESEARCH_MUTATION_RESULTS,
  RESEARCH_PAGE_TITLE
} from '~/constants/research';
import { resolveErrorMessage } from '~/lib/utils/resolveErrorMessage';
import DeleteCardModal from '~/shared/components/delete-card-modal/DeleteCardModal';
import { EmptyState } from '~/shared/components/empty-state';
import { FilteringToolbar } from '~/shared/components/filtering-toolbar';
import { PageHeader } from '~/shared/components/page-header/PageHeader';
import { Pagination } from '~/shared/components/pagination/Pagination';
import ResearchModal from '~/shared/components/research-modal/ResearchModal';
import { FilterSelect } from '~/shared/components/selector/FilterSelect';
import {
  useDeleteResearchWork,
  usePaginatedResearchWorks,
  useUpdateResearchWorkStatus
} from '~/shared/hooks/use-research-works/useResearchWorks';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { ResearchWorkStatus } from '~/types/graphql/generated/graphql';
import type { ResearchWork } from '~/types/researchWork';

export function ResearchPageContent() {
  const { requestFilters, searchValue, selectedFilters, toolbarProps, statusFilterProps, activeFiltersCount } =
    useResearchWorksFiltering();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedWork, setSelectedWork] = useState<ResearchWork | null>(null);
  const [workToDelete, setWorkToDelete] = useState<ResearchWork | null>(null);
  const [page, setPage] = useState(1);

  const { items: visibleWorks, totalPages, loading, error } = usePaginatedResearchWorks(
    page,
    RESEARCH_ITEMS_PER_PAGE,
    requestFilters
  );
  const [deleteResearchWork] = useDeleteResearchWork();
  const [updateResearchWorkStatus] = useUpdateResearchWorkStatus();

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

  const handleRequestDelete = (work: ResearchWork) => {
    setWorkToDelete(work);
  };

  const handleCloseDeleteModal = () => {
    setWorkToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!workToDelete) {
      return;
    }

    try {
      await deleteResearchWork(workToDelete.id);
      toast.success(RESEARCH_MUTATION_RESULTS.deleted);
      setWorkToDelete(null);
    } catch (error) {
      toast.error(resolveErrorMessage(error, RESEARCH_MUTATION_RESULTS.deleteFailed));
    }
  };

  const handleToggleStatus = async (work: ResearchWork) => {
    const shouldPublish = work.status !== BaseContentStatuses.Published;
    const nextStatus = shouldPublish ? ResearchWorkStatus.Published : ResearchWorkStatus.Hidden;

    try {
      await updateResearchWorkStatus(work.id, { status: nextStatus });
      toast.success(shouldPublish ? RESEARCH_MUTATION_RESULTS.published : RESEARCH_MUTATION_RESULTS.hidden);
    } catch (error) {
      const fallback = shouldPublish
        ? RESEARCH_MUTATION_RESULTS.publishFailed
        : RESEARCH_MUTATION_RESULTS.hideFailed;
      toast.error(resolveErrorMessage(error, fallback));
    }
  };

  const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  let emptyReason: 'none' | 'search' | 'status' = 'none';
  if (searchValue) {
    emptyReason = 'search';
  } else if (activeFiltersCount > 0) {
    emptyReason = 'status';
  }

  useEffect(() => {
    setPage(1);
  }, [searchValue, selectedFilters.status]);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  let listContent = (
    <ResearchContent
      visibleWorks={visibleWorks}
      emptyReason={emptyReason}
      onEditWork={handleOpenEdit}
      onDeleteWork={handleRequestDelete}
      onToggleStatus={handleToggleStatus}
    />
  );

  if (loading) {
    listContent = (
      <EmptyState title={RESEARCH_LOADING_STATE_TITLE} description={RESEARCH_LOADING_STATE_DESCRIPTION} />
    );
  } else if (error) {
    listContent = <EmptyState title={RESEARCH_ERROR_STATE_TITLE} description={RESEARCH_ERROR_STATE_DESCRIPTION} />;
  }

  return (
    <Box sx={styles.pageContainer}>
      <PageHeader title={RESEARCH_PAGE_TITLE} action={<ResearchCreateAction onClick={handleOpenCreate} />} />

      <FilteringToolbar
        {...toolbarProps}
        dataTestId="research-control-panel"
        rightSlot={<FilterSelect {...statusFilterProps} />}
      />

      {listContent}
      {!loading && !error && totalPages > 1 && (
        <Pagination totalPages={totalPages} currentPage={page} onPageChange={handlePageChange} />
      )}

      <ResearchModal
        key={selectedWork?.id ?? 'create'}
        isOpen={isModalOpen}
        mode={modalMode}
        workId={selectedWork?.id}
        existingPdfFile={selectedWork?.pdfFile}
        onClose={handleCloseModal}
        initialData={
          selectedWork
            ? {
              bibliographicDescription: selectedWork.bibliographicDescription,
              author: selectedWork.author,
              keywords: selectedWork.keywords,
              caseDates: String(selectedWork.year),
              url: selectedWork.url ?? '',
              isVisibleOnSite: selectedWork.status === BaseContentStatuses.Published
            }
            : undefined
        }
      />

      <DeleteCardModal
        open={Boolean(workToDelete)}
        onClose={handleCloseDeleteModal}
        onDelete={handleConfirmDelete}
        description={
          workToDelete ? RESEARCH_DELETE_CONFIRM.title(workToDelete.bibliographicDescription) : undefined
        }
        confirmButtonText={RESEARCH_DELETE_CONFIRM.confirm}
        cancelButtonText={RESEARCH_DELETE_CONFIRM.cancel}
      />
    </Box>
  );
}
