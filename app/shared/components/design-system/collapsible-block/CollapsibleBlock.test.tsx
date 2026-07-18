import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import CollapsibleBlock from './CollapsibleBlock';

jest.mock('~/public/icons/chevron-down.svg', () => {
  const DummyChevron = () => <svg data-testid="chevron-icon" />;
  DummyChevron.displayName = 'ChevronIcon';
  return DummyChevron;
});

jest.mock('../../grip/Grip');

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

  it('should render the draggable grip if grip is true', ()=> {
    render(
      <CollapsibleBlock title={titleText} grip >
        <div>Child Content</div>
      </CollapsibleBlock>
    );
    expect(screen.getByTestId('grip-mock')).toBeInTheDocument();
  });

  it('should not render the visibility toggle when onToggleVisibility is not provided', () => {
    render(
      <CollapsibleBlock title={titleText}>
        <div>Child Content</div>
      </CollapsibleBlock>
    );

    expect(screen.queryByRole('button', { name: /розділ/ })).not.toBeInTheDocument();
  });

  it('should call onToggleVisibility when the toggle is clicked, without expanding/collapsing the accordion', () => {
    const onToggleVisibility = jest.fn();
    render(
      <CollapsibleBlock title={titleText} onToggleVisibility={onToggleVisibility}>
        <div>Child Content</div>
      </CollapsibleBlock>
    );

    const cont = screen.getByTestId('inserted-container');
    expect(cont).toHaveStyle('visibility: hidden');

    fireEvent.click(screen.getByRole('button', { name: 'Приховати розділ' }));

    expect(onToggleVisibility).toHaveBeenCalledTimes(1);
    expect(cont).toHaveStyle('visibility: hidden');
  });

  it('should reflect hidden=true in the toggle aria-label and icon', () => {
    render(
      <CollapsibleBlock title={titleText} hidden onToggleVisibility={jest.fn()}>
        <div>Child Content</div>
      </CollapsibleBlock>
    );

    expect(screen.getByRole('button', { name: 'Показати розділ' })).toBeInTheDocument();
  });

  it('should call onToggleVisibility on Enter and Space key presses, and ignore other keys', () => {
    const onToggleVisibility = jest.fn();
    render(
      <CollapsibleBlock title={titleText} onToggleVisibility={onToggleVisibility}>
        <div>Child Content</div>
      </CollapsibleBlock>
    );

    const toggle = screen.getByRole('button', { name: 'Приховати розділ' });

    fireEvent.keyDown(toggle, { key: 'a' });
    expect(onToggleVisibility).not.toHaveBeenCalled();

    fireEvent.keyDown(toggle, { key: 'Enter' });
    expect(onToggleVisibility).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(toggle, { key: ' ' });
    expect(onToggleVisibility).toHaveBeenCalledTimes(2);
  });
});
