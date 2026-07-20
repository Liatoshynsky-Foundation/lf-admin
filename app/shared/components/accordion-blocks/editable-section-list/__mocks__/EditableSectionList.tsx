import { JSONContent } from '@tiptap/react';

import { createDocNode } from '~/__mocks__/utils';

export interface MockSectionListItem {
  readonly id: string;
  readonly title: JSONContent;
  readonly description: JSONContent;
}

export interface MockEditableSectionListProps {
  readonly title: JSONContent;
  readonly onTitleChange: (value: JSONContent) => void;
  readonly onTitleBlur?: () => void;
  readonly titleError?: boolean;
  readonly titleHelperText?: string;
  readonly items: readonly MockSectionListItem[];
  readonly onChangeItem: (id: string, field: 'title' | 'description', value: JSONContent) => void;
  readonly onCreateItem: () => { readonly id: string };
  readonly onDeleteItem: (id: string) => void;
  readonly sectionLabel: string;
  readonly onDragEnd?: (event: any) => void;
}

export const EditableSectionList = ({
  title,
  onTitleChange,
  onTitleBlur,
  titleError,
  titleHelperText,
  items,
  onChangeItem,
  onCreateItem,
  onDeleteItem,
  sectionLabel,
  onDragEnd
}: MockEditableSectionListProps) => (
  <div data-testid="editable-section-list" data-label={sectionLabel}>
    <div data-testid="main-title-json">{JSON.stringify(title)}</div>
    <button
      data-testid="trigger-main-title-change"
      onClick={() => onTitleChange(createDocNode('Updated Section Title'))}
    >
      Change Main Title
    </button>
    <button data-testid="trigger-main-title-clear" onClick={() => onTitleChange({ type: 'doc', content: [] })}>
      Clear Main Title
    </button>
    {onTitleBlur && (
      <button data-testid="trigger-main-title-blur" onClick={onTitleBlur}>
        Blur Main Title
      </button>
    )}
    {titleError && <span data-testid="main-title-error">{titleHelperText}</span>}
    {onDragEnd && (
      <button
        data-testid="trigger-drag-end"
        onClick={() => onDragEnd({ active: { id: '1' }, over: { id: '2' } })}
      >
        Drag End
      </button>
    )}
    {items.map((item) => (
      <div key={item.id} data-testid={`goal-item-${item.id}`}>
        <span data-testid={`item-title-${item.id}`}>{JSON.stringify(item.title)}</span>
        <span data-testid={`item-desc-${item.id}`}>{JSON.stringify(item.description)}</span>
        <button
          data-testid={`trigger-item-title-change-${item.id}`}
          onClick={() => onChangeItem(item.id, 'title', createDocNode('Updated Item Title'))}
        >
          Change Item Title
        </button>
        <button
          data-testid={`trigger-item-desc-change-${item.id}`}
          onClick={() => onChangeItem(item.id, 'description', createDocNode('Updated Item Description'))}
        >
          Change Item Description
        </button>
        <button data-testid={`trigger-item-delete-${item.id}`} onClick={() => onDeleteItem(item.id)}>
          Delete Item
        </button>
      </div>
    ))}
    <button data-testid="trigger-item-create" onClick={onCreateItem}>
      Create Item
    </button>
  </div>
);
