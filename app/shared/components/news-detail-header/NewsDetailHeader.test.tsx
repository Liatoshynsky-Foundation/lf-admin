import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';

import { NewsDetailHeader } from './NewsDetailHeader';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('~/public/icons/arrowLeft.svg', () => 'ArrowLeftIcon');
jest.mock('~/public/icons/pencil.svg', () => 'PencilIcon');

describe('NewsDetailHeader', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the news title', () => {
    render(<NewsDetailHeader title="Test News Title" newsId="123" />);

    expect(screen.getByText('Test News Title')).toBeInTheDocument();
  });

  it('navigates to news list when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<NewsDetailHeader title="Test News" newsId="123" />);

    const backButton = screen.getByLabelText('Back to all news');
    await user.click(backButton);

    expect(mockPush).toHaveBeenCalledWith('/news');
  });

  it('navigates to edit page when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<NewsDetailHeader title="Test News" newsId="123" />);

    const editButton = screen.getByRole('button', { name: /перейти до редагування/i });
    await user.click(editButton);

    expect(mockPush).toHaveBeenCalledWith('/news/123/edit');
  });
});
