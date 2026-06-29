import { useSortable } from '@dnd-kit/sortable';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { SortableItemWrapper, useSortableItemContext } from './SortableItemWrapper';

jest.mock('@dnd-kit/sortable', () => ({
  useSortable: jest.fn()
}));

jest.mock('../grip/Grip', () => ({
  Grip: () => <div data-testid="grip-mock" />
}));

const TestChild = () => {
  const context = useSortableItemContext();
  return (
    <div data-testid="test-child">
      ID: {context.id}
    </div>
  );
};

describe('SortableItemWrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSortable as jest.Mock).mockReturnValue({
      attributes: { 'aria-describedby': 'dnd-desc' },
      listeners: { onKeyDown: jest.fn() },
      setNodeRef: jest.fn(),
      transform: null,
      transition: undefined,
      isDragging: false,
    });
  });

  it('should render children and provide context', () => {
    render(
      <SortableItemWrapper id="test-1">
        <TestChild />
      </SortableItemWrapper>
    );

    expect(screen.getByTestId('test-child')).toHaveTextContent('ID: test-1');
    expect(screen.queryByTestId('grip-mock')).not.toBeInTheDocument();
  });

  it('should render Grip if gripHandle is true', () => {
    render(
      <SortableItemWrapper id="test-1" gripHandle>
        <TestChild />
      </SortableItemWrapper>
    );

    expect(screen.getByTestId('grip-mock')).toBeInTheDocument();
  });

  it('should throw error when context hook is used outside provider', () => {
    const TestFaultyComponent = () => {
      useSortableItemContext();
      return null;
    };

    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestFaultyComponent />)).toThrow(
      'useSortableItemContext must be used within a SortableItem Provider'
    );

    spy.mockRestore();
  });

});
