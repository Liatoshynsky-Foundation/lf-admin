import { fireEvent, render, screen } from '@testing-library/react';

import { CurrencyTabs } from './CurrencyTabs';
import { RequisiteItem } from '~/constants/requisites';

describe('CurrencyTabs', () => {
  const mockItems: RequisiteItem[] = [
    { id: '1', currency: 'UAH', content: 'UAH text' },
    { id: '2', currency: 'USD', content: 'USD text' }
  ];

  it('renders all currency tabs and active tab indicator', () => {
    const handleSelect = jest.fn();
    const handleAdd = jest.fn();
    const handleUpdate = jest.fn();
    const handleDelete = jest.fn();
    const setEditingId = jest.fn();

    render(
      <CurrencyTabs
        items={mockItems}
        activeId="1"
        editingId={null}
        onSelectTab={handleSelect}
        onAddTab={handleAdd}
        onUpdateCurrency={handleUpdate}
        onDeleteTab={handleDelete}
        setEditingId={setEditingId}
      />
    );

    expect(screen.getByText('UAH')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByTestId('tab-indicator')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Опції реквізиту' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /додати реквізити/i })).toBeInTheDocument();
  });

  it('calls onSelectTab when an inactive tab is clicked', () => {
    const handleSelect = jest.fn();
    render(
      <CurrencyTabs
        items={mockItems}
        activeId="1"
        editingId={null}
        onSelectTab={handleSelect}
        onAddTab={jest.fn()}
        onUpdateCurrency={jest.fn()}
        onDeleteTab={jest.fn()}
        setEditingId={jest.fn()}
      />
    );

    fireEvent.click(screen.getByText('USD'));
    expect(handleSelect).toHaveBeenCalledWith('2');
  });

  it('calls onAddTab when Add button is clicked', () => {
    const handleAdd = jest.fn();
    render(
      <CurrencyTabs
        items={mockItems}
        activeId="1"
        editingId={null}
        onSelectTab={jest.fn()}
        onAddTab={handleAdd}
        onUpdateCurrency={jest.fn()}
        onDeleteTab={jest.fn()}
        setEditingId={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /додати реквізити/i }));
    expect(handleAdd).toHaveBeenCalledTimes(1);
  });

  it('opens menu on 3-dots click and handles rename action', () => {
    const setEditingId = jest.fn();
    render(
      <CurrencyTabs
        items={mockItems}
        activeId="1"
        editingId={null}
        onSelectTab={jest.fn()}
        onAddTab={jest.fn()}
        onUpdateCurrency={jest.fn()}
        onDeleteTab={jest.fn()}
        setEditingId={setEditingId}
      />
    );

    const optionsButton = screen.getByRole('button', { name: 'Опції реквізиту' });
    fireEvent.click(optionsButton);

    const renameItem = screen.getByText('Редагувати назву');
    expect(renameItem).toBeInTheDocument();

    fireEvent.click(renameItem);
    expect(setEditingId).toHaveBeenCalledWith('1');
  });

  it('opens menu on 3-dots click and handles delete action', () => {
    const handleDelete = jest.fn();
    render(
      <CurrencyTabs
        items={mockItems}
        activeId="1"
        editingId={null}
        onSelectTab={jest.fn()}
        onAddTab={jest.fn()}
        onUpdateCurrency={jest.fn()}
        onDeleteTab={handleDelete}
        setEditingId={jest.fn()}
      />
    );

    const optionsButton = screen.getByRole('button', { name: 'Опції реквізиту' });
    fireEvent.click(optionsButton);

    const deleteItem = screen.getByText('Видалити реквізит');
    expect(deleteItem).toBeInTheDocument();

    fireEvent.click(deleteItem);
    expect(handleDelete).toHaveBeenCalledWith('1');
  });

  it('renders input when editingId matches tab id and commits on Enter', () => {
    const handleUpdate = jest.fn();
    const setEditingId = jest.fn();

    render(
      <CurrencyTabs
        items={mockItems}
        activeId="1"
        editingId="1"
        onSelectTab={jest.fn()}
        onAddTab={jest.fn()}
        onUpdateCurrency={handleUpdate}
        onDeleteTab={jest.fn()}
        setEditingId={setEditingId}
      />
    );

    const input = screen.getByDisplayValue('UAH');
    fireEvent.change(input, { target: { value: 'EUR' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(handleUpdate).toHaveBeenCalledWith('1', 'EUR');
    expect(setEditingId).toHaveBeenCalledWith(null);
  });
});
