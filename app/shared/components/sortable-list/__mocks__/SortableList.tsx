import type { DragEndEvent } from '@dnd-kit/core';
import React, { MouseEvent, ReactNode } from 'react';

import { createDragEndEvent } from '~/__mocks__/utils';

interface SortableListMockProps {
  children: ReactNode;
  onDragEnd?: (event: DragEndEvent) => void;
  items?: string[];
}

export const SortableList = ({ children, onDragEnd, items }: SortableListMockProps) => {
  return (
    <div // NOSONAR - was explicitly added to avoid triggering sonarqube(typescript:S6848) & sonarqube(typescript:S1082)
      data-testid="mock-sortable-list"
      onClick={(e: MouseEvent<HTMLDivElement> & { activeId?: string; overId?: string }) => {
        if(!onDragEnd) return;
        
        const activeId = e.activeId || (items && items.length >= 2 ? items[0] : '');
        const overId = e.overId || (items && items.length >= 2 ? items[1] : null);

        onDragEnd(createDragEndEvent(activeId, overId));
      }}
    >
      {children}
    </div>
  );
};
