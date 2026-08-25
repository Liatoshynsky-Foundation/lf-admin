import { fireEvent, render, screen } from '@testing-library/react';

import { ListContent } from './ListContent';
import { createDocNode } from '~/__mocks__/utils';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';
import type { ListContentItem } from '~/types/blocks/contentTypes';

jest.mock('~/shared/components/design-system/text-field/TextField');
jest.mock('~/components/configurable-list/ConfigurableList');
jest.mock('~/shared/components/sortable-list/SortableList');
jest.mock('~/shared/components/sortable-item-wrapper/SortableItemWrapper', () => ({
  SortableItemWrapper: ({ children, id }: { children: React.ReactNode; id: string }) => (
    <div data-testid={`sortable-item-${id}`}>{children}</div>
  )
}));

jest.mock('~/lib/utils/generateUniqueId', () => ({
  generateUniqueId: jest.fn().mockReturnValue('generated-id')
}));

jest.mock('~/lib/utils/sortableDragEndHelper', () => ({
  handleSortableDragEnd: jest.fn()
}));

const baseItem: ListContentItem = {
  id: 'list-1',
  type: 'list',
  label: 'Текст секції:',
  items: [{ id: 'entry-1', uk: createDocNode('Пункт UK'), en: createDocNode('Item EN') }]
};

describe('ListContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render list label and update entry on change', () => {
    const onChange = jest.fn();

    render(<ListContent item={baseItem} locale="uk" onChange={onChange} pageId="about-us" blockId="mission" />);

    expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Текст секції:');
    expect(screen.getByTestId('sortable-item-entry-1')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('trigger-change-Текст пункту'));

    expect(onChange).toHaveBeenCalledWith({
      ...baseItem,
      items: [
        {
          ...baseItem.items[0],
          uk: createDocNode('Updated Текст пункту')
        }
      ]
    });
  });

  it('should add a new list entry', () => {
    const onChange = jest.fn();

    render(<ListContent item={baseItem} locale="uk" onChange={onChange} pageId="about-us" blockId="mission" />);

    fireEvent.click(screen.getByTestId('add-btn'));

    expect(onChange).toHaveBeenCalledWith({
      ...baseItem,
      items: [
        ...baseItem.items,
        { id: 'generated-id', uk: { type: 'doc', content: [] }, en: { type: 'doc', content: [] } }
      ]
    });
  });

  it('should delete a list entry', () => {
    const onChange = jest.fn();

    render(<ListContent item={baseItem} locale="uk" onChange={onChange} pageId="about-us" blockId="mission" />);

    fireEvent.click(screen.getByTestId('delete-entry-1'));

    expect(onChange).toHaveBeenCalledWith({
      ...baseItem,
      items: []
    });
  });

  it('should update only the matching list entry', () => {
    const onChange = jest.fn();
    const item: ListContentItem = {
      ...baseItem,
      items: [...baseItem.items, { id: 'entry-2', uk: createDocNode('Пункт 2 UK'), en: createDocNode('Item 2 EN') }]
    };

    render(<ListContent item={item} locale="uk" onChange={onChange} pageId="about-us" blockId="mission" />);

    fireEvent.click(screen.getAllByTestId('trigger-change-Текст пункту')[0]);

    expect(onChange).toHaveBeenCalledWith({
      ...item,
      items: [
        {
          ...item.items[0],
          uk: createDocNode('Updated Текст пункту')
        },
        item.items[1]
      ]
    });
  });

  it('should delegate drag end to sortable helper', () => {
    const onChange = jest.fn();
    const item: ListContentItem = {
      ...baseItem,
      items: [...baseItem.items, { id: 'entry-2', uk: createDocNode('Пункт 2 UK'), en: createDocNode('Item 2 EN') }]
    };

    render(<ListContent item={item} locale="uk" onChange={onChange} pageId="about-us" blockId="mission" />);

    fireEvent.click(screen.getByTestId('mock-sortable-list'));

    expect(handleSortableDragEnd).toHaveBeenCalledWith(
      expect.objectContaining({
        active: expect.objectContaining({ id: 'entry-1' }),
        over: expect.objectContaining({ id: 'entry-2' })
      }),
      item.items,
      expect.any(Function)
    );
  });

  it('should not render label when it is missing', () => {
    render(
      <ListContent
        item={{ ...baseItem, label: undefined }}
        locale="uk"
        onChange={jest.fn()}
        pageId="about-us"
        blockId="mission"
      />
    );

    expect(screen.queryByRole('heading', { level: 4 })).not.toBeInTheDocument();
  });
});
