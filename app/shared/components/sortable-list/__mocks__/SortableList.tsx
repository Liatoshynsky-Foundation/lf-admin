import React, { ReactNode } from 'react';

interface SortableListMockProps {
  children: ReactNode;
  onDragEnd?: (event: any) => void;
  items?: string[];
}

export const SortableList = ({ children, onDragEnd, items }: SortableListMockProps) => {
  return (
    <button
      data-testid="mock-sortable-list"
      onClick={(e: any) => {
        if(!onDragEnd) return;
        
        const activeId = e.activeId || (items && items.length >= 2 ? items[0] : '');
        const overId = e.overId || (items && items.length >= 2 ? items[1] : '');

        onDragEnd({
          active: { id: activeId },
          over: { id: overId }
        });
      }}
    >
      {children}
    </button>
  );
};
