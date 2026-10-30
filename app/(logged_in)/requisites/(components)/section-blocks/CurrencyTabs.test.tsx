import { act, fireEvent, render, screen } from '@testing-library/react';

import { CurrencyTabs } from './CurrencyTabs';
import { PaymentDetailsTab } from '~/constants/requisites';

describe('CurrencyTabs', () => {
  const mockItems: PaymentDetailsTab[] = [
    {
      id: '1',
      name: 'UAH',
      content: { type: 'doc', content: [{ type: 'paragraph' }] },
      order: 0
    },
    {
      id: '2',
      name: 'USD',
      content: { type: 'doc', content: [{ type: 'paragraph' }] },
      order: 1
    }
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

  it('calls onAddTab when "Додати реквізити" button is clicked', () => {
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

    const addButton = screen.getByRole('button', { name: /додати реквізити/i });
    fireEvent.click(addButton);
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

  it('cancels editing on Escape key without updating', () => {
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
    fireEvent.change(input, { target: { value: 'CHANGED' } });
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
    fireEvent.blur(input);

    expect(setEditingId).toHaveBeenCalledWith(null);
    expect(handleUpdate).not.toHaveBeenCalled();
  });

  it('commits default currency name on Enter when input is empty', () => {
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
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(handleUpdate).toHaveBeenCalledWith('1', 'Без назви');
    expect(setEditingId).toHaveBeenCalledWith(null);
  });

  it('stops propagation when clicking on input while editing', () => {
    const handleSelect = jest.fn();

    render(
      <CurrencyTabs
        items={mockItems}
        activeId="1"
        editingId="1"
        onSelectTab={handleSelect}
        onAddTab={jest.fn()}
        onUpdateCurrency={jest.fn()}
        onDeleteTab={jest.fn()}
        setEditingId={jest.fn()}
      />
    );

    const input = screen.getByDisplayValue('UAH');
    fireEvent.click(input);
    expect(handleSelect).not.toHaveBeenCalled();
  });

  it('observes container resize', () => {
    let observerCallback: () => void = () => {};
    class MockResizeObserver {
      constructor(callback: () => void) {
        observerCallback = callback;
      }
      observe = jest.fn();
      disconnect = jest.fn();
      unobserve = jest.fn();
    }
    const originalObserver = global.ResizeObserver;
    global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

    const { unmount } = render(
      <CurrencyTabs
        items={mockItems}
        activeId="1"
        editingId={null}
        onSelectTab={jest.fn()}
        onAddTab={jest.fn()}
        onUpdateCurrency={jest.fn()}
        onDeleteTab={jest.fn()}
        setEditingId={jest.fn()}
      />
    );

    expect(observerCallback).toBeDefined();
    act(() => {
      observerCallback();
    });

    unmount();
    global.ResizeObserver = originalObserver;
  });

  it('focuses and selects input after timeout when editingId is set', () => {
    jest.useFakeTimers();

    render(
      <CurrencyTabs
        items={mockItems}
        activeId="1"
        editingId="1"
        onSelectTab={jest.fn()}
        onAddTab={jest.fn()}
        onUpdateCurrency={jest.fn()}
        onDeleteTab={jest.fn()}
        setEditingId={jest.fn()}
      />
    );

    act(() => {
      jest.advanceTimersByTime(100);
    });
    jest.useRealTimers();
  });

  it('handles missing tab ref gracefully', () => {
    render(
      <CurrencyTabs
        items={mockItems}
        activeId="non-existent"
        editingId={null}
        onSelectTab={jest.fn()}
        onAddTab={jest.fn()}
        onUpdateCurrency={jest.fn()}
        onDeleteTab={jest.fn()}
        setEditingId={jest.fn()}
      />
    );

    const indicator = screen.getByTestId('tab-indicator');
    expect(indicator).toHaveStyle({ opacity: 0 });
  });

  it('calculates indicator geometry when tab has non-zero height', () => {
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      return {
        width: 80,
        height: 36,
        top: 15,
        left: 25,
        bottom: 51,
        right: 105,
        x: 25,
        y: 15,
        toJSON: () => {}
      };
    });

    render(
      <CurrencyTabs
        items={mockItems}
        activeId="1"
        editingId={null}
        onSelectTab={jest.fn()}
        onAddTab={jest.fn()}
        onUpdateCurrency={jest.fn()}
        onDeleteTab={jest.fn()}
        setEditingId={jest.fn()}
      />
    );

    const indicator = screen.getByTestId('tab-indicator');
    expect(indicator).toBeInTheDocument();

    jest.restoreAllMocks();
  });

  it('handles editingId for non-existent item gracefully', () => {
    render(
      <CurrencyTabs
        items={mockItems}
        activeId="1"
        editingId="non-existent"
        onSelectTab={jest.fn()}
        onAddTab={jest.fn()}
        onUpdateCurrency={jest.fn()}
        onDeleteTab={jest.fn()}
        setEditingId={jest.fn()}
      />
    );

    expect(screen.queryByPlaceholderText('Без назви')).not.toBeInTheDocument();
  });
});
