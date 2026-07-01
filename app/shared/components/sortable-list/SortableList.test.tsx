import { render, screen } from '@testing-library/react';
import React from 'react';

import { SortableList } from './SortableList';

jest.mock('../sortable-board/SortableBoard', () => ({
  SortableBoard: ({ children }: any) => <div data-testid="mock-sortable-board">{children}</div>
}));

jest.mock('../sortable-container/SortableContainer', () => ({
  SortableContainer: ({ children }: any) => <div data-testid="mock-sortable-container">{children}</div>
}));

describe('SortableList', () => {
  it('should render SortableBoard and SortableContainer with children', () => {
    const onDragEndMock = jest.fn();
    render(
      <SortableList id="list-1" items={['1', '2']} onDragEnd={onDragEndMock}>
        <div data-testid="child">Child Content</div>
      </SortableList>
    );

    expect(screen.getByTestId('mock-sortable-board')).toBeInTheDocument();
    expect(screen.getByTestId('mock-sortable-container')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toHaveTextContent('Child Content');
  });
});
