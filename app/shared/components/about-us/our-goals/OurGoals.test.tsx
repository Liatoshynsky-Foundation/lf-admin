import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import OurGoals from './OurGoals';
import { createDocNode } from '~/__mocks__/utils';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { GoalItemWithId } from '~/types/store/pages/about-us/blocks/ourGoalsBlock';

const setFieldMock = jest.fn();
const toggleBlockVisibilityMock = jest.fn();
const setFieldValidityMock = jest.fn();
const usePageBlockMock = jest.fn();
jest.mock('~/store', () => ({
  useStore: (selector: (state: { readonly locale: 'uk'; readonly setField: typeof setFieldMock; readonly toggleBlockVisibility: typeof toggleBlockVisibilityMock; readonly setFieldValidity: typeof setFieldValidityMock }) => unknown) =>
    selector({ locale: 'uk', setField: setFieldMock, toggleBlockVisibility: toggleBlockVisibilityMock, setFieldValidity: setFieldValidityMock })
}));
jest.mock('~/shared/hooks/use-page-block/usePageBlock', () => ({
  usePageBlock: () => usePageBlockMock()
}));
jest.mock('~/ds-components/collapsible-block/CollapsibleBlock');
jest.mock('~/components/accordion-blocks/editable-section-list/EditableSectionList');
jest.mock('~/components/grip/Grip');

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

  it('should call toggleBlockVisibility with pageId and blockId when the visibility toggle is clicked', () => {
    setupTest('collapsible-block-toggle-visibility');

    expect(toggleBlockVisibilityMock).toHaveBeenCalledWith(PAGE_IDS.ABOUT_US, BLOCK_IDS.OUR_GOALS);
  });

  it('should leave unrelated goal items untouched when updating a single item in a multi-item list', () => {
    const otherGoal = {
      id: 'other-id',
      title: { uk: mockGoalTitleJson, en: { type: 'doc', content: [] } },
      description: { uk: mockGoalDescJson, en: { type: 'doc', content: [] } }
    };
    const multiItemBlock = {
      title: { uk: mockBlockTitleJson },
      goals: [mockBlock.goals[0], otherGoal] as GoalItemWithId[]
    };
    usePageBlockMock.mockReturnValue({ block: multiItemBlock });

    render(<OurGoals />);
    fireEvent.click(screen.getByTestId(`trigger-item-title-change-${TARGET_ID}`));

    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.OUR_GOALS,
      'goals',
      [
        expect.objectContaining({ id: TARGET_ID, title: expect.objectContaining({ uk: createDocNode('Updated Item Title') }) }),
        otherGoal
      ]
    );
  });

  it('should mark the title as invalid after blur when it is empty, and clear the flag on unmount', () => {
    usePageBlockMock.mockReturnValue({
      block: { ...mockBlock, title: { uk: { type: 'doc', content: [] } } }
    });

    const { unmount } = render(<OurGoals />);

    fireEvent.click(screen.getByTestId('trigger-main-title-blur'));

    expect(screen.getByTestId('main-title-error')).toBeInTheDocument();
    expect(setFieldValidityMock).toHaveBeenCalledWith(`${PAGE_IDS.ABOUT_US}:${BLOCK_IDS.OUR_GOALS}:title`, true);

    unmount();

    expect(setFieldValidityMock).toHaveBeenLastCalledWith(`${PAGE_IDS.ABOUT_US}:${BLOCK_IDS.OUR_GOALS}:title`, false);
  });

  it('should render the grip handle and handle drag-and-drop reordering', () => {
    const doubleMockBlock = {
      title: { uk: mockBlockTitleJson },
      goals: [
        {
          id: '1',
          title: { uk: mockGoalTitleJson, en: { type: 'doc', content: [] } },
          description: { uk: mockGoalDescJson, en: { type: 'doc', content: [] } }
        },
        {
          id: '2',
          title: { uk: mockGoalTitleJson, en: { type: 'doc', content: [] } },
          description: { uk: mockGoalDescJson, en: { type: 'doc', content: [] } }
        }
      ]
    };
    usePageBlockMock.mockReturnValue({ block: doubleMockBlock });

    render(<OurGoals />);

    expect(screen.getByTestId('collapsible-block-grip')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('trigger-drag-end'));

    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.OUR_GOALS,
      'goals',
      [doubleMockBlock.goals[1], doubleMockBlock.goals[0]]
    );
  });
});
