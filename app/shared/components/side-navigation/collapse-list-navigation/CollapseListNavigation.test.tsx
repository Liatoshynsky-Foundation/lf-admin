import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CollapseListNavigationProps,LinkElementProps, ListElementType } from 'app/types/sideNavigation';
import React from 'react';

import { CollapseListNavigation } from './CollapseListNavigation';

jest.mock('@mui/material', () => {
  const original = jest.requireActual('@mui/material');
  return {
    ...original,
    Collapse: ({ children, in: isOpen }: { children: React.ReactNode; in?: boolean }) =>
      isOpen ? <div data-testid="collapse-content">{children}</div> : null,
    Popper: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
      open ? <div data-testid="popper-content">{children}</div> : null
  };
});

jest.mock('../link-element/LinkElement', () => ({
  LinkElement: ({ element }: LinkElementProps) => <div>{element.title}</div>
}));

jest.mock('../list-element/ListElement', () => ({
  ListElement: ({ children, handleClick, element }: LinkElementProps) => (
    <div data-testid="list-element" onClick={handleClick} role="button" aria-label={element.title}>
      {element.title}
      {children}
    </div>
  )
}));

describe('CollapseListNavigation', () => {
  const mockSubItems: ListElementType[] = [
    { title: 'Sub1', href: '/sub1', iconSrc: 'sub1.svg' },
    { title: 'Sub2', href: '/sub2', iconSrc: 'sub2.svg' }
  ];

  const elementsProps: CollapseListNavigationProps['elementProps'] = {
    element: { title: 'Parent', iconSrc: 'icon.svg' },
    collapseElements: mockSubItems
  };

  const mockOnExpansionChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render parent element title when navbar is open', () => {
    render(
      <CollapseListNavigation
        openNavbar={true}
        elementProps={elementsProps}
        onExpansionChange={mockOnExpansionChange}
      />
    );
    expect(screen.getByText('Parent')).toBeInTheDocument();
  });

  it('should toggle submenu on click when openNavbar is true', async () => {
    render(
      <CollapseListNavigation
        openNavbar={true}
        elementProps={elementsProps}
        onExpansionChange={mockOnExpansionChange}
      />
    );

    const parent = screen.getByRole('button', { name: 'Parent' });

    fireEvent.click(parent);
    expect(screen.getByText('Sub1')).toBeInTheDocument();

    fireEvent.click(parent);
    await waitFor(() => {
      expect(screen.queryByText('Sub1')).not.toBeInTheDocument();
    });
  });

  it('should show submenu on mouse enter and hide on leave when openNavbar is false', async () => {
    const { container } = render(
      <CollapseListNavigation
        openNavbar={false}
        elementProps={elementsProps}
        onExpansionChange={mockOnExpansionChange}
      />
    );

    const box = container.firstChild as HTMLElement;

    fireEvent.mouseEnter(box);
    expect(screen.getByText('Sub1')).toBeInTheDocument();

    fireEvent.mouseLeave(box);
    await waitFor(() => {
      expect(screen.queryByText('Sub1')).not.toBeInTheDocument();
    });
  });

  it('should close submenu and trigger callback when openNavbar toggles to false', async () => {
    const { rerender } = render(
      <CollapseListNavigation
        openNavbar={true}
        elementProps={elementsProps}
        onExpansionChange={mockOnExpansionChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Parent' }));
    expect(screen.getByText('Sub1')).toBeInTheDocument();

    rerender(
      <CollapseListNavigation
        openNavbar={false}
        elementProps={elementsProps}
        onExpansionChange={mockOnExpansionChange}
      />
    );

    expect(mockOnExpansionChange).toHaveBeenCalledWith(false);
    await waitFor(() => {
      expect(screen.queryByText('Sub1')).not.toBeInTheDocument();
    });
  });

  it('should trigger onExpansionChange when clicked in collapsed navbar state', () => {
    render(
      <CollapseListNavigation
        openNavbar={false}
        elementProps={elementsProps}
        onExpansionChange={mockOnExpansionChange}
      />
    );

    const parent = screen.getByRole('button', { name: 'Parent' });
    fireEvent.click(parent);

    expect(mockOnExpansionChange).toHaveBeenCalledWith(true);
  });

  it('should correctly display icons based on submenu open state', () => {
    render(<CollapseListNavigation openNavbar={true} elementProps={elementsProps} />);

    expect(screen.getByAltText('close list')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Parent' }));
    expect(screen.getByAltText('open list')).toBeInTheDocument();
  });

  it('should not trigger onExpansionChange on click when openNavbar is true', () => {
    render(
      <CollapseListNavigation
        openNavbar={true}
        elementProps={elementsProps}
        onExpansionChange={mockOnExpansionChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Parent' }));
    expect(mockOnExpansionChange).not.toHaveBeenCalled();
  });
});
