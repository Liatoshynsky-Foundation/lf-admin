import { useHasPublishedCasesInFund } from '~/shared/hooks/use-funds/useFunds';

type FundPublishWarningResult = 'publish' | 'show-warning' | 'error';

interface FundPublishWarningParams {
  fundId?: string | null;
  casesCount: number;
}

export const useFundPublishWarning = () => {
  const hasPublishedCasesInFund = useHasPublishedCasesInFund();

  return async ({ fundId, casesCount }: FundPublishWarningParams): Promise<FundPublishWarningResult> => {
    if (!fundId) {
      return casesCount === 0 ? 'show-warning' : 'publish';
    }
    try {
      const hasPublishedCases = await hasPublishedCasesInFund(fundId);
      return hasPublishedCases ? 'publish' : 'show-warning';
    } catch {
      return 'error';
    }
  };
};
