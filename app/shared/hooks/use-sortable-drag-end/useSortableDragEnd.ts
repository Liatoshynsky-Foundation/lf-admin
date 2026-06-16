import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

export const useSortableDragEnd = <T extends { id: string | number } | string>(
  items: T[],
  onReorder: (newItems: T[]) => void
) => {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      
      const oldIndex = items.findIndex((item) =>
        typeof item === 'string' ? item === active.id : item.id === active.id
      );
      const newIndex = items.findIndex((item) =>
        typeof item === 'string' ? item === over.id : item.id === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(items, oldIndex, newIndex);
        onReorder(reordered);
      }
    }

  };

  return { handleDragEnd };
};
