import { render, screen } from '@testing-library/react';

import CreateOpusGroupPage from './page';

jest.mock('~/shared/hooks/use-upsert-opus/useUpsertOpus', () => ({
  useUpsertOpus: jest.fn(() => ({ mode: 'create' }))
}));

jest.mock('./OpusView', () => ({
  __esModule: true,
  default: ({ mode }: { mode: string }) => <div data-testid="opus-view">{mode}</div>
}));

describe('CreateOpusGroupPage', () => {
  it('renders OpusView in create mode', () => {
    render(<CreateOpusGroupPage />);

    const view = screen.getByTestId('opus-view');
    expect(view).toBeInTheDocument();
    expect(view).toHaveTextContent('create');
  });
});
