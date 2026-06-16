import { closestCenter, CollisionDetection, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

interface SortableBoardProps {
    readonly onDragEnd: (event: DragEndEvent) => void;
    readonly children: React.ReactNode;
    readonly collisionDetection?: CollisionDetection;
}

export function SortableBoard({ onDragEnd, children, collisionDetection = closestCenter }: SortableBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, 
      },
    })
  );

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd} collisionDetection={collisionDetection}>
      {children}
    </DndContext>
  );
}