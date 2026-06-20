import { DragEndEvent } from '@dnd-kit/core';
import { JSONContent } from '@tiptap/react';
import React from 'react';

import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';

interface MockPointsListProps<T> {
  id: string;
  points: T[];
  addPoint: () => void;
  updatePoint: (val: T) => void;
  removePoint: (id: string) => void;
  onDragEnd?: (event: DragEndEvent) => void;
}

export const PointsList = <T extends { readonly id: string; readonly value: JSONContent }>({
  id,
  addPoint,
  points,
  updatePoint,
  removePoint,
  onDragEnd
}: MockPointsListProps<T>) => (
    <div data-testid="points-list" data-list-id={id} data-has-drag={onDragEnd ? 'true' : 'false'}>
      <button data-testid="trigger-add-point" onClick={addPoint}>
      Add
      </button>
      <span data-testid="points-count">{points.length}</span>
      {points.map((point) => (
        <div key={point.id} data-testid="mock-point-wrapper">
          <CustomTextField
            fieldType="formatting"
            label="Текст пункту"
            value={point.value}
            onChange={(val) => updatePoint({ ...point, value: val })}
          />
          <button data-testid={`remove-point-${point.id}`} onClick={() => removePoint(point.id)}>
          Remove
          </button>
        </div>
      ))}
    </div>
  );