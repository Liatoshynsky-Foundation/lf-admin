import { useSortable } from '@dnd-kit/sortable';

import { styles } from './SortableItemWrapper.style';

interface SortableItemWrapperProps {
  id: string;
  children: React.ReactNode
}

export const SortableItemWrapper = ({ id, children }: SortableItemWrapperProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div ref={setNodeRef} style={styles.getItemStyles(transform, isDragging, transition)} {...attributes} {...listeners}>
      {children}
    </div>
  );
};