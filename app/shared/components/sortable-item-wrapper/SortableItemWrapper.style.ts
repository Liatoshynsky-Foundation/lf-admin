import { CSS, Transform } from '@dnd-kit/utilities';

export const styles = {
  getItemStyles: (transform: Transform | null, isDragging: boolean, transition: string | undefined) => ({
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : 1,
  })
};