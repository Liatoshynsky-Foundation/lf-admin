import { render, screen } from '@testing-library/react';

import CreateFondPage from './page';

const mockUseUpsertFond = jest.fn();
jest.mock('~/shared/hooks/use-upsert-fond/useUpsertFond', () => ({
  __esModule: true,
  useUpsertFond: () => mockUseUpsertFond()
}));

jest.mock('./FondView', () => ({
  __esModule: true,
  default: ({ mode }: { mode: string }) => <div data-testid="fond-view">{mode}</div>
}));

describe('CreateFondPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUpsertFond.mockReturnValue({
      details: {},
      setDetails: jest.fn(),
      errors: {},
      forceShowErrors: false,
      isSaved: true,
      handleSave: jest.fn()
    });
  });

  it('renders FondView in create mode with the data from useUpsertFond', () => {
    render(<CreateFondPage />);

    expect(mockUseUpsertFond).toHaveBeenCalled();
    expect(screen.getByTestId('fond-view')).toHaveTextContent('create');
  });
});