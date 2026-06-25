import { render, screen } from '@testing-library/react';
import React from 'react';

import { SortableBoard } from './SortableBoard';

jest.mock('@dnd-kit/core', () => ({
  DndContext: jest.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="dnd-context">{children}</div>
  )),
  useSensors: jest.fn().mockReturnValue([]),
  useSensor: jest.fn(),
  PointerSensor: jest.fn(),
  closestCenter: jest.fn(),
}));


describe('SortableBoard', () => {
  const mockOnDragEnd = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <SortableBoard onDragEnd={mockOnDragEnd}>
        <span />
      </SortableBoard>
    );

    expect(container).toBeInTheDocument();
  });

  it('renders a single child', () => {
    render(
      <SortableBoard onDragEnd={mockOnDragEnd}>
        <div data-testid="child">content</div>
      </SortableBoard>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <SortableBoard onDragEnd={mockOnDragEnd}>
        <div data-testid="first">First</div>
        <div data-testid="second">Second</div>
        <div data-testid="third">Third</div>
      </SortableBoard>
    );

    expect(screen.getByTestId('first')).toBeInTheDocument();
    expect(screen.getByTestId('second')).toBeInTheDocument();
    expect(screen.getByTestId('third')).toBeInTheDocument();
  });

  it('wraps children inside DndContext', () => {
    render(
      <SortableBoard onDragEnd={mockOnDragEnd}>
        <div data-testid="child">content</div>
      </SortableBoard>
    );

    const context = screen.getByTestId('dnd-context');
    expect(context).toContainElement(screen.getByTestId('child'));
  });

});