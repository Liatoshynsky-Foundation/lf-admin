import { fireEvent, render, screen } from '@testing-library/react';
import { JSONContent } from '@tiptap/react';
import React from 'react';

import { EditableSectionList, SectionListItem } from './EditableSectionList';

interface MockCustomTextFieldProps {
  readonly title?: string;
  readonly label?: string;
  readonly value: JSONContent;
  readonly onChange: (value: JSONContent) => void;
}

interface MockConfigurableListProps<T> {
  readonly items: readonly T[];
  readonly renderItem: (props: { readonly item: T }) => React.ReactNode;
  readonly onCreate: () => void;
  readonly onDelete: (id: string | number) => void;
}

jest.mock('~/components/configurable-list/ConfigurableList', () => ({
  __esModule: true,
  default: <T extends { readonly id: string | number }>({
    items,
    renderItem,
    onCreate,
    onDelete
  }: MockConfigurableListProps<T>) => (
    <div>
      {items.map((item) => (
        <div key={item.id} data-testid="item">
          {renderItem({ item })}
          <button data-testid={`delete-${item.id}`} onClick={() => onDelete(item.id)}>
            Видалити
          </button>
        </div>
      ))}
      <button data-testid="add-btn" onClick={onCreate}>
        Додати пункт
      </button>
    </div>
  )
}));

jest.mock('~/components/design-system/text-field/TextField', () => ({
  __esModule: true,
  CustomTextField: ({ title, label, value, onChange }: MockCustomTextFieldProps) => {
    const selectorKey = title || label || 'default';
    return (
      <div data-testid={`textfield-wrapper-${selectorKey}`}>
        <span data-testid={`textfield-json-${selectorKey}`}>{JSON.stringify(value)}</span>
        <button
          data-testid={`trigger-change-${selectorKey}`}
          onClick={() => {
            const updatedJson: JSONContent = {
              type: 'doc',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: `Updated ${selectorKey}` }] }]
            };
            onChange(updatedJson);
          }}
        >
          Change {selectorKey}
        </button>
      </div>
    );
  }
}));

const mockTitleJson: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Test Section Title' }] }]
};

const mockItems: SectionListItem[] = [
  {
    id: '1',
    title: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 1 Title' }] }] },
    description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Desc 1' }] }] }
  },
  {
    id: '2',
    title: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 2 Title' }] }] },
    description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Desc 2' }] }] }
  }
];

describe('EditableSectionList', () => {
  let onTitleChange: jest.Mock;
  let onChangeItem: jest.Mock;
  let onCreateItem: jest.Mock;
  let onDeleteItem: jest.Mock;

  beforeEach(() => {
    onTitleChange = jest.fn();
    onChangeItem = jest.fn();
    onCreateItem = jest.fn(() => ({ id: '3', title: {}, description: {} }) as SectionListItem);
    onDeleteItem = jest.fn();

    render(
      <EditableSectionList
        title={mockTitleJson}
        onTitleChange={onTitleChange}
        items={mockItems}
        onChangeItem={onChangeItem}
        onCreateItem={onCreateItem}
        onDeleteItem={onDeleteItem}
        sectionLabel="Test Label"
      />
    );
  });

  it('should render the layout structures, section headers, and inner serialization text targets', () => {
    expect(screen.getByTestId('textfield-json-Заголовок секції')).toHaveTextContent(JSON.stringify(mockTitleJson));
    expect(screen.getByText('Test Label')).toBeInTheDocument();

    const items = screen.getAllByTestId('item');
    expect(items).toHaveLength(2);
  });

  it('should call onTitleChange with rich text schemas when modifying the section wrapper title', () => {
    fireEvent.click(screen.getByTestId('trigger-change-Заголовок секції'));

    const expectedTitlePayload: JSONContent = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated Заголовок секції' }] }]
    };

    expect(onTitleChange).toHaveBeenCalledWith(expectedTitlePayload);
  });

  it('should call onChangeItem with key target indicators and structural text payloads when a list item title changes', () => {
    screen.getAllByTestId('item');
    fireEvent.click(screen.getAllByTestId('trigger-change-Заголовок пункту')[0]);

    const expectedItemTitlePayload: JSONContent = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated Заголовок пункту' }] }]
    };

    expect(onChangeItem).toHaveBeenCalledWith('1', 'title', expectedItemTitlePayload);
  });

  it('should call onChangeItem with key target indicators and structural text payloads when a list item description changes', () => {
    screen.getAllByTestId('item');
    fireEvent.click(screen.getAllByTestId('trigger-change-Текст пункту')[1]);

    const expectedItemDescPayload: JSONContent = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated Текст пункту' }] }]
    };

    expect(onChangeItem).toHaveBeenCalledWith('2', 'description', expectedItemDescPayload);
  });

  it('should call onCreateItem and expect an empty double localized object layout item tree structure upon button clicks', () => {
    fireEvent.click(screen.getByTestId('add-btn'));

    expect(onCreateItem).toHaveBeenCalled();
    const newItem = onCreateItem.mock.results[0].value;
    expect(newItem).toEqual({ id: '3', title: {}, description: {} });
  });

  it('should execute onDeleteItem extraction paths back cleanly with targeted individual identifiers', () => {
    fireEvent.click(screen.getByTestId('delete-1'));
    expect(onDeleteItem).toHaveBeenCalledWith('1');

    fireEvent.click(screen.getByTestId('delete-2'));
    expect(onDeleteItem).toHaveBeenCalledWith('2');

    expect(onDeleteItem).toHaveBeenCalledTimes(2);
  });
});
