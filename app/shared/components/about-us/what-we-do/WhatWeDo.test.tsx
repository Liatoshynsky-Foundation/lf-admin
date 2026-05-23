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
      <div data-testid="section-title-json">{JSON.stringify(title)}</div>
      <button
        data-testid="trigger-section-title-change"
        onClick={() => {
          const updatedJson: JSONContent = {
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated Section Title' }] }]
          };
          onTitleChange(updatedJson);
        }}
      >
        Change Section Title
      </button>

      {items.map((item) => (
        <div key={item.id} data-testid={`item-container-${item.id}`}>
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
  crypto.randomUUID = jest.fn(() => 'uuid-generated-token') as typeof crypto.randomUUID;
});

const mockBlockTitleJson: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'What We Do Section Title' }] }]
};

const mockItemTitleJson: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Activity Item Title' }] }]
};

const mockItemDescJson: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Activity Item Description' }] }]
};

const mockBlock = {
  title: { uk: mockBlockTitleJson },
  items: [
    {
      id: 'mock-item-id-1',
      title: { uk: mockItemTitleJson, en: {} },
      description: { uk: mockItemDescJson, en: { type: 'doc', content: [] } }
    }
  ] as WhatWeDolItemWithId[]
};

describe('WhatWeDo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePageBlockMock.mockReturnValue({ block: mockBlock });
  });

  it('should render skeleton when block data is unpopulated or missing', () => {
    usePageBlockMock.mockReturnValueOnce({ block: null });
    
    const { container } = render(<WhatWeDo />);
    expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });

  it('should mount structural parent envelopes and read accurate raw structural text values out of the inner mock DOM', () => {
    render(<WhatWeDo />);

    expect(screen.getByTestId('collapsible-block')).toBeInTheDocument();
    expect(screen.getByTestId('editable-section-list')).toHaveAttribute('data-label', 'Пункти секції:');
    
    expect(screen.getByTestId('section-title-json')).toHaveTextContent(JSON.stringify(mockBlockTitleJson));
    expect(screen.getByTestId('item-title-mock-item-id-1')).toHaveTextContent(JSON.stringify(mockItemTitleJson));
    expect(screen.getByTestId('item-desc-mock-item-id-1')).toHaveTextContent(JSON.stringify(mockItemDescJson));
  });

  it('should call setField with a formatted rich text payload when the parent section title updates', () => {
    render(<WhatWeDo />);

    fireEvent.click(screen.getByTestId('trigger-section-title-change'));

    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.WHAT_WE_DO,
      'title',
      expect.objectContaining({
        uk: {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated Section Title' }] }]
        }
      })
    );
  });

  it('should successfully pass deep nested rich text item titles through the condition array list mapper loops', () => {
    render(<WhatWeDo />);

    fireEvent.click(screen.getByTestId('trigger-item-title-change-mock-item-id-1'));

    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.WHAT_WE_DO,
      'items',
      expect.arrayContaining([
        expect.objectContaining({
          id: 'mock-item-id-1',
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

  it('should successfully pass deep nested rich text item descriptions through the condition array list mapper loops', () => {
    render(<WhatWeDo />);

    fireEvent.click(screen.getByTestId('trigger-item-desc-change-mock-item-id-1'));

    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.WHAT_WE_DO,
      'items',
      expect.arrayContaining([
        expect.objectContaining({
          id: 'mock-item-id-1',
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

  it('should append a newly initialized localized object block structure when the action request triggers', () => {
    render(<WhatWeDo />);

    fireEvent.click(screen.getByTestId('trigger-item-create'));

    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.WHAT_WE_DO,
      'items',
      expect.arrayContaining([
        expect.objectContaining({ id: 'mock-item-id-1' }),
        expect.objectContaining({
          id: 'uuid-generated-token',
          title: { uk: {}, en: {} },
          description: {
            uk: { type: 'doc', content: [] },
            en: { type: 'doc', content: [] }
          }
        })
      ])
    );
  });

  it('should cleanly drop specified data entries out of the child parameters map when deletion paths fire', () => {
    render(<WhatWeDo />);

    fireEvent.click(screen.getByTestId('trigger-item-delete-mock-item-id-1'));

    expect(setFieldMock).toHaveBeenCalledWith(PAGE_IDS.ABOUT_US, BLOCK_IDS.WHAT_WE_DO, 'items', []);
  });
});
