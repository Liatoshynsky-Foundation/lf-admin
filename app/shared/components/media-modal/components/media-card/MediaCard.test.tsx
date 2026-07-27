import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MediaCard } from './MediaCard';

describe('MediaCard', () => {
  it('should render image with src and alt', () => {
    render(<MediaCard src="/test.jpg" alt="Test image" />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/test.jpg');
    expect(img).toHaveAttribute('alt', 'Test image');
  });

  it('should render bottom content when provided', () => {
    render(<MediaCard src="/test.jpg" alt="Test" bottomContent="filename.jpg" />);

    expect(screen.getByText('filename.jpg')).toBeInTheDocument();
  });

  it('should render top-left and top-right content when provided', () => {
    render(
      <MediaCard
        src="/test.jpg"
        alt="Test"
        topLeftContent={<div>Left content</div>}
        topRightContent={<div>Right content</div>}
      />
    );

    expect(screen.getByText('Left content')).toBeInTheDocument();
    expect(screen.getByText('Right content')).toBeInTheDocument();
  });

  it('should call onClick when card is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<MediaCard src="/test.jpg" alt="Test" onClick={handleClick} />);

    const card = screen.getByRole('img').parentElement!;
    await user.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply custom testId', () => {
    render(<MediaCard src="/test.jpg" alt="Test" testId="custom-card" />);

    expect(screen.getByTestId('custom-card')).toBeInTheDocument();
  });

  it('should render icon instead of standard image when iconSrc is provided', () => {
    render(<MediaCard src="/test.jpg" alt="Icon alt text" iconSrc="/icon.svg" />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/icon.svg');
    expect(img).toHaveAttribute('alt', 'Icon alt text');
  });
});
