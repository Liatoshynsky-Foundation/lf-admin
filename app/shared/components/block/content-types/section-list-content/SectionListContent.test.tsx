import { fireEvent, render, screen } from '@testing-library/react';

import { SectionListContent } from './SectionListContent';
import { createDocNode } from '~/__mocks__/utils';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';
import type { SectionListContentItem } from '~/types/blocks/contentTypes';

jest.mock('~/components/configurable-list/ConfigurableList');
jest.mock('~/shared/components/sortable-list/SortableList');
jest.mock('~/shared/components/accordion-blocks/editable-section-list/EditableSectionListItem', () => ({
  EditableSectionListItem: ({
    item,
    onChangeItem
  }: {
    item: { id: string };
    onChangeItem: (id: string, field: 'title' | 'description', value: unknown) => void;
  }) => (
    <button
      data-testid={`change-item-${item.id}`}
      onClick={() => onChangeItem(item.id, 'title', createDocNode('Updated title'))}
    >
      Change item
    </button>
  )
}));

jest.mock('~/lib/utils/generateUniqueId', () => ({
  generateUniqueId: jest.fn().mockReturnValue('generated-id')
}));

jest.mock('~/lib/utils/sortableDragEndHelper', () => ({
  handleSortableDragEnd: jest.fn()
}));

const baseItem: SectionListContentItem = {
  id: 'section-list-1',
  type: 'section-list',
  label: 'Пункти секції:',
  items: [
    {
      id: 'entry-1',
      title: { uk: createDocNode('Title UK'), en: createDocNode('Title EN') },
      description: { uk: createDocNode('Description UK'), en: createDocNode('Description EN') }
    }
  ]
};

describe('SectionListContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render section list with custom label', () => {
    render(<SectionListContent item={baseItem} locale="uk" onChange={jest.fn()} pageId="about-us" blockId="goals" />);

    expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Пункти секції:');
    expect(screen.getByTestId('change-item-entry-1')).toBeInTheDocument();
  });

  it('should use default label when item label is missing', () => {
    render(
      <SectionListContent
        item={{ ...baseItem, label: undefined }}
        locale="uk"
        onChange={jest.fn()}
        pageId="about-us"
        blockId="goals"
      />
    );

    expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Пункти секції:');
  });

  it('should update item via section list hook', () => {
    const onChange = jest.fn();

    render(<SectionListContent item={baseItem} locale="uk" onChange={onChange} pageId="about-us" blockId="goals" />);

    fireEvent.click(screen.getByTestId('change-item-entry-1'));

    expect(onChange).toHaveBeenCalledWith({
      ...baseItem,
      items: [
        {
          ...baseItem.items[0],
          title: {
            ...baseItem.items[0].title,
            uk: createDocNode('Updated title')
          }
        }
      ]
    });
  });

  it('should add a new section list entry', () => {
    const onChange = jest.fn();

    render(<SectionListContent item={baseItem} locale="uk" onChange={onChange} pageId="about-us" blockId="goals" />);

    fireEvent.click(screen.getByTestId('add-btn'));

    expect(onChange).toHaveBeenCalledWith({
      ...baseItem,
      items: [
        ...baseItem.items,
        {
          id: 'generated-id',
          title: { uk: { type: 'doc', content: [] }, en: { type: 'doc', content: [] } },
          description: { uk: { type: 'doc', content: [] }, en: { type: 'doc', content: [] } }
        }
      ]
    });
  });

  it('should delete a section list entry', () => {
    const onChange = jest.fn();

    render(<SectionListContent item={baseItem} locale="uk" onChange={onChange} pageId="about-us" blockId="goals" />);

    fireEvent.click(screen.getByTestId('delete-entry-1'));

    expect(onChange).toHaveBeenCalledWith({
      ...baseItem,
      items: []
    });
  });

  it('should delegate drag end to sortable helper', () => {
    const item: SectionListContentItem = {
      ...baseItem,
      items: [
        ...baseItem.items,
        {
          id: 'entry-2',
          title: { uk: createDocNode('Title 2 UK'), en: createDocNode('Title 2 EN') },
          description: { uk: createDocNode('Description 2 UK'), en: createDocNode('Description 2 EN') }
        }
      ]
    };

    render(<SectionListContent item={item} locale="uk" onChange={jest.fn()} pageId="about-us" blockId="goals" />);

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

  it('should ignore configurable list onChange callback', () => {
    const onChange = jest.fn();

    render(<SectionListContent item={baseItem} locale="uk" onChange={onChange} pageId="about-us" blockId="goals" />);

    fireEvent.click(screen.getByTestId('trigger-configurable-list-change'));

    expect(onChange).not.toHaveBeenCalled();
  });
});
