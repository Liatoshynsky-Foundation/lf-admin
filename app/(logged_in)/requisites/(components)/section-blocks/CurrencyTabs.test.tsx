import { act, fireEvent, render, screen } from '@testing-library/react';

import { CurrencyTabs } from './CurrencyTabs';
import { PaymentDetailsTab } from '~/constants/requisites';

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

const renderCurrencyTabs = (props: Partial<React.ComponentProps<typeof CurrencyTabs>> = {}) => {
  return render(
    <CurrencyTabs
      items={mockItems}
      activeId="1"
      editingId={null}
      onSelectTab={jest.fn()}
      onAddTab={jest.fn()}
      onUpdateCurrency={jest.fn()}
      onDeleteTab={jest.fn()}
      setEditingId={jest.fn()}
      {...props}
    />
  );
};

const openActionMenu = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Опції реквізиту' }));
};

describe('CurrencyTabs', () => {
  it('renders all currency tabs and active tab indicator', () => {
    renderCurrencyTabs();

    expect(screen.getByText('UAH')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByTestId('tab-indicator')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Опції реквізиту' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /додати реквізити/i })).toBeInTheDocument();
  });

  it('calls onSelectTab when an inactive tab is clicked', () => {
    const handleSelect = jest.fn();
    renderCurrencyTabs({ onSelectTab: handleSelect });

    fireEvent.click(screen.getByText('USD'));
    expect(handleSelect).toHaveBeenCalledWith('2');
  });

  it('calls onAddTab when "Додати реквізити" button is clicked', () => {
    const handleAdd = jest.fn();
    renderCurrencyTabs({ onAddTab: handleAdd });

    fireEvent.click(screen.getByRole('button', { name: /додати реквізити/i }));
    expect(handleAdd).toHaveBeenCalledTimes(1);
  });

  it('opens menu on 3-dots click and handles rename action', () => {
    const setEditingId = jest.fn();
    renderCurrencyTabs({ setEditingId });

    openActionMenu();
    fireEvent.click(screen.getByText('Редагувати назву'));
    expect(setEditingId).toHaveBeenCalledWith('1');
  });

  it('opens menu on 3-dots click and handles delete action', () => {
    const handleDelete = jest.fn();
    renderCurrencyTabs({ onDeleteTab: handleDelete });

    openActionMenu();
    fireEvent.click(screen.getByText('Видалити реквізит'));
    expect(handleDelete).toHaveBeenCalledWith('1');
  });

  it.each([
    { value: 'EUR', expected: 'EUR' },
    { value: '   ', expected: 'Без назви' }
  ])('commits currency on Enter ($value -> $expected)', ({ value, expected }) => {
    const handleUpdate = jest.fn();
    const setEditingId = jest.fn();
    renderCurrencyTabs({ editingId: '1', onUpdateCurrency: handleUpdate, setEditingId });

    const input = screen.getByDisplayValue('UAH');
    fireEvent.change(input, { target: { value } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(handleUpdate).toHaveBeenCalledWith('1', expected);
    expect(setEditingId).toHaveBeenCalledWith(null);
  });

  it('cancels editing on Escape key without updating', () => {
    const handleUpdate = jest.fn();
    const setEditingId = jest.fn();
    renderCurrencyTabs({ editingId: '1', onUpdateCurrency: handleUpdate, setEditingId });

    const input = screen.getByDisplayValue('UAH');
    fireEvent.change(input, { target: { value: 'CHANGED' } });
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
    fireEvent.blur(input);

    expect(setEditingId).toHaveBeenCalledWith(null);
    expect(handleUpdate).not.toHaveBeenCalled();
  });

  it('stops propagation when clicking on input while editing', () => {
    const handleSelect = jest.fn();
    renderCurrencyTabs({ editingId: '1', onSelectTab: handleSelect });

    fireEvent.click(screen.getByDisplayValue('UAH'));
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

    const { unmount } = renderCurrencyTabs();

    expect(observerCallback).toBeDefined();
    act(() => {
      observerCallback();
    });

    unmount();
    global.ResizeObserver = originalObserver;
  });

  it('focuses and selects input after timeout when editingId is set', () => {
    jest.useFakeTimers();
    renderCurrencyTabs({ editingId: '1' });

    const input = screen.getByDisplayValue('UAH');

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(input).toHaveFocus();
    jest.useRealTimers();
  });

  it('handles missing tab ref gracefully', () => {
    renderCurrencyTabs({ activeId: 'non-existent' });

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

    renderCurrencyTabs();

    const indicator = screen.getByTestId('tab-indicator');
    expect(indicator).toBeInTheDocument();

    jest.restoreAllMocks();
  });

  it('handles editingId for non-existent item gracefully', () => {
    renderCurrencyTabs({ editingId: 'non-existent' });

    expect(screen.queryByPlaceholderText('Без назви')).not.toBeInTheDocument();
  });
});
