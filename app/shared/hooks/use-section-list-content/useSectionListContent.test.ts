import { act, renderHook } from '@testing-library/react';
import { JSONContent } from '@tiptap/react';

import { useSectionListContent } from './useSectionListContent';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';
import type { SectionListEntry } from '~/types/blocks/contentTypes';

jest.mock('~/lib/utils/generateUniqueId', () => ({
  generateUniqueId: jest.fn().mockReturnValue('generated-id')
}));

jest.mock('~/lib/utils/sortableDragEndHelper', () => ({
  handleSortableDragEnd: jest.fn()
}));

const emptyDoc: JSONContent = { type: 'doc', content: [] };
const titleDoc: JSONContent = { type: 'doc', content: [{ type: 'text', text: 'Title' }] };
const descriptionDoc: JSONContent = { type: 'doc', content: [{ type: 'text', text: 'Description' }] };

const initialItems: SectionListEntry[] = [
  {
    id: 'entry-1',
    title: { uk: titleDoc, en: emptyDoc },
    description: { uk: descriptionDoc, en: emptyDoc }
  }
];

describe('useSectionListContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should map items to locale-specific ui items', () => {
    const onItemsChange = jest.fn();
    const { result } = renderHook(() =>
      useSectionListContent({ items: initialItems, locale: 'uk', onItemsChange })
    );

    expect(result.current.uiItems).toEqual([
      { id: 'entry-1', title: titleDoc, description: descriptionDoc }
    ]);
  });

  it('should update item field via changeItem', () => {
    const onItemsChange = jest.fn();
    const { result } = renderHook(() =>
      useSectionListContent({ items: initialItems, locale: 'uk', onItemsChange })
    );
    const updatedTitle: JSONContent = { type: 'doc', content: [{ type: 'text', text: 'Updated title' }] };

    act(() => {
      result.current.changeItem('entry-1', 'title', updatedTitle);
    });

    expect(onItemsChange).toHaveBeenCalledWith([
      {
        id: 'entry-1',
        title: { uk: updatedTitle, en: emptyDoc },
        description: { uk: descriptionDoc, en: emptyDoc }
      }
    ]);
  });

  it('should append new item via createItem', () => {
    const onItemsChange = jest.fn();
    const { result } = renderHook(() =>
      useSectionListContent({ items: initialItems, locale: 'uk', onItemsChange })
    );

    let createdItem: ReturnType<typeof result.current.createItem> | undefined;

    act(() => {
      createdItem = result.current.createItem();
    });

    expect(createdItem).toEqual({ id: 'generated-id', title: emptyDoc, description: emptyDoc });
    expect(onItemsChange).toHaveBeenCalledWith([
      ...initialItems,
      {
        id: 'generated-id',
        title: { uk: emptyDoc, en: emptyDoc },
        description: { uk: emptyDoc, en: emptyDoc }
      }
    ]);
  });

  it('should remove item via deleteItem', () => {
    const onItemsChange = jest.fn();
    const { result } = renderHook(() =>
      useSectionListContent({ items: initialItems, locale: 'uk', onItemsChange })
    );

    act(() => {
      result.current.deleteItem('entry-1');
    });

    expect(onItemsChange).toHaveBeenCalledWith([]);
  });

  it('should delegate reordering to handleSortableDragEnd', () => {
    const onItemsChange = jest.fn();
    const dragEvent = { active: { id: 'entry-1' }, over: { id: 'entry-2' } } as never;
    const { result } = renderHook(() =>
      useSectionListContent({ items: initialItems, locale: 'uk', onItemsChange })
    );

    act(() => {
      result.current.dragEnd(dragEvent);
    });

    expect(handleSortableDragEnd).toHaveBeenCalledWith(dragEvent, initialItems, onItemsChange);
  });
});
