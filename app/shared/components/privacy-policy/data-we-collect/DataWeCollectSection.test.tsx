import { DragEndEvent } from '@dnd-kit/core';
import { fireEvent,render, screen } from '@testing-library/react';
import { JSONContent } from '@tiptap/react';
import React from 'react';

import { DataWeCollectSection, DataWeCollectSectionProps } from './DataWeCollectSection';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';
import { LocalizedJSON } from '~/types/common';

jest.mock('~/lib/utils/sortableDragEndHelper', () => ({
  handleSortableDragEnd: jest.fn()
}));

interface MockTextFieldProps {
  title?: string;
  label?: string;
  value: JSONContent;
  onChange: (value: JSONContent) => void;
}

jest.mock('../../design-system/text-field/TextField', () => ({
  CustomTextField: ({ title, label, value, onChange }: MockTextFieldProps) => (
    <div>
      <label>{title || label}</label>
      <input
        data-testid="tf-input"
        value={JSON.stringify(value)}
        onChange={(e) => {
          try {
            onChange(JSON.parse(e.target.value) as JSONContent);
          } catch {
            onChange({ type: 'doc', content: [] });
          }
        }}
      />
    </div>
  )
}));

interface MockSortableListProps {
  children: React.ReactNode;
  onDragEnd: (event: DragEndEvent) => void;
}

jest.mock('../../sortable-list/SortableList', () => ({
  SortableList: ({ children, onDragEnd }: MockSortableListProps) => (
    <div
      data-testid="sortable-list-container"
      onClick={() => onDragEnd({ active: { id: 'p1' }, over: { id: 'p2' } } as unknown as DragEndEvent)}
    >
      {children}
    </div>
  )
}));

jest.mock('../../sortable-item-wrapper/SortableItemWrapper', () => ({
  SortableItemWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

interface MockConfigurableListProps<T> {
  items: T[];
  renderItem: (args: { item: T; onChange: (value: T) => void }) => React.ReactNode;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onChange: (value: T) => void;
}

jest.mock('../../configurable-list/ConfigurableList', () => ({
  __esModule: true,
  default: <T extends { id: string }>({
    items,
    renderItem,
    onCreate,
    onDelete,
    onChange
  }: MockConfigurableListProps<T>) => (
    <div>
      {items.map((item) => (
        <div key={item.id}>
          {renderItem({ item, onChange })}
          <button data-testid={`delete-${item.id}`} onClick={() => onDelete(item.id)}>
            Delete
          </button>
        </div>
      ))}
      <button data-testid="add-btn" onClick={onCreate}>
        Add
      </button>
    </div>
  )
}));

describe('DataWeCollectSection', () => {
  const mockUpdateSubtitle = jest.fn();
  const mockUpdateList = jest.fn();
  const mockUpdatePoint = jest.fn();
  const mockAddPoint = jest.fn();
  const mockRemovePoint = jest.fn();

  const mockProps: DataWeCollectSectionProps = {
    section: {
      id: 'section-1',
      title: { type: 'doc', content: [] },
      points: [
        { id: 'p1', uk: { type: 'doc', content: [{ type: 'text', text: 'point1' }] }, en: { type: 'doc', content: [] } }
      ]
    },
    listTitle: 'List Title',
    currentLocale: 'uk',
    updateSectionSubtitle: mockUpdateSubtitle,
    updateSectionList: mockUpdateList,
    updateListPoint: mockUpdatePoint,
    addListPoint: mockAddPoint,
    removeListPoint: mockRemovePoint
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update section subtitle when title field changes', () => {
    render(<DataWeCollectSection {...mockProps} />);
    const inputs = screen.getAllByTestId('tf-input');
    const newValue = { type: 'doc', content: [{ type: 'paragraph', text: 'New Title' }] };

    fireEvent.change(inputs[0], { target: { value: JSON.stringify(newValue) } });
    expect(mockUpdateSubtitle).toHaveBeenCalledWith('section-1', newValue);
  });

  it('should trigger handleDragEnd and call updateSectionList', () => {
    const mockReordered = [...mockProps.section.points];
    (handleSortableDragEnd as jest.Mock).mockImplementation(
      (_ev, _items, callback: (items: (LocalizedJSON & { id: string })[]) => void) => {
        callback(mockReordered);
      }
    );

    render(<DataWeCollectSection {...mockProps} />);
    fireEvent.click(screen.getByTestId('sortable-list-container'));

    expect(handleSortableDragEnd).toHaveBeenCalled();
    expect(mockUpdateList).toHaveBeenCalledWith('section-1', mockReordered);
  });

  it('should update specific list point for current locale', () => {
    render(<DataWeCollectSection {...mockProps} />);
    const pointInputs = screen.getAllByTestId('tf-input');
    const newValue = { type: 'doc', content: [{ type: 'text', text: 'updated' }] };

    fireEvent.change(pointInputs[1], { target: { value: JSON.stringify(newValue) } });

    expect(mockUpdatePoint).toHaveBeenCalledWith('section-1', {
      ...mockProps.section.points[0],
      uk: newValue
    });
  });

  it('should use default JSON content if locale data is missing', () => {
    const propsWithMissingData = {
      ...mockProps,
      section: {
        ...mockProps.section,
        points: [{ id: 'p2' } as LocalizedJSON & { id: string }]
      }
    };

    render(<DataWeCollectSection {...propsWithMissingData} />);
    const pointInputs = screen.getAllByTestId('tf-input');

    expect(pointInputs[1]).toHaveValue(JSON.stringify({ type: 'doc', content: [] }));
  });

  it('should call addListPoint on create action', () => {
    render(<DataWeCollectSection {...mockProps} />);
    fireEvent.click(screen.getByTestId('add-btn'));
    expect(mockAddPoint).toHaveBeenCalledWith('section-1');
  });

  it('should call removeListPoint on delete action', () => {
    render(<DataWeCollectSection {...mockProps} />);
    fireEvent.click(screen.getByTestId('delete-p1'));
    expect(mockRemovePoint).toHaveBeenCalledWith('section-1', 'p1');
  });
});
