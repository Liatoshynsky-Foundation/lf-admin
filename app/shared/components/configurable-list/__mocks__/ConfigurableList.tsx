import { JSONContent } from '@tiptap/react';
import React from 'react';
interface MockConfigurableListProps<T> {
    readonly items: readonly T[];
    readonly addBtnLabel: string;
    readonly onCreate: () => void;
    readonly renderItem: (props: {
        readonly item: T;
        readonly onChange: (item: T) => void;
    }) => React.ReactNode;
    readonly editable: boolean;
    readonly onChange: (item: T) => void;
    readonly onDelete: (id: string) => void;
}

const ConfigurableList = <T extends { readonly id: string; readonly value: JSONContent }>({
  items,
  addBtnLabel,
  onCreate,
  renderItem,
  editable,
  onChange,
  onDelete
}: MockConfigurableListProps<T>) => (
    <div data-testid="configurable-list">
      {items.map((item) => (
        <div key={item.id} data-testid={`list-item-${item.id}`}>
          {renderItem({
            item,
            onChange: (updatedItem) => onChange(updatedItem)
          })}
          {editable && (
            <button data-testid={`delete-${item.id}`} onClick={() => onDelete(item.id)}>
                        Delete
            </button>
          )}
        </div>
      ))}
      {editable && (
        <button data-testid="add-btn" onClick={onCreate}>
          {addBtnLabel}
        </button>
      )}
    </div>
  );

export default ConfigurableList;