import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import CollapsibleBlock from './CollapsibleBlock';

jest.mock('~/public/icons/chevron-down.svg', () => {
  const DummyChevron = () => <svg data-testid="chevron-icon" />;
  DummyChevron.displayName = 'ChevronIcon';
  return DummyChevron;
});

describe('CollapsibleBlock', () => {
  const titleText = 'Test Block';

  it('should render the title', () => {
    render(
      <CollapsibleBlock title={titleText}>
        <div>Child Content</div>
      </CollapsibleBlock>
    );
    expect(screen.getByText(titleText)).toBeInTheDocument();
  });

  it('should render children when defaultExpanded is true', () => {
    render(
      <CollapsibleBlock title={titleText} defaultExpanded>
        <div>Child Content</div>
      </CollapsibleBlock>
    );
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('should toggle expansion on click', () => {
    render(
      <CollapsibleBlock title={titleText}>
        <div>Child Content</div>
      </CollapsibleBlock>
    );

    const cont = screen.getByTestId('inserted-container');

    expect(cont).toHaveStyle('visibility: hidden');

    fireEvent.click(screen.getByText(titleText));

    expect(cont).not.toHaveStyle('visibility: hidden');
  });
});
