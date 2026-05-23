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

jest.mock('~/store', () => ({
  useStore: (selector: (state: { readonly locale: 'uk'; readonly setField: typeof setFieldMock }) => unknown) =>
    selector({ locale: 'uk', setField: setFieldMock })
}));

const usePageBlockMock = jest.fn();
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
      <button
        data-testid="trigger-main-title-change"
        onClick={() => {
          const updatedJson: JSONContent = {
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated Section Title' }] }]
          };
          onTitleChange(updatedJson);
        }}
      >
        Change Main Title
      </button>

      {items.map((item) => (
        <div key={item.id} data-testid={`goal-item-${item.id}`}>
          <span data-testid={`item-title-${item.id}`}>{JSON.stringify(item.title)}</span>
          <span data-testid={`item-desc-${item.id}`}>{JSON.stringify(item.description)}</span>

          <button
            data-testid={`trigger-item-title-change-${item.id}`}
            onClick={() => {
              const updatedTitleJson: JSONContent = {
                type: 'doc',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated Item Title' }] }]
              };
              onChangeItem(item.id, 'title', updatedTitleJson);
            }}
          >
            Change Item Title
          </button>

          <button
            data-testid={`trigger-item-desc-change-${item.id}`}
            onClick={() => {
              const updatedDescJson: JSONContent = {
                type: 'doc',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated Item Description' }] }]
              };
              onChangeItem(item.id, 'description', updatedDescJson);
            }}
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
  )
}));

beforeAll(() => {
  crypto.randomUUID = jest.fn(() => 'uuid-generated-1') as typeof crypto.randomUUID;
});

const mockBlockTitleJson: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Our Goals Main Title' }] }]
};

const mockGoalTitleJson: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Goal Item Title Stub' }] }]
};

const mockGoalDescJson: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Goal Item Description Stub' }] }]
};

const mockBlock = {
  title: { uk: mockBlockTitleJson },
  goals: [
    {
      id: 'target-id-1',
      title: { uk: mockGoalTitleJson, en: { type: 'doc', content: [] } },
      description: { uk: mockGoalDescJson, en: { type: 'doc', content: [] } }
    }
  ] as GoalItemWithId[]
};

describe('OurGoals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePageBlockMock.mockReturnValue({ block: mockBlock });
  });

  it('should render structural layout boundaries and confirm deep initial JSON content payloads inside the DOM', () => {
    render(<OurGoals />);

    expect(screen.getByTestId('collapsible-block')).toBeInTheDocument();
    expect(screen.getByTestId('editable-section-list')).toHaveAttribute('data-label', 'Пункти секції:');
    
    expect(screen.getByTestId('main-title-json')).toHaveTextContent(JSON.stringify(mockBlockTitleJson));
    expect(screen.getByTestId('item-title-target-id-1')).toHaveTextContent(JSON.stringify(mockGoalTitleJson));
    expect(screen.getByTestId('item-desc-target-id-1')).toHaveTextContent(JSON.stringify(mockGoalDescJson));
  });

  it('should update the parent section title using structural rich text trees when triggered', () => {
    render(<OurGoals />);

    fireEvent.click(screen.getByTestId('trigger-main-title-change'));

    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.OUR_GOALS,
      'title',
      expect.objectContaining({
        uk: {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated Section Title' }] }]
        }
      })
    );
  });

  it('should mutate target item titles cleanly inside the goal list structure array matrix', () => {
    render(<OurGoals />);

    fireEvent.click(screen.getByTestId('trigger-item-title-change-target-id-1'));

    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.OUR_GOALS,
      'goals',
      expect.arrayContaining([
        expect.objectContaining({
          id: 'target-id-1',
          title: expect.objectContaining({
            uk: {
              type: 'doc',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated Item Title' }] }]
            }
          })
        })
      ])
    );
  });

  it('should mutate target item descriptions cleanly inside the goal list structure array matrix', () => {
    render(<OurGoals />);

    fireEvent.click(screen.getByTestId('trigger-item-desc-change-target-id-1'));

    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.OUR_GOALS,
      'goals',
      expect.arrayContaining([
        expect.objectContaining({
          id: 'target-id-1',
          description: expect.objectContaining({
            uk: {
              type: 'doc',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated Item Description' }] }]
            }
          })
        })
      ])
    );
  });

  it('should generate a type-safe empty double-localized item node block and push it to the list map upon creation triggers', () => {
    render(<OurGoals />);

    fireEvent.click(screen.getByTestId('trigger-item-create'));

    const emptyDoc = { uk: { type: 'doc', content: [] }, en: { type: 'doc', content: [] } };

    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.OUR_GOALS,
      'goals',
      expect.arrayContaining([
        expect.objectContaining({ id: 'target-id-1' }),
        expect.objectContaining({
          id: 'uuid-generated-1',
          title: emptyDoc,
          description: emptyDoc
        })
      ])
    );
  });

  it('should filter targeted identifier arrays out completely when deleting structural blocks', () => {
    render(<OurGoals />);

    fireEvent.click(screen.getByTestId('trigger-item-delete-target-id-1'));

    expect(setFieldMock).toHaveBeenCalledWith(PAGE_IDS.ABOUT_US, BLOCK_IDS.OUR_GOALS, 'goals', []);
  });
});
