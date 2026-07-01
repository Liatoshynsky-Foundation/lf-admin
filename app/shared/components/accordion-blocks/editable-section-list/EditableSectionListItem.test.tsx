import { fireEvent,render, screen } from '@testing-library/react';
import React from 'react';

import { SectionListItem } from './EditableSectionList';
import { EditableSectionListItem } from './EditableSectionListItem';
import { createDocNode } from '~/__mocks__/utils';

jest.mock('~/components/design-system/text-field/TextField');

jest.mock('../../sortable-item-wrapper/SortableItemWrapper', () => ({
  SortableItemWrapper: ({ children }: any) => <div data-testid="sortable-wrapper">{children}</div>
}));
const onChangeItemMock = jest.fn();
describe('EditableSectionListItem', () => {
  const mockItem: SectionListItem = {
    id: 'item-1',
    title: { type: 'doc', content: [{ type: 'text', text: 'title-val' }] },
    description: { type: 'doc', content: [{ type: 'text', text: 'desc-val' }] }
  };
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should render input fields with correct values and call onChangeItem', () => {
    render(
      <EditableSectionListItem
        item={mockItem}
        onChangeItem={onChangeItemMock}
      />
    );

    expect(screen.getByTestId('textfield-json-Заголовок пункту')).toHaveTextContent(
      JSON.stringify(mockItem.title)
    );
    expect(screen.getByTestId('textfield-json-Текст пункту')).toHaveTextContent(
      JSON.stringify(mockItem.description)
    );

    fireEvent.click(screen.getByTestId('trigger-change-Заголовок пункту'));
    expect(onChangeItemMock).toHaveBeenCalledWith(
      'item-1',
      'title',
      createDocNode('Updated Заголовок пункту')
    );

    fireEvent.click(screen.getByTestId('trigger-change-Текст пункту'));
    expect(onChangeItemMock).toHaveBeenCalledWith(
      'item-1',
      'description',
      createDocNode('Updated Текст пункту')
    );

    expect(screen.queryByTestId('sortable-wrapper')).not.toBeInTheDocument();
  });

  it('should wrap in SortableItemWrapper when onDragEnd is provided', () => {
    const onDragEndMock = jest.fn();
    render(
      <EditableSectionListItem
        item={mockItem}
        onChangeItem={onChangeItemMock}
        onDragEnd={onDragEndMock}
      />
    );

    expect(screen.getByTestId('sortable-wrapper')).toBeInTheDocument();
  });
});
