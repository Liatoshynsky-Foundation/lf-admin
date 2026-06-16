import {
  SortableContext,
  SortingStrategy,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';

interface SortableContainerProps {
  id: string;
  items: string[];
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