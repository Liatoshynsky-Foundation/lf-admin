import { fireEvent, render, screen } from '@testing-library/react';

import CardsGrid from './CardsGrid';

describe('CardsGrid', () => {
  const mockItems = [
    { id: '1', title: 'First Item' },
    { id: '2', title: 'Second Item' }
  ];

  it('renders correctly with given items and dataTestId', () => {
    render(
      <CardsGrid dataTestId="custom-grid-id">
        {mockItems.map((item) => (
          <div key={item.id} data-testid="test-card">
            {item.title}
          </div>
        ))}
      </CardsGrid>
    );

    expect(screen.getByTestId('custom-grid-id')).toBeInTheDocument();

    const cards = screen.getAllByTestId('test-card');
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent('First Item');
    expect(cards[1]).toHaveTextContent('Second Item');
  });

  it('correctly executes interactive elements inside children', () => {
    const handleClick = jest.fn();

    render(
      <CardsGrid>
        {mockItems.map((item) => (
          <button key={item.id} type="button" data-testid="test-button" onClick={() => handleClick(item)}>
            Click me
          </button>
        ))}
      </CardsGrid>
    );

    const buttons = screen.getAllByTestId('test-button');
    fireEvent.click(buttons[0]);

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(mockItems[0]);
  });
});
