'use client';
import { Box } from '@mui/material';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { useArchiveFiltering } from '../(hooks)/useArchiveFiltering';
import { useFundPublishWarning } from '../(hooks)/useFundPublishWarning';
import { FundsTable } from './archive-funds-table/ArchiveFundsTable';
import { ArchiveCreateAction } from './ArchiveCreateAction';
import { styles } from './ArchivePageContent.styles';
import { PublishEmptyFundDialog } from './publish-empty-fund-dialog/PublishEmptyFundDialog';
import {
  ARCHIVE_ITEMS_PER_PAGE,
  ARCHIVE_PAGE_TITLE,
  ARCHIVE_TABS,
  type ArchiveTabValue
} from '~/constants/archive';
import { FundErrors } from '~/constants/errors';
import {
  type Fund,
  FUND_PUBLISH_SUCCESS_MESSAGE,
  FUNDS_EMPTY_STATE_DESCRIPTION,
  FUNDS_EMPTY_STATE_NO_RESULTS_DESCRIPTION,
  FUNDS_EMPTY_STATE_NO_RESULTS_TITLE,
  FUNDS_EMPTY_STATE_TITLE,
  FUNDS_ERROR_STATE_DESCRIPTION,
  FUNDS_ERROR_STATE_TITLE,
  FUNDS_LOADING_STATE_DESCRIPTION,
  FUNDS_LOADING_STATE_TITLE
} from '~/constants/fund';
import { EmptyState } from '~/shared/components/empty-state';
import { PageHeader } from '~/shared/components/page-header/PageHeader';
import { Pagination } from '~/shared/components/pagination/Pagination';
import { SearchStatusToolbar } from '~/shared/components/search-status-toolbar/SearchStatusToolbar';
import { usePaginatedFunds, useUpdateFund } from '~/shared/hooks/use-funds/useFunds';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { FundStatus } from '~/types/graphql/generated/graphql';

interface ArchivePageContentProps {
  activeTab: ArchiveTabValue;
}

export const ArchivePageContent = ({ activeTab }: ArchivePageContentProps) => {
  const { searchProps, statusFilterProps } = useArchiveFiltering();
  const [page, setPage] = useState(1);
  const [publishCandidate, setPublishCandidate] = useState<Fund | null>(null);
  const [publishedOverrides, setPublishedOverrides] = useState<Record<string, string>>({});
  const [updateFund] = useUpdateFund();
  const checkFundPublishWarning = useFundPublishWarning();

  const searchValue = searchProps.search;
  const filterValues = statusFilterProps.value;
  const isAllStatus = filterValues.length === 0;

  const { funds, totalPages, loading, error } = usePaginatedFunds(page, ARCHIVE_ITEMS_PER_PAGE, {
    search: searchValue || undefined,
    statuses: isAllStatus ? undefined : (filterValues as FundStatus[])
  });

  useEffect(() => {
    setPage(1);
  }, [searchValue, filterValues]);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const fundsWithOverrides = useMemo(
    () =>
      funds.map((fund) => {
        const updatedAt = publishedOverrides[fund.id];
        return updatedAt ? { ...fund, status: BaseContentStatuses.Published, updatedAt } : fund;
      }),
    [funds, publishedOverrides]
  );

  const ascSortedVisibleFunds = [...fundsWithOverrides].sort((a, b) => Number(a.fundNumber) - Number(b.fundNumber));

  const hasActiveSearch = Boolean(searchValue);
  const hasActiveStatusFilter = !isAllStatus;
  const hasActiveCriteria = hasActiveSearch || hasActiveStatusFilter;

  const publishFund = async (fund: Fund) => {
    try {
      const result = await updateFund({
        id: fund.id,
        input: { status: FundStatus.Published }
      });
      const updatedAt = result?.data?.updateFund?.updatedAt ?? new Date().toISOString();

      setPublishedOverrides((prev) => ({ ...prev, [fund.id]: updatedAt }));
      toast.success(FUND_PUBLISH_SUCCESS_MESSAGE);
    } catch {
      toast.error(FundErrors.FAILED_TO_PUBLISH);
    }
  };

  const handlePublishRequest = async (fund: Fund) => {
    if (fund.status !== BaseContentStatuses.Hidden) {
      return;
    }

    const warningResult = await checkFundPublishWarning({
      fundId: fund.id,
      casesCount: fund.cases
    });

    if (warningResult === 'error') {
      toast.error(FundErrors.FAILED_TO_PUBLISH);
      return;
    }

    if (warningResult === 'show-warning') {
      setPublishCandidate(fund);
      return;
    }

    await publishFund(fund);
  };

  const handleConfirmEmptyFundPublish = async () => {
    if (!publishCandidate) {
      return;
    }

    await publishFund(publishCandidate);
    setPublishCandidate(null);
  };

  const content = (() => {
    if (loading) {
      return <EmptyState title={FUNDS_LOADING_STATE_TITLE} description={FUNDS_LOADING_STATE_DESCRIPTION} />;
    }

    if (error) {
      return <EmptyState title={FUNDS_ERROR_STATE_TITLE} description={FUNDS_ERROR_STATE_DESCRIPTION} />;
    }

    if (ascSortedVisibleFunds.length > 0) {
      return (
        <FundsTable
          funds={ascSortedVisibleFunds}
          hasActiveSearch={hasActiveSearch}
          hasActiveStatusFilter={hasActiveStatusFilter}
          onPublish={handlePublishRequest}
        />
      );
    }

    if (hasActiveCriteria) {
      return (
        <EmptyState title={FUNDS_EMPTY_STATE_NO_RESULTS_TITLE} description={FUNDS_EMPTY_STATE_NO_RESULTS_DESCRIPTION} />
      );
    }

    return <EmptyState title={FUNDS_EMPTY_STATE_TITLE} description={FUNDS_EMPTY_STATE_DESCRIPTION} />;
  })();

  return (
    <Box sx={styles.pageContainer}>
      <PageHeader
        title={ARCHIVE_PAGE_TITLE}
        activeTab={activeTab}
        tabs={ARCHIVE_TABS}
        action={<ArchiveCreateAction />}
      />
      <SearchStatusToolbar
        dataTestId="archive-control-panel"
        searchProps={searchProps}
        statusFilterProps={statusFilterProps}
      />

      {content}

      {totalPages > 1 && <Pagination totalPages={totalPages} currentPage={page} onPageChange={handlePageChange} />}

      <PublishEmptyFundDialog
        open={Boolean(publishCandidate)}
        onCancel={() => setPublishCandidate(null)}
        onConfirm={handleConfirmEmptyFundPublish}
      />
    </Box>
  );
};
