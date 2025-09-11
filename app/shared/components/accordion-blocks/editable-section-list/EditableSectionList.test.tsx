import { fireEvent, render, screen } from '@testing-library/react';

import { EditableSectionList, SectionListItem } from './EditableSectionList';

jest.mock('~/components/configurable-list/ConfigurableList', () => ({
  __esModule: true,
  default: ({
    items,
    renderItem,
    onCreate,
    onDelete
  }: {
    items: { id: string; title: string; description: string }[];
    renderItem: (props: { item: { id: string; title: string; description: string } }) => React.ReactNode;
    onCreate: () => void;
    onDelete: (id: string) => void;
  }) => (
    <div>
      {items.map((item) => (
        <div key={item.id} data-testid="item">
          {renderItem({ item })}
        </div>
      ))}
      <button onClick={onCreate}>Додати пункт</button>
      {items.map((item) => (
        <button key={item.id} onClick={() => onDelete(item.id)}>
          Видалити
        </button>
      ))}
    </div>
  )
}));

describe('EditableSectionList', () => {
  const mockTitle = 'Test Section';
  const mockItems: SectionListItem[] = [
    { id: '1', title: 'Item 1', description: 'Desc 1' },
    { id: '2', title: 'Item 2', description: 'Desc 2' }
  ];

  let onTitleChange: jest.Mock;
  let onChangeItem: jest.Mock;
  let onCreateItem: jest.Mock;
  let onDeleteItem: jest.Mock;

  beforeEach(() => {
    onTitleChange = jest.fn();
    onChangeItem = jest.fn();
    onCreateItem = jest.fn(() => ({ id: '3', title: '', description: '' }));
    onDeleteItem = jest.fn();

    render(
      <EditableSectionList
        title={mockTitle}
        onTitleChange={onTitleChange}
        items={mockItems}
        onChangeItem={onChangeItem}
        onCreateItem={onCreateItem}
        onDeleteItem={onDeleteItem}
        sectionLabel="Test Label"
      />
    );
  });

  it('should render the section title and items', () => {
    expect(screen.getByDisplayValue(mockTitle)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Item 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('should call onTitleChange when section title changes', () => {
    const titleInput = screen.getByDisplayValue(mockTitle);
    fireEvent.change(titleInput, { target: { value: 'New Title' } });

    expect(onTitleChange).toHaveBeenCalledWith('New Title');
  });

  it('should call onChangeItem when item title changes', () => {
    const itemTitleInput = screen.getByDisplayValue('Item 1');
    fireEvent.change(itemTitleInput, { target: { value: 'Updated Item 1' } });

    expect(onChangeItem).toHaveBeenCalledWith('1', 'title', 'Updated Item 1');
  });

  it('should call onChangeItem when item description changes', () => {
    const itemDescInput = screen.getByDisplayValue('Desc 2');
    fireEvent.change(itemDescInput, { target: { value: 'Updated Desc 2' } });

    expect(onChangeItem).toHaveBeenCalledWith('2', 'description', 'Updated Desc 2');
  });

  it('should call onCreateItem when add button is clicked', () => {
    const addButton = screen.getByText('Додати пункт');
    fireEvent.click(addButton);

    expect(onCreateItem).toHaveBeenCalled();
    const newItem = onCreateItem.mock.results[0].value;
    expect(newItem).toEqual({ id: '3', title: '', description: '' });
  });

  it('should call onDeleteItem when delete button is clicked', () => {
    const deleteButtons = screen.getAllByText('Видалити');
    fireEvent.click(deleteButtons[0]);
    fireEvent.click(deleteButtons[1]);

    expect(onDeleteItem).toHaveBeenCalledWith('1');
    expect(onDeleteItem).toHaveBeenCalledWith('2');
    expect(onDeleteItem).toHaveBeenCalledTimes(2);
  });

  it('should render all items using renderItem', () => {
    const items = screen.getAllByTestId('item');
    expect(items).toHaveLength(2);
  });
});
