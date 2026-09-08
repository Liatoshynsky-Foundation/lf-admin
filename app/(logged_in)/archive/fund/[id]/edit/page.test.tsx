import { render, screen } from '@testing-library/react';
import React from 'react';

import EditFundPage from './page';
import { useUpsertFund } from '~/shared/hooks/use-upsert-fund/useUpsertFund';

jest.mock('~/shared/hooks/use-upsert-fund/useUpsertFund', () => ({
  useUpsertFund: jest.fn()
}));

jest.mock('../../../create/FundView', () => ({
  __esModule: true,
  default: ({ mode, data }: { mode: string; data: unknown }) => (
    <div data-testid="fund-view" data-mode={mode} data-fund-data={JSON.stringify(data)}>
      FundView Mock
    </div>
  )
}));

jest.mock('../../../create/page.styles', () => ({
  styles: {
    container: { display: 'flex' }
  }
}));

describe('EditFundPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the EditFundPage with FundView and correct props', () => {
    const mockFundData = { title: 'Test Fund', id: 'fund-123' };
    (useUpsertFund as jest.Mock).mockReturnValue(mockFundData);

    render(<EditFundPage />);

    const fundView = screen.getByTestId('fund-view');
    expect(fundView).toBeInTheDocument();
    expect(fundView).toHaveAttribute('data-mode', 'edit');
    expect(fundView).toHaveAttribute('data-fund-data', JSON.stringify(mockFundData));

    expect(useUpsertFund).toHaveBeenCalledTimes(1);
    expect(useUpsertFund).toHaveBeenCalledWith();
  });
});
