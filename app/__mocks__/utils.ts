import type { DragEndEvent } from '@dnd-kit/core';
import { JSONContent} from '@tiptap/react';

export const createDocNode = (text: string): JSONContent => ({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text }] }]
});

export const createDragEndEvent = (activeId: string, overId: string | null): DragEndEvent => ({
  active: {
    id: activeId,
    data: { current: undefined },
    rect: { current: { initial: null, translated: null } }
  },
  over:
    overId === null
      ? null
      : {
        id: overId,
        data: { current: undefined },
        rect: { width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 },
        disabled: false
      },
  activatorEvent: new Event('pointerdown'),
  collisions: null,
  delta: { x: 0, y: 0 }
});
