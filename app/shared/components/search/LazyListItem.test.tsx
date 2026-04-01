import { render, screen } from '@testing-library/react';
import React from 'react';

import { VirtualizedListbox } from './LazyListItem';

describe('VirtualizedListbox', () => {
  it('should render children inside virtualized list', () => {
    render(
      <VirtualizedListbox>
        {[
          <div data-testid="item-1" key="1">
            Item 1
          </div>,
          <div data-testid="item-2" key="2">
            Item 2
          </div>
        ]}
      </VirtualizedListbox>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('should forward ref to list element', () => {
    const ref = React.createRef<HTMLUListElement>();

    render(<VirtualizedListbox ref={ref}>{[<div key="1">Item</div>]}</VirtualizedListbox>);

    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('UL');
  });
});
