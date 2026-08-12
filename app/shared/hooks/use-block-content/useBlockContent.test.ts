import { act, renderHook } from '@testing-library/react';

import { type BlockContentAdapter, useBlockContent } from './useBlockContent';
import { createDocNode } from '~/__mocks__/utils';
import { useStore } from '~/store';
import {
  CONTENT_TYPE,
  type ContentItem,
  type ParagraphContentItem,
  type SectionListEntry
} from '~/types/blocks/contentTypes';
import type { LocalizedJSON } from '~/types/common';

jest.mock('~/store');

const useStoreMock = useStore as unknown as jest.Mock;

const PAGE_ID = 'about-us';
const BLOCK_ID = 'our-goals';

const mockSetField = jest.fn();
const mockSetFields = jest.fn();
const mockToggleBlockVisibility = jest.fn();

const emptyLocalizedJSON = {
  uk: { type: 'doc', content: [] },
  en: { type: 'doc', content: [] }
};

const paragraphItem: ContentItem = {
  id: 'paragraph-1',
  type: CONTENT_TYPE.PARAGRAPH,
  value: { uk: createDocNode('Paragraph'), en: createDocNode('Paragraph EN') }
};

type MockBlock = {
  hidden?: boolean;
  content?: ContentItem[];
  title?: LocalizedJSON;
  goals?: SectionListEntry[];
};

type MockState = {
  blocks: Record<string, Record<string, MockBlock>>;
  setField: typeof mockSetField;
  setFields: typeof mockSetFields;
  toggleBlockVisibility: typeof mockToggleBlockVisibility;
};

const createMockState = (block?: MockBlock): MockState => ({
  blocks: block ? { [PAGE_ID]: { [BLOCK_ID]: block } } : {},
  setField: mockSetField,
  setFields: mockSetFields,
  toggleBlockVisibility: mockToggleBlockVisibility
});

const mockAdapter: BlockContentAdapter<MockBlock> = {
  toContent: (block) => [
    {
      id: 'title',
      type: CONTENT_TYPE.HEADER,
      title: block.title ?? { uk: emptyLocalizedJSON.uk, en: emptyLocalizedJSON.en }
    },
    {
      id: 'goals',
      type: CONTENT_TYPE.SECTION_LIST,
      items: block.goals ?? []
    }
  ],
  fromContent: (content) => ({
    title: (content.find((item) => item.id === 'title') as Extract<ContentItem, { type: 'header' }>)?.title,
    goals: (content.find((item) => item.id === 'goals') as Extract<ContentItem, { type: 'section-list' }>)?.items
  })
};

let originalCrypto: Crypto | undefined;

beforeAll(() => {
  originalCrypto = globalThis.crypto;

  Object.defineProperty(globalThis, 'crypto', {
    value: {
      ...originalCrypto,
      randomUUID: jest.fn().mockReturnValue('generated-id')
    },
    configurable: true
  });
});

afterAll(() => {
  if (originalCrypto) {
    Object.defineProperty(globalThis, 'crypto', {
      value: originalCrypto,
      configurable: true
    });
  } else {
    delete (globalThis as { crypto?: Crypto }).crypto;
  }
});

