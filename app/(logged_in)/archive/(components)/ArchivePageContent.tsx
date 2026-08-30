'use client';

import { Box, Typography } from '@mui/material';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { useArchiveFiltering } from '../(hooks)/useArchiveFiltering';
import { useFundPublishWarning } from '../(hooks)/useFundPublishWarning';
import { FundsTable } from './archive-funds-table/ArchiveFundsTable';
import { ArchiveCreateAction } from './ArchiveCreateAction';
import { styles } from './ArchivePageContent.styles';
import { PublishEmptyFundDialog } from './publish-empty-fund-dialog/PublishEmptyFundDialog';
import {
  ARCHIVE_EMPTY_STATE_NO_RESULTS_DESCRIPTION,
  ARCHIVE_EMPTY_STATE_NO_RESULTS_TITLE,
  ARCHIVE_ERROR_STATE_DESCRIPTION,
  ARCHIVE_ERROR_STATE_TITLE,
  ARCHIVE_ITEMS_PER_PAGE,
  ARCHIVE_LOADING_STATE_DESCRIPTION,
  ARCHIVE_LOADING_STATE_TITLE,
  ARCHIVE_PAGE_TITLE,
  ARCHIVE_TABS,
  type ArchiveTabValue
} from '~/constants/archive';
import {
  CASES_EMPTY_STATE_DESCRIPTION,
  CASES_EMPTY_STATE_NO_RESULTS_DESCRIPTION,
  CASES_EMPTY_STATE_NO_RESULTS_TITLE,
  CASES_EMPTY_STATE_TITLE,
  CASES_ERROR_STATE_DESCRIPTION,
  CASES_ERROR_STATE_TITLE,
  CASES_LOADING_STATE_DESCRIPTION,
  CASES_LOADING_STATE_TITLE
} from '~/constants/case';
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
import { useAllCases } from '~/shared/hooks/use-cases/useCases';
import { usePaginatedFunds, useUpdateFund } from '~/shared/hooks/use-funds/useFunds';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { CaseStatus, FundStatus } from '~/types/graphql/generated/graphql';

interface ArchivePageContentProps {
  activeTab: ArchiveTabValue;
}

