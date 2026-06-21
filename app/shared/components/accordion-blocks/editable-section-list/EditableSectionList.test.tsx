import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { EditableSectionList, SectionListItem } from './EditableSectionList';
import { createDocNode } from '~/__mocks__/utils';

jest.mock('~/shared/components/design-system/text-field/TextField');
jest.mock('~/components/configurable-list/ConfigurableList', () => ({
  __esModule: true,
  default: ({ onChange, onCreate, onDelete, items, renderItem, addBtnLabel }: any) => (
    <div data-testid="configurable-list">
      <button
        data-testid="trigger-configurable-list-change"
        onClick={() => onChange({ id: '1', field: 'title', value: { type: 'doc', content: [] } })}
      >
        Trigger Change
      </button>
      <button data-testid="add-btn" onClick={onCreate}>
        {addBtnLabel}
      </button>
      <button data-testid="delete-1" onClick={() => onDelete('1')}>Delete 1</button>
      <button data-testid="delete-2" onClick={() => onDelete('2')}>Delete 2</button>
      {items.map((item: any) => (
        <div key={item.id} data-testid="item">
          {renderItem({ item })}
        </div>
      ))}
    </div>
  )
}));
jest.mock('~/components/grip/Grip');
jest.mock('../../sortable-list/SortableList');

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

  it('should render the drag grip if onDragEnd is provided and trigger onDragEnd callback', () => {
    const onDragEndMock = jest.fn();
    render(
      <EditableSectionList
        title={mockTitleJson}
        onTitleChange={onTitleChange}
        items={mockItems}
        onChangeItem={onChangeItem}
        onCreateItem={onCreateItem}
        onDeleteItem={onDeleteItem}
        sectionLabel="Test Label"
        onDragEnd={onDragEndMock}
      />
    );
    expect(screen.getAllByTestId('grip-mock')).toHaveLength(mockItems.length);
    fireEvent.click(screen.getByTestId('mock-sortable-list'));
    expect(onDragEndMock).toHaveBeenCalledWith({
      active: { id: '1' },
      over: { id: '2' }
    });
  });

  it('should correctly propagate item onChange through ConfigurableList', () => {
    fireEvent.click(screen.getByTestId('trigger-configurable-list-change'));
    expect(onChangeItem).toHaveBeenCalledWith('1', 'title', { type: 'doc', content: [] });
  });
});
