import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { UsedCard } from './UsedCard';

jest.mock('../media-card/MediaCard', () => ({
  MediaCard: ({ src, alt, onClick, topRightContent, bottomContent, testId }: any) => (
    <div data-testid={testId} onClick={onClick}>
      <img src={src} alt={alt} />
      {topRightContent}
      {bottomContent}
    </div>
  )
}));

describe('UsedCard', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('should render image with correct src and fileName', () => {
    render(<UsedCard src="/test.jpg" fileName="test-image.jpg" locale="uk" onClick={mockOnClick} />);

    expect(screen.getByAltText('test-image.jpg')).toHaveAttribute('src', '/test.jpg');
    expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup();
    render(<UsedCard src="/test.jpg" fileName="test.jpg" locale="uk" onClick={mockOnClick} testId="used-card" />);

    const card = screen.getByTestId('used-card');
    await user.click(card);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should display UA badge when locale is uk', () => {
    render(<UsedCard src="/test.jpg" fileName="test.jpg" locale="uk" onClick={mockOnClick} />);

    expect(screen.getByText('UA')).toBeInTheDocument();
  });

  it('should display EN badge when locale is en', () => {
    render(<UsedCard src="/test.jpg" fileName="test.jpg" locale="en" onClick={mockOnClick} />);

    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('should render with custom testId', () => {
    render(
      <UsedCard src="/test.jpg" fileName="test.jpg" locale="uk" onClick={mockOnClick} testId="custom-used-card" />
    );

    expect(screen.getByTestId('custom-used-card')).toBeInTheDocument();
  });
});
