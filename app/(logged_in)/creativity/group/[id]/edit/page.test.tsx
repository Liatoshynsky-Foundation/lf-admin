import { render, screen } from '@testing-library/react';

import EditOpusGroupPage from './page';

const mockUseUpsertOpus = jest.fn((_args: unknown) => ({ mode: 'edit' }));

jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ id: 'opus-123' }))
}));

jest.mock('~/shared/hooks/use-upsert-opus/useUpsertOpus', () => ({
  useUpsertOpus: (args: unknown) => mockUseUpsertOpus(args as never)
}));

jest.mock('../../create/OpusView', () => ({
  __esModule: true,
  default: ({ mode }: { mode: string }) => <div data-testid="opus-view">{mode}</div>
}));

describe('EditOpusGroupPage', () => {
  it('renders OpusView in edit mode and passes the route id to the hook', () => {
    render(<EditOpusGroupPage />);

    expect(mockUseUpsertOpus).toHaveBeenCalledWith({ id: 'opus-123' });
    expect(screen.getByTestId('opus-view')).toHaveTextContent('edit');
  });
});
