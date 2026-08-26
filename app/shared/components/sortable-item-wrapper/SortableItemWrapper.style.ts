import { CSS, Transform } from '@dnd-kit/utilities';

import { GripPosition } from '../grip/Grip';

export const styles = {
  getItemStyles: (
    transform: Transform | null,
    isDragging: boolean,
    transition: string | undefined,
    gripHandle: boolean,
    gripPosition: GripPosition = 'center',
    tableRow = false
  ) => {
    const display = gripHandle && !tableRow ? 'flex' : 'block';

    return {
      display,
      ...(tableRow ? { position: 'relative', width: '100%' } : {
        alignItems: gripPosition === 'top' ? 'flex-start' : 'center',
        gap: gripHandle ? '12px' : '0px'
      }),
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.4 : 1,
      zIndex: isDragging ? 10 : 1
    };
  }
};