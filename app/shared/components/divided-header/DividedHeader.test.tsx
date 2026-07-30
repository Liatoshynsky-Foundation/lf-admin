import { fireEvent, render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import DividedHeader from './DividedHeader';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('~/lib/utils/sxToArray', () => ({
  sxToArray: jest.fn(() => [])
}));

describe('DividedHeader Component', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    });
  });

  it('should render children correctly', () => {
    render(
      <DividedHeader>
        <h1 data-testid="child-element">My Header Title</h1>
      </DividedHeader>
    );

    expect(screen.getByTestId('child-element')).toBeInTheDocument();
    expect(screen.getByText('My Header Title')).toBeInTheDocument();
  });

  it('should render the rightActionsComponent when provided', () => {
    render(
      <DividedHeader rightActionsComponent={<button>Save Changes</button>}>
        <h1>Title</h1>
      </DividedHeader>
    );

    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('should navigate to the defailt originUrl ("/") when the back button is clicked', () => {
    render(
      <DividedHeader>
        <h1>Title</h1>
      </DividedHeader>
    );

    const backButton = screen.getByRole('button', { name: 'Повернутись на сторінку /' });

    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('should navigate to a custom originUrl when one is provided', () => {
    const customUrl = '/dashboard/profile';

    render(
      <DividedHeader originUrl={customUrl}>
        <h1>Title</h1>
      </DividedHeader>
    );

    const backButton = screen.getByRole('button', { name: `Повернутись на сторінку ${customUrl}` });
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(customUrl);
  });

  it('should render without crashing when the sx prop is provided', () => {
    render(
      <DividedHeader sx={{ backgroundColor: 'red' }}>
        <h1>Title</h1>
      </DividedHeader>
    );

    const backButton = screen.getByRole('button');
    expect(backButton).toBeInTheDocument();
  });

  it('should call onBackClick when provided instead of routing', () => {
    const mockOnBackClick = jest.fn();

    render(
      <DividedHeader onBackClick={mockOnBackClick}>
        <h1>Title</h1>
      </DividedHeader>
    );

    const backButton = screen.getByRole('button');
    fireEvent.click(backButton);

    expect(mockOnBackClick).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });
});
