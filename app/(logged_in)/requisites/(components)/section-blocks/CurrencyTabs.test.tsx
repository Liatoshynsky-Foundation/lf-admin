import type { DragEndEvent } from '@dnd-kit/core';
import { act, fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';

import { CurrencyTabs } from './CurrencyTabs';
import { createDragEndEvent } from '~/__mocks__/utils';
import { PaymentDetailsTab, REQUISITES_MESSAGES } from '~/constants/requisites';

let mockDragEnd: (event: DragEndEvent) => void;

jest.mock('~/shared/components/sortable-list/SortableList', () => {
  const actual = jest.requireActual('~/shared/components/sortable-list/SortableList');
  return {
    SortableList: (
      props: React.ComponentProps<typeof import('~/shared/components/sortable-list/SortableList').SortableList>
    ) => {
      mockDragEnd = props.onDragEnd;
      return <actual.SortableList {...props} />;
    }
  };
});

jest.mock('~/public/icons/grip-vertical.svg', () => {
  return function MockGripVertical() {
    return <svg />;
  };
});

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
      onReorder={jest.fn()}
      onUpdateCurrency={jest.fn(() => true)}
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

  it('opens confirmation modal on delete click and calls onDeleteTab after confirmation', () => {
    const handleDelete = jest.fn();
    renderCurrencyTabs({ onDeleteTab: handleDelete });

    openActionMenu();
    fireEvent.click(screen.getByText(REQUISITES_MESSAGES.DELETE_REQUISITE_MENU));

    expect(handleDelete).not.toHaveBeenCalled();
    expect(screen.getByText(REQUISITES_MESSAGES.DELETE_TAB_TITLE)).toBeInTheDocument();
    expect(screen.getByText(REQUISITES_MESSAGES.DELETE_TAB_DESCRIPTION('UAH'))).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: REQUISITES_MESSAGES.DELETE_TAB_CONFIRM }));

    expect(handleDelete).toHaveBeenCalledTimes(1);
    expect(handleDelete).toHaveBeenCalledWith('1');
  });

  it('closes confirmation modal without calling onDeleteTab when canceled', async() => {
    const handleDelete = jest.fn();
    renderCurrencyTabs({ onDeleteTab: handleDelete });

    openActionMenu();
    fireEvent.click(screen.getByText(REQUISITES_MESSAGES.DELETE_REQUISITE_MENU));

    expect(screen.getByText(REQUISITES_MESSAGES.DELETE_TAB_TITLE)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: REQUISITES_MESSAGES.DELETE_TAB_CANCEL }));

    expect(handleDelete).not.toHaveBeenCalled();

    await waitForElementToBeRemoved(() => screen.queryByText(REQUISITES_MESSAGES.DELETE_TAB_TITLE));
  });

  it('disables delete action and shows tooltip when only one tab remains', async () => {
    const handleDelete = jest.fn();
    renderCurrencyTabs({
      items: [mockItems[0]],
      onDeleteTab: handleDelete
    });

    openActionMenu();

    const deleteMenuItem = screen.getByRole('menuitem', {
      name: REQUISITES_MESSAGES.DELETE_REQUISITE_MENU
    });

    expect(deleteMenuItem).toHaveAttribute('aria-disabled', 'true');

    fireEvent.mouseOver(deleteMenuItem.parentElement ?? deleteMenuItem);
    expect(await screen.findByText(REQUISITES_MESSAGES.LAST_TAB_TOOLTIP)).toBeInTheDocument();

    fireEvent.click(deleteMenuItem);
    expect(screen.queryByText(REQUISITES_MESSAGES.DELETE_TAB_TITLE)).not.toBeInTheDocument();
    expect(handleDelete).not.toHaveBeenCalled();
  });

  it.each([
    { value: 'EUR', expected: 'EUR' },
    { value: '   ', expected: 'Без назви' }
  ])('commits currency on Enter ($value -> $expected)', ({ value, expected }) => {
    const handleUpdate = jest.fn(() => true);
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

  it('displays and updates the character counter while editing', () => {
    renderCurrencyTabs({ editingId: '1' });

    const input = screen.getByDisplayValue('UAH');

    expect(screen.getByText('3/40')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'US Dollar' } });

    expect(screen.getByText('9/40')).toBeInTheDocument();
  });

  it('counts spaces in the character counter', () => {
    renderCurrencyTabs({ editingId: '1' });

    const input = screen.getByDisplayValue('UAH');

    fireEvent.change(input, { target: { value: 'USD ' } });

    expect(screen.getByText('4/40')).toBeInTheDocument();
  });

  it('sets a maximum input length of 40 characters', () => {
    renderCurrencyTabs({ editingId: '1' });

    const input = screen.getByDisplayValue('UAH');

    expect(input).toHaveAttribute('maxLength', '40');
  });

  it('keeps editing open when the rename is rejected', () => {
    const handleUpdate = jest.fn(() => false);
    const setEditingId = jest.fn();

    renderCurrencyTabs({
      editingId: '1',
      onUpdateCurrency: handleUpdate,
      setEditingId
    });

    const input = screen.getByDisplayValue('UAH');

    fireEvent.change(input, { target: { value: 'USD' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(handleUpdate).toHaveBeenCalledWith('1', 'USD');
    expect(setEditingId).not.toHaveBeenCalledWith(null);
    expect(screen.getByDisplayValue('USD')).toBeInTheDocument();
  });

  it('calls onReorder with tabs in the new order after dragging', () => {
    const onReorder = jest.fn();
    const onSelectTab = jest.fn();
    const setEditingId = jest.fn();
    const originalItems = JSON.stringify(mockItems);

    renderCurrencyTabs({ onReorder, onSelectTab, setEditingId });

    act(() => mockDragEnd(createDragEndEvent('1', '2')));

    expect(onReorder).toHaveBeenCalledTimes(1);
    expect(onReorder).toHaveBeenCalledWith([mockItems[1], mockItems[0]]);
    expect(onReorder.mock.calls[0][0][0]).toBe(mockItems[1]);
    expect(onReorder.mock.calls[0][0][1]).toBe(mockItems[0]);
    expect(JSON.stringify(mockItems)).toBe(originalItems);
    expect(onSelectTab).not.toHaveBeenCalled();
    expect(setEditingId).not.toHaveBeenCalled();
  });

  it.each([
    ['1', null],
    ['1', '1'],
    ['missing', '2'],
    ['1', 'missing']
  ])('does not reorder for an invalid or unchanged drop (%s, %s)', (activeId, overId) => {
    const onReorder = jest.fn();
    renderCurrencyTabs({ onReorder });

    act(() => mockDragEnd(createDragEndEvent(activeId, overId)));

    expect(onReorder).not.toHaveBeenCalled();
  });

  it('blocks dragging and an already-open rename input while saving', () => {
    const onReorder = jest.fn();
    const { rerender } = renderCurrencyTabs({ onReorder });
    const grips = screen.getAllByRole('button', { description: /To pick up a draggable item/i });
    expect(grips).toHaveLength(mockItems.length);

    rerender(
      <CurrencyTabs
        items={mockItems}
        activeId="1"
        editingId="1"
        onSelectTab={jest.fn()}
        onAddTab={jest.fn()}
        onReorder={onReorder}
        onUpdateCurrency={jest.fn()}
        setEditingId={jest.fn()}
        readOnly
      />
    );
    act(() => mockDragEnd(createDragEndEvent('1', '2')));

    expect(onReorder).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue('UAH')).toBeDisabled();
    expect(screen.getByRole('button', { name: /додати реквізити/i })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Опції реквізиту' })).not.toBeInTheDocument();
  });

  it('does not reorder while a tab name is being edited', () => {
    const onReorder = jest.fn();
    renderCurrencyTabs({ onReorder, editingId: '1' });

    act(() => mockDragEnd(createDragEndEvent('1', '2')));

    expect(onReorder).not.toHaveBeenCalled();
  });
});
