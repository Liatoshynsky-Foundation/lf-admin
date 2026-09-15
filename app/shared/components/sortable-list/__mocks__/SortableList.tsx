import React, { ReactNode } from 'react';

interface SortableListMockProps {
  children: ReactNode;
  onDragEnd?: (event: { active: { id: string }; over: { id: string } }) => void;
  items?: string[];
}

export const SortableList = ({ children, onDragEnd, items }: SortableListMockProps) => {
  return (
    <div // NOSONAR - was explicitly added to avoid triggering sonarqube(typescript:S6848) & sonarqube(typescript:S1082)
      data-testid="mock-sortable-list"
      onClick={(e: React.MouseEvent<HTMLDivElement> & { activeId?: string; overId?: string }) => {
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
    </div>
  );
};
