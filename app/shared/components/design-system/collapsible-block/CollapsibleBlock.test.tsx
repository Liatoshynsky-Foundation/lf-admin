import { act,fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import CollapsibleBlock from './CollapsibleBlock';
import { useStore } from '~/store';

jest.mock('~/public/icons/chevron-down.svg', () => {
  const DummyChevron = () => <svg data-testid="chevron-icon" />;
  DummyChevron.displayName = 'ChevronIcon';
  return DummyChevron;
});

jest.mock('~/public/icons/eye.svg', () => {
  const Eye = () => <span>eye</span>;
  Eye.displayName = 'Eye';
  return Eye;
});

jest.mock('~/public/icons/eye-closed.svg', () => {
  const EyeClosed = () => <span>closed eye</span>;
  EyeClosed.displayName = 'EyeClosed';
  return EyeClosed;
});

jest.mock('../../grip/Grip');

describe('CollapsibleBlock', () => {
  const titleText = 'Test Block';

  afterEach(() => {
    act(() => {
      useStore.setState({ isSaving: false });
    });
  });

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

  it('should render the draggable grip if grip is true', () => {
    render(
      <CollapsibleBlock title={titleText} grip>
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

  it('should lock its own pointer events and dim itself when a save is in progress', () => {
    act(() => {
      useStore.setState({ isSaving: true });
    });

    const { container } = render(
      <CollapsibleBlock title={titleText}>
        <div>Child Content</div>
      </CollapsibleBlock>
    );

    const accordionRoot = container.firstChild as HTMLElement;
    expect(accordionRoot).toHaveStyle('pointer-events: none');
    expect(accordionRoot).toHaveStyle('opacity: 0.6');
  });

  it('should keep pointer events enabled when not saving', () => {
    act(() => {
      useStore.setState({ isSaving: false });
    });

    const { container } = render(
      <CollapsibleBlock title={titleText}>
        <div>Child Content</div>
      </CollapsibleBlock>
    );

    const accordionRoot = container.firstChild as HTMLElement;
    expect(accordionRoot).toHaveStyle('pointer-events: auto');
    expect(accordionRoot).toHaveStyle('opacity: 1');
  });
});
