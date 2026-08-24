import { render, screen } from '@testing-library/react';

import EditFundPage from './page';

const mockUseUpsertFund = jest.fn();
jest.mock('~/shared/hooks/use-upsert-fund/useUpsertFund', () => ({
  __esModule: true,
  useUpsertFund: () => mockUseUpsertFund()
}));

jest.mock('../../../create/FundView', () => ({
  __esModule: true,
  default: ({ mode }: { mode: string }) => <div data-testid="fund-view">{mode}</div>
}));

describe('EditFundPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUpsertFund.mockReturnValue({
      details: {},
      setDetails: jest.fn(),
      errors: {},
      forceShowErrors: false,
      isSaved: true,
      handleSave: jest.fn()
    });
  });

  it('renders FundView in edit mode with the data from useUpsertFund', () => {
    render(<EditFundPage />);

    expect(mockUseUpsertFund).toHaveBeenCalled();
    expect(screen.getByTestId('fund-view')).toHaveTextContent('edit');
  });
});
