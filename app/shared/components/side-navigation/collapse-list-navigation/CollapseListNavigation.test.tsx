import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { CollapseListNavigation } from './CollapseListNavigation';

describe('Collapse List Navigation', () => {
  const elementsTest = {
    element: { title: 'TestTitle', iconSrc: 'icon.svg' },
    collapseElements: [
      { title: 'Test1', href: '/test1' },
      { title: 'Test2', href: '/test2' }
    ]
  };
  it('should render collapse list navigation', () => {
    render(<CollapseListNavigation openNavbar elementProps={elementsTest} />);
    expect(screen.getByText('TestTitle')).toBeInTheDocument();
  });
  it('should open a collapsable list', () => {
    render(<CollapseListNavigation openNavbar elementProps={elementsTest} />);
    const button = screen.getByRole('button', { name: /TestTitle/i });
    fireEvent.click(button);
    expect(screen.getByText('Test1')).toBeInTheDocument();
  });
  it('should close submenu when sidebar is closed', async () => {
    const { rerender } = render(<CollapseListNavigation openNavbar elementProps={elementsTest} />);
    const button = screen.getByRole('button', { name: /TestTitle/i });

    fireEvent.click(button);
    expect(screen.getByText('Test1')).toBeInTheDocument();

    rerender(<CollapseListNavigation openNavbar={false} elementProps={elementsTest} />);
    await waitFor(() => {
      expect(screen.queryByText('Test1')).not.toBeInTheDocument();
    });
  });
});