export const ArchivePageContent = ({ activeTab }: ArchivePageContentProps) => {
  const { searchProps, statusFilterProps, appliedSearch } = useArchiveFiltering();
  const [page, setPage] = useState(1);
  const [publishCandidate, setPublishCandidate] = useState<Fund | null>(null);
  const [publishedOverrides, setPublishedOverrides] = useState<Record<string, string>>({});
  const [updateFund] = useUpdateFund();
  const checkFundPublishWarning = useFundPublishWarning();

  const filterValues = statusFilterProps.value;
  const isAllStatus = filterValues.length === 0;

  const showFunds = activeTab === 'all' || activeTab === 'fonds';
  const showCases = activeTab === 'all' || activeTab === 'cases';
  const isAllTab = activeTab === 'all';

  const search = appliedSearch || undefined;
  const statuses = isAllStatus ? undefined : filterValues;

  const { funds, totalPages, loading: fundsLoading, error: fundsError } = usePaginatedFunds(
    page,
    ARCHIVE_ITEMS_PER_PAGE,
    { search, statuses: statuses as FundStatus[] | undefined },
    { skip: !showFunds }
  );

  const { cases, loading: casesLoading, error: casesError } = useAllCases(
    { search, statuses: statuses as CaseStatus[] | undefined },
    { skip: !showCases }
  );

  useEffect(() => {
    setPage(1);
  }, [appliedSearch, filterValues]);

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

  const sortedFunds = [...fundsWithOverrides].sort((a, b) => Number(a.fundNumber) - Number(b.fundNumber));
  const sortedCases = [...cases].sort((a, b) => Number(a.caseNumber) - Number(b.caseNumber));

  const hasActiveSearch = Boolean(appliedSearch);
  const hasActiveStatusFilter = !isAllStatus;
  const hasActiveCriteria = hasActiveSearch || hasActiveStatusFilter;
  const hasFunds = sortedFunds.length > 0;
  const hasCases = sortedCases.length > 0;
  const isAllTabLoading = isAllTab && (fundsLoading || casesLoading);
  const isAllTabError = isAllTab && Boolean(fundsError || casesError);

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

  const fundsNoResultsTitle = isAllTab ? ARCHIVE_EMPTY_STATE_NO_RESULTS_TITLE : FUNDS_EMPTY_STATE_NO_RESULTS_TITLE;
  const fundsNoResultsDescription = isAllTab
    ? ARCHIVE_EMPTY_STATE_NO_RESULTS_DESCRIPTION
    : FUNDS_EMPTY_STATE_NO_RESULTS_DESCRIPTION;

  const renderFundsSection = () => {
    if (fundsLoading) {
      return (
        <EmptyState title={FUNDS_LOADING_STATE_TITLE} description={FUNDS_LOADING_STATE_DESCRIPTION} />
      );
    }

    if (fundsError) {
      return (
        <EmptyState title={FUNDS_ERROR_STATE_TITLE} description={FUNDS_ERROR_STATE_DESCRIPTION} />
      );
    }

    if (hasFunds) {
      return (
        <FundsTable
          funds={sortedFunds}
          hasActiveSearch={hasActiveSearch}
          hasActiveStatusFilter={hasActiveStatusFilter}
          onPublish={handlePublishRequest}
        />
      );
    }

    if (isAllTab && hasCases) {
      return null;
    }

    if (hasActiveCriteria) {
      return <EmptyState title={fundsNoResultsTitle} description={fundsNoResultsDescription} />;
    }

    return <EmptyState title={FUNDS_EMPTY_STATE_TITLE} description={FUNDS_EMPTY_STATE_DESCRIPTION} />;
  };

  const renderCasesSection = () => {
    if (casesLoading) {
      return (
        <EmptyState title={CASES_LOADING_STATE_TITLE} description={CASES_LOADING_STATE_DESCRIPTION} />
      );
    }

    if (casesError) {
      return (
        <EmptyState title={CASES_ERROR_STATE_TITLE} description={CASES_ERROR_STATE_DESCRIPTION} />
      );
    }

    if (hasCases) {
      return (
        <Box component="ul" data-testid="cases-list" sx={styles.casesList}>
          {sortedCases.map((archiveCase) => (
            <Box component="li" key={archiveCase.id} sx={styles.caseItem}>
              <Typography variant="textMd">
                {archiveCase.caseNumber} — {archiveCase.name}
              </Typography>
            </Box>
          ))}
        </Box>
      );
    }

    if (isAllTab) {
      return null;
    }

    if (hasActiveCriteria) {
      return (
        <EmptyState
          title={CASES_EMPTY_STATE_NO_RESULTS_TITLE}
          description={CASES_EMPTY_STATE_NO_RESULTS_DESCRIPTION}
        />
      );
    }

    return <EmptyState title={CASES_EMPTY_STATE_TITLE} description={CASES_EMPTY_STATE_DESCRIPTION} />;
  };

  const renderSections = () => {
    if (isAllTabLoading) {
      return (
        <EmptyState title={ARCHIVE_LOADING_STATE_TITLE} description={ARCHIVE_LOADING_STATE_DESCRIPTION} />
      );
    }

    if (isAllTabError) {
      return (
        <EmptyState title={ARCHIVE_ERROR_STATE_TITLE} description={ARCHIVE_ERROR_STATE_DESCRIPTION} />
      );
    }

    return (
      <>
        {showFunds && renderFundsSection()}
        {showCases && renderCasesSection()}
      </>
    );
  };

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

      <Box sx={styles.sections}>{renderSections()}</Box>

      {showFunds && totalPages > 1 && (
        <Pagination totalPages={totalPages} currentPage={page} onPageChange={handlePageChange} />
      )}

      <PublishEmptyFundDialog
        open={Boolean(publishCandidate)}
        onCancel={() => setPublishCandidate(null)}
        onConfirm={handleConfirmEmptyFundPublish}
      />
    </Box>
  );
};
