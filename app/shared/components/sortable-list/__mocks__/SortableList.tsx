import type { DragEndEvent } from '@dnd-kit/core';
import React, { ReactNode } from 'react';

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
      onClick={() => {
        if (!onDragEnd) return;

        const hasPair = items !== undefined && items.length >= 2;

        onDragEnd(createDragEndEvent(hasPair ? items[0] : '', hasPair ? items[1] : null));
      }}
    >
      {children}
    </div>
  );
};
