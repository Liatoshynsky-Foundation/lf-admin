import { DragEndEvent } from '@dnd-kit/core';

import { handleSortableDragEnd } from './sortableDragEndHelper';

describe('handleSortableDragEnd', () => {
  let onReorderMock: jest.Mock;

  beforeEach(() => {
    onReorderMock = jest.fn();
  });

  it('should not call onReorder if over is null', () => {
    const event = {
      active: { id: 'item-1' },
      over: null
    } as unknown as DragEndEvent;

    handleSortableDragEnd(event, ['item-1', 'item-2'], onReorderMock);
    expect(onReorderMock).not.toHaveBeenCalled();
  });

  it('should not call onReorder if active.id equals over.id', () => {
    const event = {
      active: { id: 'item-1' },
      over: { id: 'item-1' }
    } as unknown as DragEndEvent;

    handleSortableDragEnd(event, ['item-1', 'item-2'], onReorderMock);
    expect(onReorderMock).not.toHaveBeenCalled();
  });

  it('should call onReorder with correct reordered items when elements are strings', () => {
    const event = {
      active: { id: 'item-1' },
      over: { id: 'item-2' }
    } as unknown as DragEndEvent;

    handleSortableDragEnd(event, ['item-1', 'item-2', 'item-3'], onReorderMock);
    expect(onReorderMock).toHaveBeenCalledWith(['item-2', 'item-1', 'item-3']);
  });

  it('should call onReorder with correct reordered items when elements are objects with id', () => {
    const event = {
      active: { id: 'item-1' },
      over: { id: 'item-3' }
    } as unknown as DragEndEvent;

    const items = [
      { id: 'item-1', value: 'one' },
      { id: 'item-2', value: 'two' },
      { id: 'item-3', value: 'three' }
    ];

    handleSortableDragEnd(event, items, onReorderMock);
    expect(onReorderMock).toHaveBeenCalledWith([
      { id: 'item-2', value: 'two' },
      { id: 'item-3', value: 'three' },
      { id: 'item-1', value: 'one' }
    ]);
  });

  it('should not call onReorder if item is not found in items list', () => {
    const event = {
      active: { id: 'item-999' },
      over: { id: 'item-2' }
    } as unknown as DragEndEvent;

    handleSortableDragEnd(event, ['item-1', 'item-2'], onReorderMock);
    expect(onReorderMock).not.toHaveBeenCalled();
  });
});
