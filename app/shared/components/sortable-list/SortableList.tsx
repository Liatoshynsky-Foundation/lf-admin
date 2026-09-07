import { CollisionDetection, DragEndEvent } from '@dnd-kit/core';
import { SortingStrategy } from '@dnd-kit/sortable';
import { ReactNode } from 'react';

import { SortableBoard } from '../sortable-board/SortableBoard';
import { SortableContainer } from '../sortable-container/SortableContainer';
import { SortableItemId } from '~/types/common';

interface SortableListProps {
  id: string;
  items: SortableItemId[];
  onDragEnd: (event: DragEndEvent) => void;
  children: ReactNode;
  strategy?: SortingStrategy;
  collisionDetection?: CollisionDetection;
}

export const SortableList = ({
  id,
  items,
  onDragEnd,
  children,
  strategy,
  collisionDetection
}: SortableListProps) => {
  return (
    <SortableBoard onDragEnd={onDragEnd} collisionDetection={collisionDetection}>
      <SortableContainer id={id} items={items} strategy={strategy}>
        {children}
      </SortableContainer>
    </SortableBoard>
  );
};
