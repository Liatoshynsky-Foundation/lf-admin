import { DraggableAttributes } from '@dnd-kit/core';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { createContext, useContext, useMemo } from 'react';

import { styles } from './SortableItemWrapper.style';

interface SortableItemWrapperProps {
  id: string;
  children: React.ReactNode;
  dragHandle?: boolean;
}

export const SortableItemContext = createContext<{ id: string, attributes: DraggableAttributes, listeners: SyntheticListenerMap | undefined } | null>(null);
export const useSortableItemContext = () => {
  const context = useContext(SortableItemContext);
  if (!context) {
    throw new Error('useSortableItemContext must be used within a SortableItem Provider');
  }
  return context;
};
export const SortableItemWrapper = ({ id, children, dragHandle = false }: SortableItemWrapperProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const draggingProps = dragHandle ? {} : { ...attributes, ...listeners };

  const defaultValue = useMemo(() => ({ id, attributes, listeners }), [id, attributes, listeners]);
  
  return (
    <div ref={setNodeRef} style={styles.getItemStyles(transform, isDragging, transition)} {...draggingProps}>
      <SortableItemContext.Provider value={defaultValue}>
        {children}
      </SortableItemContext.Provider>
    </div>
  );
};