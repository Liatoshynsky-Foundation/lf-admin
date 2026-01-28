import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MockFilterDropdown, MockMediaGrid, MockSearchButton } from '../../test-utils/sharedMocks';
import { UsedView } from './UsedView';

jest.mock('../../components/used-card/UsedCard', () => ({
  UsedCard: ({ fileName, onClick, testId }: { fileName: string; onClick: () => void; testId: string }) => (
    <button data-testid={testId} onClick={onClick}>
      {fileName}
    </button>
  )
}));

jest.mock('../../components/search-button/SearchButton', () => ({
  SearchButton: MockSearchButton
}));

jest.mock('../../components/filter-dropdown/FilterDropdown', () => ({
  FilterDropdown: MockFilterDropdown
}));

jest.mock('../../components/media-grid/MediaGrid', () => ({
  MediaGrid: MockMediaGrid
}));

describe('UsedView', () => {
  const mockOnPick = jest.fn();
  const mockOnFiltersChange = jest.fn();
  const mockFilters = {
    search: '',
    language: ''
  };

  beforeEach(() => {
    mockOnPick.mockClear();
    mockOnFiltersChange.mockClear();
  });

  it('should render used view component', () => {
    render(
      <UsedView selected={null} onPick={mockOnPick} filters={mockFilters} onFiltersChange={mockOnFiltersChange} />
    );

    expect(screen.getByTestId('UsedView')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(
      <UsedView selected={null} onPick={mockOnPick} filters={mockFilters} onFiltersChange={mockOnFiltersChange} />
    );

    expect(screen.getByText('Зображення на сторінці')).toBeInTheDocument();
  });

  it('should render media grid', () => {
    render(
      <UsedView selected={null} onPick={mockOnPick} filters={mockFilters} onFiltersChange={mockOnFiltersChange} />
    );

    expect(screen.getByTestId('mocked-media-grid')).toBeInTheDocument();
  });

  it('should render multiple used cards', () => {
    render(
      <UsedView selected={null} onPick={mockOnPick} filters={mockFilters} onFiltersChange={mockOnFiltersChange} />
    );

    const pianoCards = screen.getAllByText('piano-studio.jpg');
    const composerCards = screen.getAllByText('composer-portrait.jpg');

    expect(pianoCards.length).toBeGreaterThan(0);
    expect(composerCards.length).toBeGreaterThan(0);
  });

  it('should call onPick when card is clicked', async () => {
    const user = userEvent.setup();
    render(
      <UsedView selected={null} onPick={mockOnPick} filters={mockFilters} onFiltersChange={mockOnFiltersChange} />
    );

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
