import { JSONContent} from '@tiptap/react';

interface MockPoinstsListProps<T> {
    points: T[],
    addPoint: () => T;
}
export const PointsList = <T extends { readonly id: string; readonly value: JSONContent }>({ addPoint, points }: MockPoinstsListProps<T>) => (
  <div data-testid="points-list" >
    <button data-testid="trigger-add-point" onClick={addPoint}>Add</button>
    <span data-testid="points-count">{points.length}</span>
  </div >
);