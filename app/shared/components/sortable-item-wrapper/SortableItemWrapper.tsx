import { DraggableAttributes } from '@dnd-kit/core';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { useSortable } from '@dnd-kit/sortable';
import type { CSSProperties } from 'react';
import { createContext, useContext, useMemo } from 'react';

import { Grip, GripPosition } from '../grip/Grip';
import { styles } from './SortableItemWrapper.style';

interface SortableItemWrapperProps {
  id: string;
  children: React.ReactNode;
  gripHandle?: boolean;
  gripPosition?: GripPosition;
  tableRow?: boolean;
}

export const SortableItemContext = createContext<{ id: string, attributes: DraggableAttributes, listeners: SyntheticListenerMap | undefined } | null>(null);

export const useSortableItemContext = () => {
  const context = useContext(SortableItemContext);
  if (!context) {
    throw new Error('useSortableItemContext must be used within a SortableItem Provider');
  }
  return context;
};

export const SortableItemWrapper = ({
  id,
  children,
  gripHandle = false,
  gripPosition = 'center',
  tableRow = false
}: SortableItemWrapperProps) => {
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
    <div
      ref={setNodeRef}
      style={styles.getItemStyles(transform, isDragging, transition, gripHandle, gripPosition, tableRow) as CSSProperties}
    >
      <SortableItemContext.Provider value={defaultValue}>
        {gripHandle && (
          <div
            className={tableRow ? 'sortable-table-grip' : undefined}
            style={tableRow ? {
              position: 'absolute',
              left: '-28px',
              top: gripPosition === 'top' ? '12px' : '50%',
              transform: gripPosition === 'top' ? undefined : 'translateY(-50%)'
            } : undefined}
          >
            <Grip gripPosition={gripPosition} />
          </div>
        )}
        {children}
      </SortableItemContext.Provider>
    </div>
  );
};