describe('useBlockContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useStoreMock.mockImplementation((selector: (state: MockState) => unknown) =>
      selector(createMockState({ content: [paragraphItem], hidden: false }))
    );
  });

  describe('without adapter', () => {
    it('should return isLoaded false when block is undefined', () => {
      useStoreMock.mockImplementation((selector: (state: MockState) => unknown) => selector(createMockState()));

      const { result } = renderHook(() => useBlockContent(PAGE_ID, BLOCK_ID));

      expect(result.current.isLoaded).toBe(false);
      expect(result.current.block).toBeUndefined();
      expect(result.current.content).toEqual([]);
    });

    it('should return block content from store', () => {
      const { result } = renderHook(() => useBlockContent(PAGE_ID, BLOCK_ID));

      expect(result.current.isLoaded).toBe(true);
      expect(result.current.content).toEqual([paragraphItem]);
      expect(result.current.hidden).toBe(false);
    });

    it('should assign ids to content items missing them', () => {
      const paragraphWithoutId = {
        type: CONTENT_TYPE.PARAGRAPH,
        value: emptyLocalizedJSON
      } satisfies Omit<ParagraphContentItem, 'id'>;

      useStoreMock.mockImplementation((selector: (state: MockState) => unknown) =>
        selector(
          createMockState({
            content: [paragraphWithoutId as unknown as ContentItem]
          })
        )
      );

      const { result } = renderHook(() => useBlockContent(PAGE_ID, BLOCK_ID));

      expect(result.current.content[0].id).toBe('generated-id');
    });

    it('should call setField when updateItem is invoked', () => {
      const { result } = renderHook(() => useBlockContent(PAGE_ID, BLOCK_ID));
      const updatedItem: ContentItem = {
        ...paragraphItem,
        value: { uk: createDocNode('Updated'), en: createDocNode('Updated EN') }
      };

      act(() => {
        result.current.updateItem('paragraph-1', updatedItem);
      });

      expect(mockSetField).toHaveBeenCalledWith(PAGE_ID, BLOCK_ID, 'content', [updatedItem]);
      expect(mockSetFields).not.toHaveBeenCalled();
    });

    it('should call setField when addItem is invoked', () => {
      const { result } = renderHook(() => useBlockContent(PAGE_ID, BLOCK_ID));

      act(() => {
        result.current.addItem(CONTENT_TYPE.PARAGRAPH);
      });

      expect(mockSetField).toHaveBeenCalledWith(PAGE_ID, BLOCK_ID, 'content', [
        paragraphItem,
        {
          id: 'generated-id',
          type: CONTENT_TYPE.PARAGRAPH,
          value: emptyLocalizedJSON
        }
      ]);
    });

    it('should call setField when removeItem is invoked', () => {
      const { result } = renderHook(() => useBlockContent(PAGE_ID, BLOCK_ID));

      act(() => {
        result.current.removeItem('paragraph-1');
      });

      expect(mockSetField).toHaveBeenCalledWith(PAGE_ID, BLOCK_ID, 'content', []);
    });

    it('should call setField when reorderItems is invoked', () => {
      const secondItem: ContentItem = {
        id: 'paragraph-2',
        type: CONTENT_TYPE.PARAGRAPH,
        value: { uk: createDocNode('Second'), en: createDocNode('Second EN') }
      };

      useStoreMock.mockImplementation((selector: (state: MockState) => unknown) =>
        selector(createMockState({ content: [paragraphItem, secondItem] }))
      );

      const { result } = renderHook(() => useBlockContent(PAGE_ID, BLOCK_ID));

      act(() => {
        result.current.reorderItems([secondItem, paragraphItem]);
      });

      expect(mockSetField).toHaveBeenCalledWith(PAGE_ID, BLOCK_ID, 'content', [secondItem, paragraphItem]);
    });

    it('should call toggleBlockVisibility when toggleVisibility is invoked', () => {
      const { result } = renderHook(() => useBlockContent(PAGE_ID, BLOCK_ID));

      act(() => {
        result.current.toggleVisibility();
      });

      expect(mockToggleBlockVisibility).toHaveBeenCalledWith(PAGE_ID, BLOCK_ID);
    });
  });

  describe('with adapter', () => {
    beforeEach(() => {
      useStoreMock.mockImplementation((selector: (state: MockState) => unknown) =>
        selector(
          createMockState({
            title: { uk: createDocNode('Goals'), en: createDocNode('Goals EN') },
            goals: [
              {
                id: 'goal-1',
                title: { uk: createDocNode('Goal'), en: createDocNode('Goal EN') },
                description: { uk: emptyLocalizedJSON.uk, en: emptyLocalizedJSON.en }
              }
            ]
          })
        )
      );
    });

    it('should derive content via adapter.toContent', () => {
      const { result } = renderHook(() => useBlockContent(PAGE_ID, BLOCK_ID, mockAdapter));

      expect(result.current.content).toEqual([
        {
          id: 'title',
          type: CONTENT_TYPE.HEADER,
          title: { uk: createDocNode('Goals'), en: createDocNode('Goals EN') }
        },
        {
          id: 'goals',
          type: CONTENT_TYPE.SECTION_LIST,
          items: [
            {
              id: 'goal-1',
              title: { uk: createDocNode('Goal'), en: createDocNode('Goal EN') },
              description: { uk: emptyLocalizedJSON.uk, en: emptyLocalizedJSON.en }
            }
          ]
        }
      ]);
    });

    it('should call setFields when updateItem is invoked', () => {
      const { result } = renderHook(() => useBlockContent(PAGE_ID, BLOCK_ID, mockAdapter));
      const updatedHeader: ContentItem = {
        id: 'title',
        type: CONTENT_TYPE.HEADER,
        title: { uk: createDocNode('Updated goals'), en: createDocNode('Updated goals EN') },
        helper: { uk: emptyLocalizedJSON.uk, en: emptyLocalizedJSON.en }
      };

      act(() => {
        result.current.updateItem('title', updatedHeader);
      });

      expect(mockSetFields).toHaveBeenCalledWith(PAGE_ID, BLOCK_ID, {
        title: updatedHeader.title,
        goals:
          result.current.content.find((item) => item.id === 'goals')?.type === CONTENT_TYPE.SECTION_LIST
            ? (
                result.current.content.find((item) => item.id === 'goals') as Extract<
                  ContentItem,
                  { type: 'section-list' }
                >
            ).items
            : []
      });
      expect(mockSetField).not.toHaveBeenCalled();
    });

    it('should call setFields when addItem is invoked', () => {
      const block = {
        title: { uk: createDocNode('Goals'), en: createDocNode('Goals EN') },
        goals: [
          {
            id: 'goal-1',
            title: { uk: createDocNode('Goal'), en: createDocNode('Goal EN') },
            description: { uk: emptyLocalizedJSON.uk, en: emptyLocalizedJSON.en }
          }
        ]
      };

      const { result } = renderHook(() => useBlockContent(PAGE_ID, BLOCK_ID, mockAdapter));
      const nextContent = [
        ...result.current.content,
        {
          id: 'generated-id',
          type: CONTENT_TYPE.PARAGRAPH,
          value: emptyLocalizedJSON
        }
      ] as ContentItem[];

      act(() => {
        result.current.addItem(CONTENT_TYPE.PARAGRAPH);
      });

      expect(mockSetFields).toHaveBeenCalledWith(PAGE_ID, BLOCK_ID, mockAdapter.fromContent(nextContent, block));
    });

    it('should call setFields when removeItem is invoked', () => {
      const { result } = renderHook(() => useBlockContent(PAGE_ID, BLOCK_ID, mockAdapter));

      act(() => {
        result.current.removeItem('goals');
      });

      expect(mockSetFields).toHaveBeenCalledWith(PAGE_ID, BLOCK_ID, {
        title: (result.current.content.find((item) => item.id === 'title') as Extract<ContentItem, { type: 'header' }>)
          .title,
        goals: undefined
      });
    });
  });
});
