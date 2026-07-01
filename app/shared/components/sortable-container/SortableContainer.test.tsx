import { render, screen } from '@testing-library/react';
import React from 'react';

import { SortableContainer, SortableContainerProps } from './SortableContainer';

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: jest.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="sortable-context">{children}</div>
  )),
  SortingStrategy: jest.fn(),
  verticalListSortingStrategy: jest.fn(),
}));

describe('SortableContainer', () => {
  const defaultProps: {
    id: string;
    items: string[]
  } = {
    id: 'container-1',
    items: ['item-1', 'item-2', 'item-3'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const runSimulation = (
    props: Partial<SortableContainerProps> = {}
  ) => {
    const { children = <span />, ...rest } = props;
    return render(
      <SortableContainer {...defaultProps} {...rest}>
        {children}
      </SortableContainer>
    );
  };

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = runSimulation();

      expect(container).toBeInTheDocument();
    });

    it('renders a single child', () => {
      runSimulation({ children: <div data-testid="child">content</div> });
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      runSimulation({
        children: [
          <div key="item-1" data-testid="item-1">Item 1</div>,
          <div key="item-2" data-testid="item-2">Item 2</div>,
          <div key="item-3" data-testid="item-3">Item 3</div>,
        ],
      });
      expect(screen.getByTestId('item-1')).toBeInTheDocument();
      expect(screen.getByTestId('item-2')).toBeInTheDocument();
      expect(screen.getByTestId('item-3')).toBeInTheDocument();
    });

    it('renders with an empty items array', () => {
      const { container } = runSimulation({
        id: 'empty',
        items: [],
        children: <div data-testid="empty-state">No items</div>,
      });
      expect(container).toBeInTheDocument();
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('wraps children inside SortableContext', () => {
      runSimulation({ children: <div data-testid="child">content</div> });
      const context = screen.getByTestId('sortable-context');
      expect(context).toContainElement(screen.getByTestId('child'));
    });
  });
});