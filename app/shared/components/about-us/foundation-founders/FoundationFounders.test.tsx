import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { FoundationFounders } from './FoundationFounders';
import { createDocNode } from '~/__mocks__/utils';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { TeamMemberWithId } from '~/types/store/pages/about-us/blocks/foundationFounderBlock';


export interface MockContributorCardProps {
  readonly contributor: TeamMemberWithId;
  readonly currentLocale: 'uk' | 'en';
  readonly onChangeName: (value: unknown) => void;
  readonly onChangeDescription: (value: unknown) => void;
  readonly onChangePhoto: (value: unknown) => void;
}

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
jest.mock('~/ds-components/text-field/TextField');
jest.mock('~/components/grip/Grip');

jest.mock('~/components/configurable-list/ConfigurableList');
jest.mock('~/components/contributor-card/ContributorCard', () => ({
  __esModule: true,
  ContributorCard: ({ contributor, currentLocale, onChangeName, onChangeDescription, onChangePhoto }: MockContributorCardProps) => (
    <div data-testid={`contributor-card-${contributor.id}`}>
      <span data-testid={`contributor-name-json-${contributor.id}`}>
        {JSON.stringify(contributor.name[currentLocale])}
      </span>
      <button
        data-testid={`trigger-member-name-change-${contributor.id}`}
        onClick={() => onChangeName(createDocNode('Updated Member Name'))}
      >
        Change Name
      </button>
      <button
        data-testid={`trigger-member-desc-change-${contributor.id}`}
        onClick={() => onChangeDescription(createDocNode('Updated Member Description'))}
      >
        Change Description
      </button>
      <button
        data-testid={`trigger-member-photo-change-${contributor.id}`}
        onClick={() => onChangePhoto({ src: 'new-photo.jpg', alt: {}, caption: {}, generatedSrc: '' })}
      >
        Change Photo
      </button>
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

  it('should call toggleBlockVisibility with pageId and blockId when the visibility toggle is clicked', () => {
    runSimulation(defaultMockBlock, 'collapsible-block-toggle-visibility');

    expect(toggleBlockVisibilityMock).toHaveBeenCalledWith(PAGE_IDS.ABOUT_US, BLOCK_IDS.FOUNDATION_FOUNDERS);
  });

  it.each([
    ['titleText', 'Вступний текст секції', 'titleText'],
    ['listTitle', 'Заголовок секції', 'listTitle']
  ])('should mark %s as invalid after blur when it is empty, and clear the flag on unmount', (_label, fieldLabel, blockField) => {
    const emptyBlock = { ...defaultMockBlock, [blockField]: { uk: { type: 'doc', content: [] } } };
    usePageBlockMock.mockReturnValue({ block: emptyBlock });

    const { unmount } = render(<FoundationFounders />);

    fireEvent.click(screen.getByTestId(`trigger-blur-${fieldLabel}`));

    expect(screen.getByTestId(`textfield-error-${fieldLabel}`)).toBeInTheDocument();
    expect(setFieldValidityMock).toHaveBeenCalledWith(
      `${PAGE_IDS.ABOUT_US}:${BLOCK_IDS.FOUNDATION_FOUNDERS}:${blockField}`,
      true
    );

    unmount();

    expect(setFieldValidityMock).toHaveBeenCalledWith(
      `${PAGE_IDS.ABOUT_US}:${BLOCK_IDS.FOUNDATION_FOUNDERS}:${blockField}`,
      false
    );
  });

  it('should update member name, description, and photo via ContributorCard callbacks', () => {
    usePageBlockMock.mockReturnValue({ block: populatedMockBlock });
    render(<FoundationFounders />);

    fireEvent.click(screen.getByTestId(`trigger-member-name-change-${TARGET_MEMBER_ID}`));
    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.FOUNDATION_FOUNDERS,
      'members',
      expect.arrayContaining([
        expect.objectContaining({
          id: TARGET_MEMBER_ID,
          name: expect.objectContaining({ uk: createDocNode('Updated Member Name') })
        })
      ])
    );

    fireEvent.click(screen.getByTestId(`trigger-member-desc-change-${TARGET_MEMBER_ID}`));
    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.FOUNDATION_FOUNDERS,
      'members',
      expect.arrayContaining([
        expect.objectContaining({
          id: TARGET_MEMBER_ID,
          description: expect.objectContaining({ uk: createDocNode('Updated Member Description') })
        })
      ])
    );

    fireEvent.click(screen.getByTestId(`trigger-member-photo-change-${TARGET_MEMBER_ID}`));
    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.FOUNDATION_FOUNDERS,
      'members',
      expect.arrayContaining([
        expect.objectContaining({
          id: TARGET_MEMBER_ID,
          photo: expect.objectContaining({ src: 'new-photo.jpg' })
        })
      ])
    );
  });

  it('should leave unrelated members untouched when updating a single member in a multi-member list', () => {
    const otherMember = {
      id: 'other-member-id',
      name: { uk: mockMemberNameJson, en: {} },
      description: { uk: {}, en: {} },
      photo: { src: '', alt: {}, caption: {}, generatedSrc: '' }
    };
    const multiMemberBlock = {
      ...defaultMockBlock,
      members: [populatedMockBlock.members[0], otherMember] as TeamMemberWithId[]
    };
    usePageBlockMock.mockReturnValue({ block: multiMemberBlock });

    render(<FoundationFounders />);
    fireEvent.click(screen.getByTestId(`trigger-member-name-change-${TARGET_MEMBER_ID}`));

    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.FOUNDATION_FOUNDERS,
      'members',
      [
        expect.objectContaining({
          id: TARGET_MEMBER_ID,
          name: expect.objectContaining({ uk: createDocNode('Updated Member Name') })
        }),
        otherMember
      ]
    );
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
