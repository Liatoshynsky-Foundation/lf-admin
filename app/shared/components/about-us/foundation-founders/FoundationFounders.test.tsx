import { fireEvent, render, screen } from '@testing-library/react';
import { JSONContent } from '@tiptap/react';
import React from 'react';

import { FoundationFounders } from './FoundationFounders';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { TeamMemberWithId } from '~/types/store/pages/about-us/blocks/foundationFounderBlock';

interface MockCustomTextFieldProps {
  readonly title: string;
  readonly value: JSONContent;
  readonly onChange: (value: JSONContent) => void;
}

interface MockConfigurableListProps<T> {
  readonly items: readonly T[];
  readonly addBtnLabel: string;
  readonly onCreate: () => void;
  readonly renderItem: (props: { readonly item: T }) => React.ReactNode;
  readonly editable: boolean;
  readonly onDelete: (id: string) => void;
}

interface MockContributorCardProps {
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

jest.mock('~/ds-components/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ children, title }: { readonly children: React.ReactNode; readonly title: string }) => (
    <section data-testid="collapsible">
      <h2>{title}</h2>
      {children}
    </section>
  )
}));

jest.mock('~/ds-components/text-field/TextField', () => ({
  __esModule: true,
  CustomTextField: ({ title, value, onChange }: MockCustomTextFieldProps) => (
    <div data-testid={`textfield-wrapper-${title}`}>
      <span data-testid={`textfield-json-${title}`}>{JSON.stringify(value)}</span>
      <button
        data-testid={`trigger-change-${title}`}
        onClick={() => {
          const updatedJson: JSONContent = {
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: `Updated ${title}` }] }]
          };
          onChange(updatedJson);
        }}
      >
        Change {title}
      </button>
    </div>
  )
}));

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

beforeAll(() => {
  globalThis.crypto.randomUUID = jest.fn(() => 'test-id') as unknown as typeof crypto.randomUUID;
});

const mockIntroJson: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Вступ' }] }]
};

const mockListTitleJson: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Список' }] }]
};

const mockMemberNameJson: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Тест' }] }]
};

const defaultMockBlock = {
  titleText: { uk: mockIntroJson, en: { type: 'doc', content: [] } },
  listTitle: { uk: mockListTitleJson, en: { type: 'doc', content: [] } },
  members: [] as TeamMemberWithId[]
};

describe('FoundationFounders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render skeleton when no block exists', () => {
    usePageBlockMock.mockReturnValue({ block: null });
    
    const { container } = render(<FoundationFounders />);
    expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });

  it('should verify initial layout textfield rich text payloads match serialization expectations', () => {
    usePageBlockMock.mockReturnValue({ block: defaultMockBlock });
    render(<FoundationFounders />);

    expect(screen.getByTestId('textfield-json-Вступний текст секції')).toHaveTextContent(JSON.stringify(mockIntroJson));
    expect(screen.getByTestId('textfield-json-Заголовок секції')).toHaveTextContent(JSON.stringify(mockListTitleJson));
  });

  it('should update intro section title text values with structured rich text schemas when modified', () => {
    usePageBlockMock.mockReturnValue({ block: defaultMockBlock });
    render(<FoundationFounders />);

    fireEvent.click(screen.getByTestId('trigger-change-Вступний текст секції'));

    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.FOUNDATION_FOUNDERS,
      'titleText',
      expect.objectContaining({
        uk: {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated Вступний текст секції' }] }]
        }
      })
    );
  });

  it('should update list structural headers with structured rich text schemas when modified', () => {
    usePageBlockMock.mockReturnValue({ block: defaultMockBlock });
    render(<FoundationFounders />);

    fireEvent.click(screen.getByTestId('trigger-change-Заголовок секції'));

    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.FOUNDATION_FOUNDERS,
      'listTitle',
      expect.objectContaining({
        uk: {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated Заголовок секції' }] }]
        }
      })
    );
  });

  it('should append a clean, empty localized item layout to members arrays upon add click interactions', () => {
    usePageBlockMock.mockReturnValue({ block: defaultMockBlock });
    render(<FoundationFounders />);

    fireEvent.click(screen.getByTestId('add-btn'));

    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.FOUNDATION_FOUNDERS,
      'members',
      expect.arrayContaining([
        expect.objectContaining({
          id: 'test-id',
          name: { uk: {}, en: {} },
          description: { uk: {}, en: {} },
          photo: expect.objectContaining({ src: '' })
        })
      ])
    );
  });

  it('should cleanly remove targeted items out of the list matrix when delete buttons are pushed', () => {
    usePageBlockMock.mockReturnValue({
      block: {
        ...defaultMockBlock,
        members: [
          {
            id: 'target-member-1',
            name: { uk: mockMemberNameJson, en: {} },
            description: { uk: {}, en: {} },
            photo: { src: '', alt: {}, caption: {}, generatedSrc: '' }
          }
        ] as TeamMemberWithId[]
      }
    });

    render(<FoundationFounders />);
    
    expect(screen.getByTestId('contributor-name-json-target-member-1')).toHaveTextContent(
      JSON.stringify(mockMemberNameJson)
    );

    fireEvent.click(screen.getByTestId('delete-target-member-1'));

    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.FOUNDATION_FOUNDERS,
      'members',
      []
    );
  });
});
