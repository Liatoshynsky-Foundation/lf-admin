import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import { Block } from './Block';
import { createDocNode } from '~/__mocks__/utils';
import { sandboxBlockConfig } from '~/constants/blockSchemas';
import { useBlockContent } from '~/shared/hooks/use-block-content/useBlockContent';
import { useStore } from '~/store';
import type { BlockConfig } from '~/types/blocks/blockConfig';
import { CONTENT_TYPE, type ContentItem } from '~/types/blocks/contentTypes';

jest.mock('~/shared/hooks/use-block-content/useBlockContent');
jest.mock('~/store');
jest.mock('~/ds-components/collapsible-block/CollapsibleBlock');
jest.mock('~/shared/components/sortable-list/SortableList');
jest.mock('~/shared/components/edit-block-skeleton/EditBlockSkeleton', () => ({
  EditBlockSkeleton: () => <div data-testid="edit-block-skeleton">Loading</div>
}));
jest.mock('~/shared/components/sortable-item-wrapper/SortableItemWrapper', () => ({
  SortableItemWrapper: ({ children, id }: { children: React.ReactNode; id: string }) => (
    <div data-testid={`sortable-item-${id}`}>{children}</div>
  )
}));
jest.mock('~/public/icons/plus.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="plus-icon" />
}));

jest.mock('./content-types/registry', () => ({
  CONTENT_TYPE_REGISTRY: {
    header: ({ item }: { item: ContentItem }) => <div data-testid={`renderer-${item.type}`}>{item.id}</div>,
    paragraph: ({ item }: { item: ContentItem }) => <div data-testid={`renderer-${item.type}`}>{item.id}</div>,
    list: ({ item }: { item: ContentItem }) => <div data-testid={`renderer-${item.type}`}>{item.id}</div>
  }
}));

const mockUseBlockContent = useBlockContent as jest.Mock;
const mockUseStore = useStore as unknown as jest.Mock;

const PAGE_ID = 'about-us';
const BLOCK_ID = 'mission';

const mockUpdateItem = jest.fn();
const mockAddItem = jest.fn();
const mockRemoveItem = jest.fn();
const mockReorderItems = jest.fn();
const mockToggleVisibility = jest.fn();

const headerItem: ContentItem = {
  id: 'header-1',
  type: CONTENT_TYPE.HEADER,
  title: { uk: createDocNode('Custom header'), en: createDocNode('Custom header EN') },
  helper: { uk: createDocNode(''), en: createDocNode('') }
};

const paragraphItem: ContentItem = {
  id: 'paragraph-1',
  type: CONTENT_TYPE.PARAGRAPH,
  value: { uk: createDocNode('Paragraph text'), en: createDocNode('Paragraph text EN') }
};

const listItem: ContentItem = {
  id: 'list-1',
  type: CONTENT_TYPE.LIST,
  items: [{ id: 'list-point-1', uk: createDocNode('Point'), en: createDocNode('Point EN') }]
};

const setupHook = (overrides: Partial<ReturnType<typeof useBlockContent>> = {}) => {
  mockUseBlockContent.mockReturnValue({
    isLoaded: true,
    content: [headerItem, paragraphItem],
    hidden: false,
    updateItem: mockUpdateItem,
    addItem: mockAddItem,
    removeItem: mockRemoveItem,
    reorderItems: mockReorderItems,
    toggleVisibility: mockToggleVisibility,
    ...overrides
  });
};

const renderBlock = (config: BlockConfig = sandboxBlockConfig, title = 'Fallback title') =>
  render(<Block pageId={PAGE_ID} blockId={BLOCK_ID} config={config} title={title} />);

describe('Block', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseStore.mockImplementation((selector: (state: { locale: 'uk' | 'en' }) => unknown) =>
      selector({ locale: 'uk' })
    );
    setupHook();
  });

  it('should render skeleton when block is not loaded', () => {
    setupHook({ isLoaded: false });

    renderBlock();

    expect(screen.getByTestId('edit-block-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('collapsible-block')).not.toBeInTheDocument();
  });

  it('should render collapsible block with header title from content', () => {
    renderBlock();

    expect(screen.getByTestId('collapsible-block')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Custom header');
  });

  it('should use fallback title when header content is empty', () => {
    setupHook({
      content: [
        {
          ...headerItem,
          title: { uk: createDocNode(''), en: createDocNode('') }
        }
      ]
    });

    renderBlock(sandboxBlockConfig, 'Fallback title');

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Fallback title');
  });

  it('should render content items via registry', () => {
    renderBlock();

    expect(screen.getByTestId('renderer-header')).toHaveTextContent('header-1');
    expect(screen.getByTestId('renderer-paragraph')).toHaveTextContent('paragraph-1');
    expect(screen.getByTestId('sortable-item-header-1')).toBeInTheDocument();
    expect(screen.getByTestId('sortable-item-paragraph-1')).toBeInTheDocument();
  });

  it('should not render remove button for required content slots', () => {
    setupHook({ content: [headerItem] });

    renderBlock();

    expect(screen.queryByRole('button', { name: 'Видалити' })).not.toBeInTheDocument();
  });

  it('should render remove button for non-required content slots', () => {
    setupHook({ content: [paragraphItem, listItem] });

    renderBlock();

    expect(screen.getAllByRole('button', { name: 'Видалити' })).toHaveLength(2);
  });

  it('should call removeItem when delete button is clicked', () => {
    setupHook({ content: [paragraphItem] });

    renderBlock();

    fireEvent.click(screen.getByRole('button', { name: 'Видалити' }));

    expect(mockRemoveItem).toHaveBeenCalledWith('paragraph-1');
  });

  it('should render add buttons for repeatable slots', () => {
    renderBlock();

    expect(screen.getByRole('button', { name: 'Додати абзац' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Додати список' })).toBeInTheDocument();
  });

  it('should call addItem with content type when add button is clicked', () => {
    renderBlock();

    fireEvent.click(screen.getByRole('button', { name: 'Додати абзац' }));

    expect(mockAddItem).toHaveBeenCalledWith(CONTENT_TYPE.PARAGRAPH);
  });

  it('should call toggleVisibility when visibility toggle is clicked', () => {
    renderBlock();

    fireEvent.click(screen.getByTestId('collapsible-block-toggle-visibility'));

    expect(mockToggleVisibility).toHaveBeenCalledTimes(1);
  });

  it('should pass hidden state to collapsible block', () => {
    setupHook({ hidden: true });

    renderBlock();

    expect(screen.getByTestId('collapsible-block')).toHaveAttribute('data-hidden', 'true');
  });

  it('should not render sortable list when content is empty', () => {
    setupHook({ content: [] });

    renderBlock();

    expect(screen.queryByTestId('mock-sortable-list')).not.toBeInTheDocument();
  });
});
