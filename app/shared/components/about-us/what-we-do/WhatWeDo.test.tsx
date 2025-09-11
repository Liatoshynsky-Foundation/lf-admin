import { fireEvent, render, screen } from '@testing-library/react';

import WhatWeDo from './WhatWeDo';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';

const setFieldMock = jest.fn();

type StoreState = { locale: 'uk'; setField: typeof setFieldMock };
jest.mock('~/store', () => ({
  useStore: (selector: (state: StoreState) => unknown) => selector({ locale: 'uk', setField: setFieldMock })
}));

const usePageBlockMock = jest.fn();
jest.mock('~/shared/hooks/use-page-block/usePageBlock', () => ({
  usePageBlock: (...args: unknown[]) => usePageBlockMock(...args)
}));

jest.mock('@mui/material/Skeleton', () => ({
  __esModule: true,
  default: (props: { [key: string]: unknown }) => <span role="progressbar" {...props} />
}));

jest.mock('~/components/accordion-blocks/bullet-points-section/EditableSectionList', () => ({
  EditableSectionList: ({
    title,
    onTitleChange,
    items,
    onCreateItem,
    onDeleteItem,
    onChangeItem,
    sectionLabel
  }: {
    title: string;
    onTitleChange: (val: string) => void;
    items: { id: string; title: string; description: string }[];
    onCreateItem: () => { id: string; title: string; description: string };
    onDeleteItem: (id: string) => void;
    onChangeItem: (id: string, field: 'title' | 'description', val: string) => void;
    sectionLabel: string;
  }) => (
    <div data-testid="editable-list">
      <input data-testid="input-section-title" value={title} onChange={(e) => onTitleChange(e.target.value)} />
      {items.map((it) => (
        <div key={it.id} data-testid={`item-${it.id}`}>
          <input
            data-testid={`input-item-title-${it.id}`}
            value={it.title}
            onChange={(e) => onChangeItem(it.id, 'title', e.target.value)}
          />
          <input
            data-testid={`input-item-desc-${it.id}`}
            value={it.description}
            onChange={(e) => onChangeItem(it.id, 'description', e.target.value)}
          />
          <button data-testid={`delete-${it.id}`} onClick={() => onDeleteItem(it.id)}>
            Delete
          </button>
        </div>
      ))}
      <button data-testid="add-btn" onClick={() => onCreateItem()}>
        Add
      </button>
      <span>{sectionLabel}</span>
    </div>
  )
}));

jest.mock('~/components/design-system/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section data-testid="collapsible-block">
      <h2>{title}</h2>
      {children}
    </section>
  )
}));

beforeAll(() => {
  Object.defineProperty(global, 'crypto', {
    value: { randomUUID: () => 'unique-id' },
    writable: true
  });
});

const mockBlock = {
  title: { uk: 'Initial title', en: 'Initial title en' },
  items: [
    {
      id: '1',
      title: { uk: 'Пункт 1', en: 'Item 1' },
      description: { uk: 'Опис 1', en: 'Desc 1' }
    }
  ]
};

describe('WhatWeDo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render skeleton when block is not available', () => {
    usePageBlockMock.mockReturnValue({ block: null });
    render(<WhatWeDo />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render EditableSectionList inside CollapsibleBlock', () => {
    usePageBlockMock.mockReturnValue({ block: mockBlock });
    render(<WhatWeDo />);
    expect(screen.getByTestId('collapsible-block')).toBeInTheDocument();
    expect(screen.getByTestId('editable-list')).toBeInTheDocument();
  });

  it('should pass correct sectionLabel to EditableSectionList', () => {
    usePageBlockMock.mockReturnValue({ block: mockBlock });
    render(<WhatWeDo />);
    expect(screen.getByText('Пункти секції:')).toBeInTheDocument();
  });

  it('should update section title', () => {
    usePageBlockMock.mockReturnValue({ block: mockBlock });
    render(<WhatWeDo />);
    fireEvent.change(screen.getByTestId('input-section-title'), {
      target: { value: 'New Section Title' }
    });
    expect(setFieldMock).toHaveBeenCalledWith(PAGE_IDS.ABOUT_US, BLOCK_IDS.WHAT_WE_DO, 'title', {
      uk: 'New Section Title',
      en: 'Initial title en'
    });
  });

  it('should update item title and description', () => {
    usePageBlockMock.mockReturnValue({ block: mockBlock });
    render(<WhatWeDo />);
    fireEvent.change(screen.getByTestId('input-item-title-1'), { target: { value: 'Updated item' } });
    fireEvent.change(screen.getByTestId('input-item-desc-1'), { target: { value: 'Updated desc' } });
    expect(setFieldMock).toHaveBeenCalledWith(PAGE_IDS.ABOUT_US, BLOCK_IDS.WHAT_WE_DO, 'items', expect.any(Array));
  });

  it('should delete item', () => {
    usePageBlockMock.mockReturnValue({ block: mockBlock });
    render(<WhatWeDo />);
    fireEvent.click(screen.getByTestId('delete-1'));
    expect(setFieldMock).toHaveBeenCalledWith(PAGE_IDS.ABOUT_US, BLOCK_IDS.WHAT_WE_DO, 'items', expect.any(Array));
  });

  it('should create new item', () => {
    usePageBlockMock.mockReturnValue({ block: mockBlock });
    render(<WhatWeDo />);
    fireEvent.click(screen.getByTestId('add-btn'));
    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.WHAT_WE_DO,
      'items',
      expect.arrayContaining([expect.objectContaining({ id: 'unique-id' })])
    );
  });

  it('should handle empty items list', () => {
    const emptyBlock = { ...mockBlock, items: [] };
    usePageBlockMock.mockReturnValue({ block: emptyBlock });
    render(<WhatWeDo />);
    expect(screen.getByTestId('editable-list')).toBeInTheDocument();
    expect(screen.queryByTestId('input-item-title-1')).not.toBeInTheDocument();
  });
});
