import { JSONContent } from '@tiptap/react';

import { createDocNode } from '~/shared/components/about-us/__mocks__/utils';

export interface MockSectionListItem {
  readonly id: string;
  readonly title: JSONContent;
  readonly description: JSONContent;
}

export interface MockEditableSectionListProps {
  readonly title: JSONContent;
  readonly onTitleChange: (value: JSONContent) => void;
  readonly items: readonly MockSectionListItem[];
  readonly onChangeItem: (id: string, field: 'title' | 'description', value: JSONContent) => void;
  readonly onCreateItem: () => { readonly id: string };
  readonly onDeleteItem: (id: string) => void;
  readonly sectionLabel: string;
}


export const EditableSectionList = ({
  title,
  onTitleChange,
  items,
  onChangeItem,
  onCreateItem,
  onDeleteItem,
  sectionLabel
}: MockEditableSectionListProps) => (
  <div data-testid="editable-section-list" data-label={sectionLabel}>
    <div data-testid="main-title-json">{JSON.stringify(title)}</div>
    <button
      data-testid="trigger-main-title-change"
      onClick={() => onTitleChange(createDocNode('Updated Section Title'))}
    >
      Change Main Title
    </button>
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
