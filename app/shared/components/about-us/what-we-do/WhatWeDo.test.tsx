import { fireEvent, render, screen } from '@testing-library/react';
import { JSONContent } from '@tiptap/react';
import React from 'react';

import WhatWeDo from './WhatWeDo';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { WhatWeDolItemWithId } from '~/types/store/pages/about-us/blocks/whatWeDoBlock';

interface MockSectionListItem {
  readonly id: string;
  readonly title: JSONContent;
  readonly description: JSONContent;
}

interface MockEditableSectionListProps {
  readonly title: JSONContent;
  readonly onTitleChange: (value: JSONContent) => void;
  readonly items: readonly MockSectionListItem[];
  readonly onChangeItem: (id: string, field: 'title' | 'description', value: JSONContent) => void;
  readonly onCreateItem: () => { readonly id: string };
  readonly onDeleteItem: (id: string) => void;
  readonly sectionLabel: string;
}

const setFieldMock = jest.fn();
const usePageBlockMock = jest.fn();

jest.mock('~/store', () => ({
  useStore: (selector: (state: { readonly locale: 'uk'; readonly setField: typeof setFieldMock }) => unknown) =>
    selector({ locale: 'uk', setField: setFieldMock })
}));

jest.mock('~/shared/hooks/use-page-block/usePageBlock', () => ({
  usePageBlock: () => usePageBlockMock()
}));

jest.mock('~/ds-components/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ children, title }: { readonly children: React.ReactNode; readonly title: string }) => (
    <section data-testid="collapsible-block">
      <h2>{title}</h2>
      {children}
    </section>
  )
}));

const createDocNode = (text: string): JSONContent => ({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text }] }]
});

jest.mock('../../accordion-blocks/editable-section-list/EditableSectionList', () => ({
  __esModule: true,
  EditableSectionList: ({
    title,
    onTitleChange,
    items,
    onChangeItem,
    onCreateItem,
    onDeleteItem,
    sectionLabel
  }: MockEditableSectionListProps) => (
    <div data-testid="editable-section-list" data-label={sectionLabel}>
      <div data-testid="section-title-json">{JSON.stringify(title)}</div>
      <button data-testid="trigger-section-title-change" onClick={() => onTitleChange(createDocNode('Updated Section Title'))}>
        Change Section Title
      </button>

      {items.map((item) => (
        <div key={item.id} data-testid={`item-container-${item.id}`}>
          <span data-testid={`item-title-${item.id}`}>{JSON.stringify(item.title)}</span>
          <span data-testid={`item-desc-${item.id}`}>{JSON.stringify(item.description)}</span>

          <button data-testid={`trigger-item-title-change-${item.id}`} onClick={() => onChangeItem(item.id, 'title', createDocNode('Updated Item Title'))}>
            Change Item Title
          </button>
          <button data-testid={`trigger-item-desc-change-${item.id}`} onClick={() => onChangeItem(item.id, 'description', createDocNode('Updated Item Description'))}>
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
  )
}));

const ITEM_ID = 'mock-item-id-1';

beforeAll(() => {
  crypto.randomUUID = jest.fn(() => 'uuid-generated-token') as typeof crypto.randomUUID;
});

const mockBlockTitleJson = createDocNode('What We Do Section Title');
const mockItemTitleJson = createDocNode('Activity Item Title');
const mockItemDescJson = createDocNode('Activity Item Description');

const mockBlock = {
  title: { uk: mockBlockTitleJson },
  items: [
    {
      id: ITEM_ID,
      title: { uk: mockItemTitleJson, en: {} },
      description: { uk: mockItemDescJson, en: { type: 'doc', content: [] } }
    }
  ] as WhatWeDolItemWithId[]
};

const runSimulation = (testidToClick?: string) => {
  render(<WhatWeDo />);
  if (testidToClick) {
    fireEvent.click(screen.getByTestId(testidToClick));
  }
};

describe('WhatWeDo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePageBlockMock.mockReturnValue({ block: mockBlock });
  });

  it('should render skeleton when block data is unpopulated or missing', () => {
    usePageBlockMock.mockReturnValueOnce({ block: null });
    const { container } = render(<WhatWeDo />);

    expect(screen.queryByTestId('editable-section-list')).not.toBeInTheDocument();
    expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });

  it('should mount structural parent envelopes and read accurate raw structural text values out of the inner mock DOM', () => {
    runSimulation();

    expect(screen.getByTestId('collapsible-block')).toBeInTheDocument();
    expect(screen.getByTestId('editable-section-list')).toHaveAttribute('data-label', 'Пункти секції:');
    
    expect(screen.getByTestId('section-title-json')).toHaveTextContent(JSON.stringify(mockBlockTitleJson));
    expect(screen.getByTestId(`item-title-${ITEM_ID}`)).toHaveTextContent(JSON.stringify(mockItemTitleJson));
    expect(screen.getByTestId(`item-desc-${ITEM_ID}`)).toHaveTextContent(JSON.stringify(mockItemDescJson));
  });

  it.each([
    [
      'parent section title updates',
      'trigger-section-title-change',
      'title',
      expect.objectContaining({ uk: createDocNode('Updated Section Title') })
    ],
    [
      'deep nested rich text item titles through list array mutations',
      `trigger-item-title-change-${ITEM_ID}`,
      'items',
      expect.arrayContaining([
        expect.objectContaining({ id: ITEM_ID, title: expect.objectContaining({ uk: createDocNode('Updated Item Title') }) })
      ])
    ],
    [
      'deep nested rich text item descriptions through list array mutations',
      `trigger-item-desc-change-${ITEM_ID}`,
      'items',
      expect.arrayContaining([
        expect.objectContaining({ id: ITEM_ID, description: expect.objectContaining({ uk: createDocNode('Updated Item Description') }) })
      ])
    ],
    [
      'newly initialized localized object block structures upon creation',
      'trigger-item-create',
      'items',
      expect.arrayContaining([
        expect.objectContaining({ id: ITEM_ID }),
        expect.objectContaining({
          id: 'uuid-generated-token',
          title: { uk: {}, en: {} },
          description: { uk: { type: 'doc', content: [] }, en: { type: 'doc', content: [] } }
        })
      ])
    ],
    [
      'deleting specified data entries out of the child parameters map',
      `trigger-item-delete-${ITEM_ID}`,
      'items',
      []
    ]
  ])(
    'should correctly dispatch setField during %s',
    (_scenario, triggerId, storeKey, expectedPayload) => {
      runSimulation(triggerId);

      expect(setFieldMock).toHaveBeenCalledWith(
        PAGE_IDS.ABOUT_US,
        BLOCK_IDS.WHAT_WE_DO,
        storeKey,
        expectedPayload
      );
    }
  );
});
