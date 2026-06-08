import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { EditableSectionList, SectionListItem } from './EditableSectionList';
import { createDocNode } from '~/__mocks__/utils';

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


jest.mock('~/shared/components/design-system/text-field/TextField');

const mockTitleJson = createDocNode('Test Section Title');

const mockItems: SectionListItem[] = [
  { id: '1', title: createDocNode('Item 1 Title'), description: createDocNode('Desc 1') },
  { id: '2', title: createDocNode('Item 2 Title'), description: createDocNode('Desc 2') }
];

describe('EditableSectionList', () => {
  let onTitleChange: jest.Mock;
  let onChangeItem: jest.Mock;
  let onCreateItem: jest.Mock;
  let onDeleteItem: jest.Mock;

  beforeEach(() => {
    onTitleChange = jest.fn();
    onChangeItem = jest.fn();
    onCreateItem = jest.fn(() => ({ id: '3', title: {}, description: {} } as SectionListItem));
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
    expect(screen.getAllByTestId('item')).toHaveLength(2);
  });

  it.each([
    [
      'the section wrapper title',
      () => fireEvent.click(screen.getByTestId('trigger-change-Заголовок секції')),
      () => expect(onTitleChange).toHaveBeenCalledWith(createDocNode('Updated Заголовок секції'))
    ],
    [
      'a specific list item title',
      () => fireEvent.click(screen.getAllByTestId('trigger-change-Заголовок пункту')[0]),
      () => expect(onChangeItem).toHaveBeenCalledWith('1', 'title', createDocNode('Updated Заголовок пункту'))
    ],
    [
      'a specific list item description',
      () => fireEvent.click(screen.getAllByTestId('trigger-change-Текст пункту')[1]),
      () => expect(onChangeItem).toHaveBeenCalledWith('2', 'description', createDocNode('Updated Текст пункту'))
    ],
    [
      'the creation of a new item',
      () => fireEvent.click(screen.getByTestId('add-btn')),
      () => {
        expect(onCreateItem).toHaveBeenCalled();
        expect(onCreateItem.mock.results[0].value).toEqual({ id: '3', title: {}, description: {} });
      }
    ],
    [
      'the deletion extraction paths with targeted identifiers',
      () => {
        fireEvent.click(screen.getByTestId('delete-1'));
        fireEvent.click(screen.getByTestId('delete-2'));
      },
      () => {
        expect(onDeleteItem).toHaveBeenCalledWith('1');
        expect(onDeleteItem).toHaveBeenCalledWith('2');
        expect(onDeleteItem).toHaveBeenCalledTimes(2);
      }
    ]
  ])(
    'should correctly dispatch callbacks when modifying %s',
    (_scenario, executeTrigger, assertOutcome) => {
      executeTrigger();
      assertOutcome();
    }
  );
});
