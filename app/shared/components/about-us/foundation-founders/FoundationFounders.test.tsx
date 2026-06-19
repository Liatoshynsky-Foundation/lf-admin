import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { FoundationFounders } from './FoundationFounders';
import { createDocNode } from '~/__mocks__/utils';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { TeamMemberWithId } from '~/types/store/pages/about-us/blocks/foundationFounderBlock';


export interface MockContributorCardProps {
  readonly contributor: TeamMemberWithId;
  readonly currentLocale: 'uk' | 'en';
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
jest.mock('~/ds-components/collapsible-block/CollapsibleBlock');
jest.mock('~/ds-components/text-field/TextField');

jest.mock('~/components/configurable-list/ConfigurableList');
jest.mock('~/components/contributor-card/ContributorCard', () => ({
  __esModule: true,
  ContributorCard: ({ contributor, currentLocale }: MockContributorCardProps) => (
    <div data-testid={`contributor-card-${contributor.id}`}>
      <span data-testid={`contributor-name-json-${contributor.id}`}>
        {JSON.stringify(contributor.name[currentLocale])}
      </span>
    </div>
  )
}));

const TARGET_MEMBER_ID = 'target-member-1';

beforeAll(() => {
  globalThis.crypto.randomUUID = jest.fn(() => 'test-id') as unknown as typeof crypto.randomUUID;
});

const mockIntroJson = createDocNode('Вступ');
const mockListTitleJson = createDocNode('Список');
const mockMemberNameJson = createDocNode('Тест');

const defaultMockBlock = {
  titleText: { uk: mockIntroJson, en: { type: 'doc', content: [] } },
  listTitle: { uk: mockListTitleJson, en: { type: 'doc', content: [] } },
  members: [] as TeamMemberWithId[]
};

const populatedMockBlock = {
  ...defaultMockBlock,
  members: [
    {
      id: TARGET_MEMBER_ID,
      name: { uk: mockMemberNameJson, en: {} },
      description: { uk: {}, en: {} },
      photo: { src: '', alt: {}, caption: {}, generatedSrc: '' }
    }
  ] as TeamMemberWithId[]
};

const runSimulation = (blockData: unknown, testidToClick?: string) => {
  usePageBlockMock.mockReturnValue({ block: blockData });
  render(<FoundationFounders />);
  if (testidToClick) {
    fireEvent.click(screen.getByTestId(testidToClick));
  }
};

describe('FoundationFounders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render skeleton when no block exists', () => {
    runSimulation(null);
    expect(screen.queryByTestId('collapsible')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });

  it('should verify initial layout textfield rich text payloads match serialization expectations', () => {
    runSimulation(defaultMockBlock);

    expect(screen.getByTestId('textfield-json-Вступний текст секції')).toHaveTextContent(JSON.stringify(mockIntroJson));
    expect(screen.getByTestId('textfield-json-Заголовок секції')).toHaveTextContent(JSON.stringify(mockListTitleJson));
  });

  it.each([
    [
      'intro section text fields',
      defaultMockBlock,
      'trigger-change-Вступний текст секції',
      'titleText',
      expect.objectContaining({ uk: createDocNode('Updated Вступний текст секції') })
    ],
    [
      'list structural headers',
      defaultMockBlock,
      'trigger-change-Заголовок секції',
      'listTitle',
      expect.objectContaining({ uk: createDocNode('Updated Заголовок секції') })
    ],
    [
      'clean localized item layout additions',
      defaultMockBlock,
      'add-btn',
      'members',
      expect.arrayContaining([
        expect.objectContaining({
          id: 'test-id',
          name: { uk: {}, en: {} },
          description: { uk: {}, en: {} },
          photo: expect.objectContaining({ src: '' })
        })
      ])
    ],
    [
      'targeted item removal matrices',
      populatedMockBlock,
      `delete-${TARGET_MEMBER_ID}`,
      'members',
      []
    ]
  ])(
    'should correctly dispatch setField parameters when modifying %s',
    (_scenario, mockData, triggerId, storeKey, expectedPayload) => {
      runSimulation(mockData, triggerId);

      expect(setFieldMock).toHaveBeenCalledWith(
        PAGE_IDS.ABOUT_US,
        BLOCK_IDS.FOUNDATION_FOUNDERS,
        storeKey,
        expectedPayload
      );
    }
  );
});
