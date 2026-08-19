import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MediaCard } from './MediaCard';

const DEFAULT_MEDIA_CARD_PROPS = {
  src: '/test.jpg',
  alt: 'Test media'
};
const MEDIA_CARD_CONTENT = {
  bottom: 'filename.jpg',
  topLeft: 'Left content',
  topRight: 'Right content'
};
const ICON_MEDIA_CARD_PROPS = {
  ...DEFAULT_MEDIA_CARD_PROPS,
  alt: 'Icon media',
  iconSrc: '/icon.svg'
};
const CUSTOM_MEDIA_CARD_PROPS = {
  ...DEFAULT_MEDIA_CARD_PROPS,
  testId: 'custom-card'
};
const SELECTED_MEDIA_CARD_PROPS = {
  ...DEFAULT_MEDIA_CARD_PROPS,
  isSelected: true
};

const SELECTED_MEDIA_CARD_OPACITY = '0.65';

describe('MediaCard', () => {
  it('should render media with src and alt', () => {
    render(<MediaCard {...DEFAULT_MEDIA_CARD_PROPS} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', DEFAULT_MEDIA_CARD_PROPS.src);
    expect(img).toHaveAttribute('alt', DEFAULT_MEDIA_CARD_PROPS.alt);
  });

  it('should render bottom content when provided', () => {
    render(<MediaCard {...DEFAULT_MEDIA_CARD_PROPS} bottomContent={MEDIA_CARD_CONTENT.bottom} />);

    expect(screen.getByText(MEDIA_CARD_CONTENT.bottom)).toBeInTheDocument();
  });

  it('should render top-left and top-right content when provided', () => {
    render(
      <MediaCard
        {...DEFAULT_MEDIA_CARD_PROPS}
        topLeftContent={<div>{MEDIA_CARD_CONTENT.topLeft}</div>}
        topRightContent={<div>{MEDIA_CARD_CONTENT.topRight}</div>}
      />
    );

    expect(screen.getByText(MEDIA_CARD_CONTENT.topLeft)).toBeInTheDocument();
    expect(screen.getByText(MEDIA_CARD_CONTENT.topRight)).toBeInTheDocument();
  });

  it('should call onClick when card is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<MediaCard {...DEFAULT_MEDIA_CARD_PROPS} onClick={handleClick} />);

    const card = screen.getByRole('img').parentElement!;
    await user.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply custom testId', () => {
    render(<MediaCard {...CUSTOM_MEDIA_CARD_PROPS} />);

    expect(screen.getByTestId(CUSTOM_MEDIA_CARD_PROPS.testId)).toBeInTheDocument();
  });

  it('should render icon media when iconSrc is provided', () => {
    render(<MediaCard {...ICON_MEDIA_CARD_PROPS} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', ICON_MEDIA_CARD_PROPS.iconSrc);
    expect(img).toHaveAttribute('alt', ICON_MEDIA_CARD_PROPS.alt);
  });

  it('should apply selected styling to the media container', () => {
    render(<MediaCard {...SELECTED_MEDIA_CARD_PROPS} />);

    expect(screen.getByRole('img').parentElement).toHaveStyle({ opacity: SELECTED_MEDIA_CARD_OPACITY });
  });
});
