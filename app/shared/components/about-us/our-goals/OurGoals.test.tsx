import { fireEvent, render, screen } from '@testing-library/react';
import { JSONContent } from '@tiptap/react';
import React from 'react';

import OurGoals from './OurGoals';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { GoalItemWithId } from '~/types/store/pages/about-us/blocks/ourGoalsBlock';

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
      <div data-testid="main-title-json">{JSON.stringify(title)}</div>
      <button data-testid="trigger-main-title-change" onClick={() => onTitleChange(createDocNode('Updated Section Title'))}>
        Change Main Title
      </button>

      {items.map((item) => (
        <div key={item.id} data-testid={`goal-item-${item.id}`}>
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

const TARGET_ID = 'target-id-1';
const emptyDoc = { uk: { type: 'doc', content: [] }, en: { type: 'doc', content: [] } };

beforeAll(() => {
  crypto.randomUUID = jest.fn(() => 'uuid-generated-1') as typeof crypto.randomUUID;
});

const mockBlockTitleJson = createDocNode('Our Goals Main Title');
const mockGoalTitleJson = createDocNode('Goal Item Title Stub');
const mockGoalDescJson = createDocNode('Goal Item Description Stub');

const mockBlock = {
  title: { uk: mockBlockTitleJson },
  goals: [
    {
      id: TARGET_ID,
      title: { uk: mockGoalTitleJson, en: { type: 'doc', content: [] } },
      description: { uk: mockGoalDescJson, en: { type: 'doc', content: [] } }
    }
  ] as GoalItemWithId[]
};

const setupTest = (testidToClick?: string) => {
  render(<OurGoals />);
  if (testidToClick) {
    fireEvent.click(screen.getByTestId(testidToClick));
  }
};

describe('OurGoals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePageBlockMock.mockReturnValue({ block: mockBlock });
  });

  it('should render structural layout boundaries and confirm deep initial JSON content payloads inside the DOM', () => {
    setupTest();

    expect(screen.getByTestId('collapsible-block')).toBeInTheDocument();
    expect(screen.getByTestId('editable-section-list')).toHaveAttribute('data-label', 'Пункти секції:');
    
    expect(screen.getByTestId('main-title-json')).toHaveTextContent(JSON.stringify(mockBlockTitleJson));
    expect(screen.getByTestId(`item-title-${TARGET_ID}`)).toHaveTextContent(JSON.stringify(mockGoalTitleJson));
    expect(screen.getByTestId(`item-desc-${TARGET_ID}`)).toHaveTextContent(JSON.stringify(mockGoalDescJson));
  });

  it.each([
    [
      'main parent section title using structural rich text trees',
      'trigger-main-title-change',
      'title',
      expect.objectContaining({ uk: createDocNode('Updated Section Title') })
    ],
    [
      'target item titles inside the goals list structure',
      `trigger-item-title-change-${TARGET_ID}`,
      'goals',
      expect.arrayContaining([
        expect.objectContaining({ id: TARGET_ID, title: expect.objectContaining({ uk: createDocNode('Updated Item Title') }) })
      ])
    ],
    [
      'target item descriptions inside the goals list structure',
      `trigger-item-desc-change-${TARGET_ID}`,
      'goals',
      expect.arrayContaining([
        expect.objectContaining({ id: TARGET_ID, description: expect.objectContaining({ uk: createDocNode('Updated Item Description') }) })
      ])
    ],
    [
      'new localized item node block layout when triggered by creation engines',
      'trigger-item-create',
      'goals',
      expect.arrayContaining([
        expect.objectContaining({ id: TARGET_ID }),
        expect.objectContaining({ id: 'uuid-generated-1', title: emptyDoc, description: emptyDoc })
      ])
    ],
    [
      'empty list array when target identifiers are completely deleted',
      `trigger-item-delete-${TARGET_ID}`,
      'goals',
      []
    ]
  ])(
    'should dynamically update %s',
    (_scenario, triggerId, storeKey, expectedPayload) => {
      setupTest(triggerId);

      expect(setFieldMock).toHaveBeenCalledWith(
        PAGE_IDS.ABOUT_US, 
        BLOCK_IDS.OUR_GOALS, 
        storeKey, 
        expectedPayload
      );
    }
  );
});
