import { fireEvent, render, screen } from '@testing-library/react';

jest.mock('~/public/icons/plus.svg', () => {
  const PlusIcon = () => <svg data-testid="plus-icon" />;
  PlusIcon.displayName = 'PlusIcon';
  return PlusIcon;
});

jest.mock('~/public/icons/trash.svg', () => {
  const TrashIcon = () => <svg data-testid="trash-icon" />;
  TrashIcon.displayName = 'TrashIcon';
  return TrashIcon;
});

import ConfigurableList from './ConfigurableList';
import { ConfigurableListItem } from '~/types/accordionBlocks';

const items: ConfigurableListItem[] = [
  { id: '1', value: 'Item 1' },
  { id: '2', value: 'Item 2' },
  { id: '3', value: 'Item 3' }
];

const renderItem = ({ item, onChange }: { item: ConfigurableListItem; onChange: (item: ConfigurableListItem) => void }) => (
  <input
    data-testid={`input-${item.id}`}
    value={item.value}
    onChange={(e) => onChange({ ...item, value: e.target.value })}
  />
);

describe('ConfigurableList', () => {
  it('should render all items', () => {
    render(
      <ConfigurableList
        items={items}
        renderItem={renderItem}
        addBtnLabel="Add"
        editable={true}
        onCreate={jest.fn()}
        onChange={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    items.forEach((item) => {
      expect(screen.getByTestId(`input-${item.id}`)).toBeInTheDocument();
    });
  });

  it('should render add button with correct label', () => {
    render(
      <ConfigurableList
        items={items}
        renderItem={renderItem}
        addBtnLabel="Add New Item"
        editable={true}
        onCreate={jest.fn()}
        onChange={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /add new item/i })).toBeInTheDocument();
  });

  it('should call onCreate when add button is clicked', () => {
    const onCreate = jest.fn();
    render(
      <ConfigurableList
        items={items}
        renderItem={renderItem}
        addBtnLabel="Add"
        editable={true}
        onCreate={onCreate}
        onChange={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(onCreate).toHaveBeenCalled();
  });

  it('should call onDelete with correct id when delete is triggered', () => {
    const onDelete = jest.fn();
    render(
      <ConfigurableList
        items={items}
        renderItem={renderItem}
        addBtnLabel="Add"
        editable={true}
        onCreate={jest.fn()}
        onChange={jest.fn()}
        onDelete={onDelete}
      />
    );
    const deleteButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.textContent === '' || btn.querySelector('svg'));
    fireEvent.click(deleteButtons[0]);
    expect(onDelete).toHaveBeenCalledWith('2');
    fireEvent.click(deleteButtons[1]);
    expect(onDelete).toHaveBeenCalledWith('3');
  });

  it('should call onChange when item is changed', () => {
    const onChange = jest.fn();
    render(
      <ConfigurableList
        items={items}
        renderItem={renderItem}
        addBtnLabel="Add"
        editable={true}
        onCreate={jest.fn()}
        onChange={onChange}
        onDelete={jest.fn()}
      />
    );
    const input = screen.getByTestId('input-1');
    fireEvent.change(input, { target: { value: 'Changed' } });
    expect(onChange).toHaveBeenCalledWith({ id: '1', value: 'Changed' });
  });

  it('should pass editable=false for first item, editable=prop for others', () => {
    render(
      <ConfigurableList
        items={items}
        renderItem={renderItem}
        addBtnLabel="Add"
        editable={true}
        onCreate={jest.fn()}
        onChange={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    const deleteButtons = screen.getAllByRole('button');
    expect(deleteButtons).toHaveLength(3);
  });

  it('should allow deletion of the first item when configured', () => {
    const onDelete = jest.fn();
    render(
      <ConfigurableList
        items={items}
        renderItem={renderItem}
        addBtnLabel="Add"
        editable={true}
        allowFirstItemDeletion={true}
        onCreate={jest.fn()}
        onChange={jest.fn()}
        onDelete={onDelete}
      />
    );
    const deleteButtons = screen.getAllByRole('button');
    fireEvent.click(deleteButtons[0]);
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('should pass withSeparator=true only for items except last (if separator=true)', () => {
    render(
      <ConfigurableList
        items={items}
        renderItem={renderItem}
        addBtnLabel="Add"
        editable={true}
        separator={true}
        onCreate={jest.fn()}
        onChange={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    const separators = screen.queryAllByTestId('separator');
    expect(separators.length).toBe(2);
  });

  it('should pass withSeparator=false for all if separator is false/undefined', () => {
    render(
      <ConfigurableList
        items={items}
        renderItem={renderItem}
        addBtnLabel="Add"
        editable={true}
        onCreate={jest.fn()}
        onChange={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    const separators = screen.queryAllByTestId('separator');
    expect(separators.length).toBe(0);
  });
});
