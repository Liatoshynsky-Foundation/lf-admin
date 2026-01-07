import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { GalleryCard } from './GalleryCard';

jest.mock('~/public/icons/link.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="link-icon" />
}));

jest.mock('~/public/icons/star.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="star-icon" />
}));

describe('GalleryCard', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('should render image with correct src and fileName', () => {
    render(<GalleryCard src="/test.jpg" fileName="test-image.jpg" isStarred={false} onClick={mockOnClick} />);

    expect(screen.getByAltText('test-image.jpg')).toHaveAttribute('src', '/test.jpg');
    expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup();
    render(
      <GalleryCard src="/test.jpg" fileName="test.jpg" isStarred={false} onClick={mockOnClick} testId="gallery-card" />
    );

    const image = screen.getByAltText('test.jpg');
    await user.click(image);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should render with custom testId', () => {
    render(
      <GalleryCard
        src="/test.jpg"
        fileName="test.jpg"
        isStarred={false}
        onClick={mockOnClick}
        testId="custom-gallery-card"
      />
    );

    expect(screen.getByTestId('custom-gallery-card')).toBeInTheDocument();
  });

  it('should render without icons when not starred and no usage locations', () => {
    render(<GalleryCard src="/test.jpg" fileName="test.jpg" isStarred={false} onClick={mockOnClick} />);

    expect(screen.getByText('test.jpg')).toBeInTheDocument();
  });

  it('should render with starred state', () => {
    render(<GalleryCard src="/test.jpg" fileName="test.jpg" isStarred={true} onClick={mockOnClick} />);

    expect(screen.getByText('test.jpg')).toBeInTheDocument();
  });

  it('should render with usage locations', () => {
    render(
      <GalleryCard
        src="/test.jpg"
        fileName="test.jpg"
        isStarred={false}
        usageLocations={['Про Фундацію', 'Співпраця']}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('test.jpg')).toBeInTheDocument();
  });
});
