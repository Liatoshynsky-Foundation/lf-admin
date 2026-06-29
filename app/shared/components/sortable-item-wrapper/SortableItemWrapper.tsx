import { DraggableAttributes } from '@dnd-kit/core';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { createContext, useContext, useMemo } from 'react';

import { Grip, GripPosition } from '../grip/Grip';
import { styles } from './SortableItemWrapper.style';

interface SortableItemWrapperProps {
  id: string;
  children: React.ReactNode;
  gripHandle?: boolean;
  gripPosition?: GripPosition;
}

export const SortableItemContext = createContext<{ id: string, attributes: DraggableAttributes, listeners: SyntheticListenerMap | undefined } | null>(null);

export const useSortableItemContext = () => {
  const context = useContext(SortableItemContext);
  if (!context) {
    throw new Error('useSortableItemContext must be used within a SortableItem Provider');
  }
  return context;
};

export const SortableItemWrapper = ({ id, children, gripHandle = false, gripPosition = 'center' }: SortableItemWrapperProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });


  const defaultValue = useMemo(() => ({ id, attributes, listeners }), [id, attributes, listeners]);

  return (
    <div ref={setNodeRef} style={styles.getItemStyles(transform, isDragging, transition, gripHandle, gripPosition)}>
      <SortableItemContext.Provider value={defaultValue}>
        {gripHandle && <Grip gripPosition={gripPosition} />}
        {children}
      </SortableItemContext.Provider>
    </div>
  );
};