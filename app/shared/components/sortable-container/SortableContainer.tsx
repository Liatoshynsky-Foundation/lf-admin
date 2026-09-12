import {
  SortableContext,
  SortingStrategy,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';

import { SortableItemId } from '~/types/common';

export interface SortableContainerProps {
  id: string;
  items: SortableItemId[];
  children: React.ReactNode
  strategy?: SortingStrategy;
}

export const SortableContainer = ({ id, items, children, strategy = verticalListSortingStrategy }: SortableContainerProps) => {
  return (
    <SortableContext id={id} items={items} strategy={strategy}>
      {children}
    </SortableContext>
  );
};