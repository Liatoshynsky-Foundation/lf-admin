import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { UsedView } from './UsedView';

jest.mock('../../components/used-card/UsedCard', () => ({
  UsedCard: ({ fileName, onClick, testId }: any) => (
    <button data-testid={testId} onClick={onClick}>
      {fileName}
    </button>
  )
}));

jest.mock('../../components/media-grid/MediaGrid', () => ({
  MediaGrid: ({ items, renderCard }: any) => (
    <div data-testid="mocked-media-grid" role="grid">
      {items.map((item: any) => (
        <div key={item._id}>{renderCard(item)}</div>
      ))}
    </div>
  )
}));

describe('UsedView', () => {
  const mockOnPick = jest.fn();

  beforeEach(() => {
    mockOnPick.mockClear();
  });

  it('should render used view component', () => {
    render(<UsedView selected={null} onPick={mockOnPick} />);

    expect(screen.getByTestId('UsedView')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(<UsedView selected={null} onPick={mockOnPick} />);

    expect(screen.getByText('Зображення на сторінці')).toBeInTheDocument();
  });

  it('should render media grid', () => {
    render(<UsedView selected={null} onPick={mockOnPick} />);

    expect(screen.getByTestId('mocked-media-grid')).toBeInTheDocument();
  });

  it('should render multiple used cards', () => {
    render(<UsedView selected={null} onPick={mockOnPick} />);

    const pianoCards = screen.getAllByText('piano-studio.jpg');
    const composerCards = screen.getAllByText('composer-portrait.jpg');

    expect(pianoCards.length).toBeGreaterThan(0);
    expect(composerCards.length).toBeGreaterThan(0);
  });

  it('should call onPick when card is clicked', async () => {
    const user = userEvent.setup();
    render(<UsedView selected={null} onPick={mockOnPick} />);

    const firstCard = screen.getByTestId('UsedCard-1');
    await user.click(firstCard);

    expect(mockOnPick).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'used',
        fileName: 'piano-studio.jpg',
        locale: 'uk'
      })
    );
  });
});
