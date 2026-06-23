import { render, screen } from '@testing-library/react';
import React from 'react';

import { MenuItem } from '../row-variants/Row.types';
import { RowActions } from './RowActions';

jest.mock('./EditAction', () => ({
  EditAction: ({ href, label }: { href: string; label: string }) => (
    <a href={href} data-testid="mock-edit-action">
      {label}
    </a>
  )
}));

jest.mock('./ContextMenu', () => ({
  ContextMenu: ({ items, triggerLabel }: { items: readonly (readonly MenuItem[])[]; triggerLabel: string }) => (
    <button data-testid="mock-context-menu" data-items-count={items.flat().length}>
      {triggerLabel}
    </button>
  )
}));

const mockMenuItems: readonly (readonly MenuItem[])[] = [
  [
    { id: 'download', label: 'Download', href: '/works/1/download' },
    { id: 'delete', label: 'Delete', href: '/works/1/delete' }
  ]
];

describe('RowActions', () => {
  const menuActionsData = {
    menuItems: mockMenuItems,
    menuTriggerLabel: 'Дії для твору'
  };

  const editActionData = {
    editHref: '/works/1/edit',
    editLabel: 'Edit'
  };

  it('should return null (render nothing) when both actions are missing', () => {
    const { container } = render(<RowActions />);

    expect(container.firstChild).toBeNull();
  });

  it('should render only EditAction when editAction prop is provided', () => {
    render(<RowActions editAction={editActionData} />);

    const editLink = screen.getByTestId('mock-edit-action');
    expect(editLink).toBeInTheDocument();
    expect(editLink).toHaveAttribute('href', editActionData.editHref);
    expect(editLink).toHaveTextContent(editActionData.editLabel);

    expect(screen.queryByTestId('mock-context-menu')).not.toBeInTheDocument();
  });

  it('should render only ContextMenu when menuActions prop is provided', () => {
    render(<RowActions menuActions={menuActionsData} />);

    const contextMenu = screen.getByTestId('mock-context-menu');
    expect(contextMenu).toBeInTheDocument();
    expect(contextMenu).toHaveTextContent(menuActionsData.menuTriggerLabel);
    expect(contextMenu).toHaveAttribute('data-items-count', '2');

    expect(screen.queryByTestId('mock-edit-action')).not.toBeInTheDocument();
  });

  it('should render both EditAction and ContextMenu when all props are provided', () => {
    render(<RowActions editAction={editActionData} menuActions={menuActionsData} />);

    expect(screen.getByTestId('mock-edit-action')).toBeInTheDocument();
    expect(screen.getByTestId('mock-context-menu')).toBeInTheDocument();
  });
});
