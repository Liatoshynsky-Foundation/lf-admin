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

  const DEFAULT_GALLERY_CARD_PROPS = {
    src: '/test.jpg',
    fileName: 'test.jpg',
    isStarred: false,
    onClick: mockOnClick
  };
  const GALLERY_CARD_VALUES = {
    selectedTestId: 'selected-gallery-card',
    customTestId: 'custom-gallery-card'
  };
  const SELECTED_GALLERY_CARD_PROPS = {
    ...DEFAULT_GALLERY_CARD_PROPS,
    isSelected: true,
    testId: GALLERY_CARD_VALUES.selectedTestId
  };
  const SELECTED_GALLERY_CARD_OPACITY = '0.65';

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('should render media with correct src and fileName', () => {
    render(<GalleryCard {...DEFAULT_GALLERY_CARD_PROPS} />);

    expect(screen.getByAltText(DEFAULT_GALLERY_CARD_PROPS.fileName)).toHaveAttribute(
      'src',
      DEFAULT_GALLERY_CARD_PROPS.src
    );
    expect(screen.getByText(DEFAULT_GALLERY_CARD_PROPS.fileName)).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup();
    render(<GalleryCard {...DEFAULT_GALLERY_CARD_PROPS} testId="gallery-card" />);

    await user.click(screen.getByAltText(DEFAULT_GALLERY_CARD_PROPS.fileName));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should render with custom testId', () => {
    render(<GalleryCard {...DEFAULT_GALLERY_CARD_PROPS} testId={GALLERY_CARD_VALUES.customTestId} />);

    expect(screen.getByTestId(GALLERY_CARD_VALUES.customTestId)).toBeInTheDocument();
  });

  it('should render without icons when not starred and no usage locations', () => {
    render(<GalleryCard {...DEFAULT_GALLERY_CARD_PROPS} />);

    expect(screen.getByText(DEFAULT_GALLERY_CARD_PROPS.fileName)).toBeInTheDocument();
  });

  it('should render with starred state', () => {
    render(<GalleryCard {...DEFAULT_GALLERY_CARD_PROPS} isStarred />);

    expect(screen.getByText(DEFAULT_GALLERY_CARD_PROPS.fileName)).toBeInTheDocument();
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

    expect(screen.getByText(DEFAULT_GALLERY_CARD_PROPS.fileName)).toBeInTheDocument();
  });

  it('should apply selected styling to the media container', () => {
    render(<GalleryCard {...SELECTED_GALLERY_CARD_PROPS} />);

    expect(screen.getByTestId(SELECTED_GALLERY_CARD_PROPS.testId).firstElementChild).toHaveStyle({
      opacity: SELECTED_GALLERY_CARD_OPACITY
    });
  });
});
