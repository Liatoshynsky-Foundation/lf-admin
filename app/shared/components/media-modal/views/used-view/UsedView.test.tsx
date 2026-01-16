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

jest.mock('../../components/search-button/SearchButton', () => ({
  SearchButton: ({ value, onSearch, testId }: any) => (
    <input data-testid={testId} value={value} onChange={(e) => onSearch(e.target.value)} placeholder="Search" />
  )
}));

jest.mock('../../components/filter-dropdown/FilterDropdown', () => ({
  FilterDropdown: ({ label, value, onChange, testId }: any) => (
    <select data-testid={testId} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{label}</option>
    </select>
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

    const firstCard = screen.getByText('2025-01-10-newest.jpg');
    await user.click(firstCard);

    expect(mockOnPick).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'used',
        fileName: '2025-01-10-newest.jpg',
        locale: 'uk'
      })
    );
  });
});
