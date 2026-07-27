import { render, screen } from '@testing-library/react';

import { MediaGrid } from './MediaGrid';

describe('MediaGrid', () => {
  const mockItems = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
    { id: '3', name: 'Item 3' }
  ];

  it('should render all items using renderCard function', () => {
    render(
      <MediaGrid
        items={mockItems}
        renderCard={(item) => (
          <div key={item.id} data-testid={`card-${item.id}`}>
            {item.name}
          </div>
        )}
      />
    );

    expect(screen.getByTestId('card-1')).toBeInTheDocument();
    expect(screen.getByTestId('card-2')).toBeInTheDocument();
    expect(screen.getByTestId('card-3')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('should render with custom testIdPrefix', () => {
    render(
      <MediaGrid
        items={mockItems}
        renderCard={(item) => <div key={item.id}>{item.name}</div>}
        testIdPrefix="CustomGrid"
      />
    );

    expect(screen.getByTestId('CustomGrid')).toBeInTheDocument();
    expect(screen.getByTestId('CustomGrid-item-0')).toBeInTheDocument();
  });

  it('should render empty grid when no items provided', () => {
    render(<MediaGrid items={[]} renderCard={(item) => <div>{item}</div>} testIdPrefix="EmptyGrid" />);

    expect(screen.getByTestId('EmptyGrid')).toBeInTheDocument();
    expect(screen.queryByTestId('EmptyGrid-item-0')).not.toBeInTheDocument();
  });

  it('should handle items with _id or without identifier for fallback key logic', () => {
    const mixedItems = [{ _id: 'id-from-underscore', name: 'Item Underscore' }, { name: 'Item No ID' }];

    render(<MediaGrid items={mixedItems} renderCard={(item) => <div>{item.name}</div>} testIdPrefix="FallbackGrid" />);

    expect(screen.getByTestId('FallbackGrid-item-0')).toBeInTheDocument();
    expect(screen.getByTestId('FallbackGrid-item-1')).toBeInTheDocument();
  });
});
