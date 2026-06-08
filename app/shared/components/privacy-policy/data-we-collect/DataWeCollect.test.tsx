import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { createDocNode } from '../../about-us/__mocks__/utils';
import { DataWeCollect } from './DataWeCollect';
import { DataWeCollectBlock } from '~/types/store/pages/privacy-policy';

const usePageBlockMock = jest.fn();
const setFieldMock = jest.fn();


jest.mock('~/shared/hooks/use-page-block/usePageBlock', () => ({
  usePageBlock: () => usePageBlockMock()
}));
jest.mock('~/store', () => ({
  useStore: (selector: (state: { readonly locale: 'uk'; readonly setField: typeof setFieldMock }) => unknown) =>
    selector({ locale: 'uk', setField: setFieldMock })
}));

jest.mock('../../edit-block-skeleton/EditBlockSkeleton', () => ({
  EditBlockSkeleton: () => <div data-testid="skeleton">Loading...</div>
}));

interface MockConfigurableListProps<T> {
    readonly items: readonly T[];
    readonly addBtnLabel: string;
    readonly onCreate: () => void;
    readonly renderItem: (props: { readonly item: T }) => React.ReactNode;
    readonly editable: boolean;
    readonly onDelete: (id: string) => void;
}

jest.mock('~/components/configurable-list/ConfigurableList', () => ({
  __esModule: true,
  default: <T extends { readonly id: string }>({
    items,
    addBtnLabel,
    onCreate,
    renderItem,
    editable,
    onDelete
  }: MockConfigurableListProps<T>) => (
    <div data-testid="configurable-list">
      {items.map((item) => (
        <div key={item.id} data-testid={`list-item-${item.id}`}>
          {renderItem({ item })}
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
  )
}));


jest.mock('~/ds-components/collapsible-block/CollapsibleBlock');
jest.mock('~/ds-components/text-field/TextField');


const mockTitleJson = createDocNode('Initial title');
const mockDescriptionJson = createDocNode('Initial description');
const mockNoteJson = createDocNode('Initial note');
const mockSubtitleJson = createDocNode('Initial subtitle');
const mockListItem1 = createDocNode('Initial list item 1');

const mockBlock: DataWeCollectBlock = {
  title: { uk: mockTitleJson, en: mockTitleJson },
  description: { uk: mockDescriptionJson, en: mockDescriptionJson },
  sections: [{ id: '1', list: [{ uk: mockListItem1, en: mockListItem1 }], subtitle: { uk: mockSubtitleJson, en: mockSubtitleJson } }],
  note: { uk: mockNoteJson, en: mockNoteJson },
};

const keys = {
  description: 'Вступний текст секції',
  list: 'Список 1',
  listItem: 'Текст пункту',
  note: 'Додаткова інформація',
};

const runSimulation = (testidToClick?: string) => {
  render(<DataWeCollect />);

  if (testidToClick) {
    fireEvent.click(screen.getByTestId(testidToClick));
  }
};

beforeAll(() => {
  crypto.randomUUID = jest.fn(() => 'uuid-1') as typeof crypto.randomUUID;
});

describe('DataWeCollect', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    usePageBlockMock.mockReturnValue({ block: mockBlock });
  });

  it('should render structural layout boundaries and confirm deep initial JSON content payloads inside the DOM', () => {
    runSimulation();
    
    expect(screen.getByTestId('collapsible-block')).toBeInTheDocument();
    expect(screen.getByTestId(`textfield-json-${keys.description}`)).toHaveTextContent(JSON.stringify(mockDescriptionJson));
    expect(screen.getByTestId(`textfield-json-${keys.list}`)).toHaveTextContent(JSON.stringify(mockSubtitleJson));
    expect(screen.getByTestId(`textfield-json-${keys.listItem}`)).toHaveTextContent(JSON.stringify(mockListItem1));
    
    expect(screen.getByTestId(`textfield-json-${keys.note}`)).toHaveTextContent(JSON.stringify(mockNoteJson));
  });
});



