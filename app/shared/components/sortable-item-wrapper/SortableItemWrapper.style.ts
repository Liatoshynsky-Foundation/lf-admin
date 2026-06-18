import { CSS, Transform } from '@dnd-kit/utilities';

export const styles = {
  getItemStyles: (transform: Transform | null, isDragging: boolean, transition: string | undefined, gripHandle: boolean) =>
    ({
      display: gripHandle ? 'flex' : 'block',
      gap: gripHandle ? '12px' : '0px',
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.4 : 1,
      zIndex: isDragging ? 10 : 1,
    })
};