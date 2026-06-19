import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import OurGoals from './OurGoals';
import { createDocNode } from '~/__mocks__/utils';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { GoalItemWithId } from '~/types/store/pages/about-us/blocks/ourGoalsBlock';

const setFieldMock = jest.fn();
const usePageBlockMock = jest.fn();
jest.mock('~/store', () => ({
  useStore: (selector: (state: { readonly locale: 'uk'; readonly setField: typeof setFieldMock }) => unknown) =>
    selector({ locale: 'uk', setField: setFieldMock })
}));
jest.mock('~/shared/hooks/use-page-block/usePageBlock', () => ({
  usePageBlock: () => usePageBlockMock()
}));
jest.mock('~/ds-components/collapsible-block/CollapsibleBlock');
jest.mock('~/components/accordion-blocks/editable-section-list/EditableSectionList');

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
