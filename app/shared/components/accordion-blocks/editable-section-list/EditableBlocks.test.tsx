import { fireEvent, render, screen } from '@testing-library/react';

import OurGoals from '../../about-us/our-goals/OurGoals';
import WhatWeDo from '../../about-us/what-we-do/WhatWeDo';
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

jest.mock('~/components/accordion-blocks/editable-section-list/EditableSectionList', () => ({
  EditableSectionList: ({
    title,
    onTitleChange,
    sectionLabel,
    dataKey = 'items',
    items = [],
    goals = [],
    onCreateItem,
    onDeleteItem,
    onChangeItem
  }: {
    title: string;
    onTitleChange: (val: string) => void;
    sectionLabel: string;
    dataKey?: 'items' | 'goals';
    items?: {
      id: string;
      title: {
        uk: string;
        en: string;
      };
      description: {
        uk: string;
        en: string;
      };
    }[];
    goals?: {
      id: string;
      title: {
        uk: string;
        en: string;
      };
      description: {
        uk: string;
        en: string;
      };
    }[];
    onCreateItem: () => { id: string; title: string; description: string };
    onDeleteItem: (id: string) => void;
    onChangeItem: (id: string, field: 'title' | 'description', val: string) => void;
  }) => {
    const list = dataKey === 'items' ? items : goals;
    return (
      <div data-testid="editable-list">
        <input data-testid="input-section-title" value={title} onChange={(e) => onTitleChange(e.target.value)} />
        {list.map(
          (it: {
            id: string;
            title: {
              uk: string;
              en: string;
            };
            description: {
              uk: string;
              en: string;
            };
          }) => (
            <div key={it.id} data-testid={`${dataKey === 'items' ? 'item' : 'goal'}-${it.id}`}>
              <input
                data-testid={`input-${dataKey === 'items' ? 'item' : 'goal'}-title-${it.id}`}
                value={it.title.uk}
                onChange={(e) => onChangeItem(it.id, 'title', e.target.value)}
              />
              <input
                data-testid={`input-${dataKey === 'items' ? 'item' : 'goal'}-desc-${it.id}`}
                value={it.description.uk}
                onChange={(e) => onChangeItem(it.id, 'description', e.target.value)}
              />
              <button data-testid={`delete-${it.id}`} onClick={() => onDeleteItem(it.id)}>
                Delete
              </button>
            </div>
          )
        )}
        <button data-testid="add-btn" onClick={() => onCreateItem()}>
          Add
        </button>
        <span>{sectionLabel}</span>
      </div>
    );
  }
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

const whatWeDoBlock = {
  title: { uk: 'Initial title', en: 'Initial title en' },
  items: [{ id: '1', title: { uk: 'Пункт 1', en: 'Item 1' }, description: { uk: 'Опис 1', en: 'Desc 1' } }]
};

const ourGoalsBlock = {
  title: { uk: 'Initial title', en: 'Initial title en' },
  goals: [{ id: '1', title: { uk: 'Ціль 1', en: 'Goal 1' }, description: { uk: 'Опис 1', en: 'Desc 1' } }]
};

describe('Editable blocks', () => {
  beforeEach(() => jest.clearAllMocks());

  const runCommonTests = (
    Component: React.ComponentType<{ dataKey: 'items' | 'goals'; items?: unknown[]; goals?: unknown[] }>,
    block: {
      title: { uk: string; en: string };
      items?: {
        id: string;
        title: {
          uk: string;
          en: string;
        };
        description: {
          uk: string;
          en: string;
        };
      }[];
      goals?: {
        id: string;
        title: {
          uk: string;
          en: string;
        };
        description: {
          uk: string;
          en: string;
        };
      }[];
    },
    blockId: string,
    dataKey: 'items' | 'goals'
  ) => {
    it('should render skeleton if block not available', () => {
      usePageBlockMock.mockReturnValue({ block: null });
      render(<Component dataKey={dataKey} items={block.items || []} goals={block.goals || []} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should render editable list', () => {
      usePageBlockMock.mockReturnValue({ block });
      render(<Component dataKey={dataKey} items={block.items || []} goals={block.goals || []} />);
      expect(screen.getByTestId('collapsible-block')).toBeInTheDocument();
      expect(screen.getByTestId('editable-list')).toBeInTheDocument();
    });

    it('should update section title', () => {
      usePageBlockMock.mockReturnValue({ block });
      render(<Component dataKey={dataKey} items={block.items || []} goals={block.goals || []} />);
      fireEvent.change(screen.getByTestId('input-section-title'), { target: { value: 'New Section Title' } });
      expect(setFieldMock).toHaveBeenCalledWith(PAGE_IDS.ABOUT_US, blockId, 'title', {
        uk: 'New Section Title',
        en: 'Initial title en'
      });
    });

    it('should update list item', () => {
      usePageBlockMock.mockReturnValue({ block });
      render(<Component dataKey={dataKey} items={block.items || []} goals={block.goals || []} />);
      fireEvent.change(screen.getByTestId('input-item-title-1'), {
        target: { value: 'Updated title' }
      });
      fireEvent.change(screen.getByTestId('input-item-desc-1'), {
        target: { value: 'Updated desc' }
      });
      expect(setFieldMock).toHaveBeenCalledWith(PAGE_IDS.ABOUT_US, blockId, dataKey, expect.any(Array));
    });

    it(`should delete ${dataKey} item`, () => {
      usePageBlockMock.mockReturnValue({ block });
      render(<Component dataKey={dataKey} items={block.items || []} goals={block.goals || []} />);
      fireEvent.click(screen.getByTestId('delete-1'));
      expect(setFieldMock).toHaveBeenCalledWith(PAGE_IDS.ABOUT_US, blockId, dataKey, expect.any(Array));
    });

    it(`should create new ${dataKey} item`, () => {
      usePageBlockMock.mockReturnValue({ block });
      render(<Component dataKey={dataKey} items={block.items || []} goals={block.goals || []} />);
      fireEvent.click(screen.getByTestId('add-btn'));
      expect(setFieldMock).toHaveBeenCalledWith(
        PAGE_IDS.ABOUT_US,
        blockId,
        dataKey,
        expect.arrayContaining([expect.objectContaining({ id: 'unique-id' })])
      );
    });
  };

  describe('WhatWeDo block', () => runCommonTests(WhatWeDo, whatWeDoBlock, BLOCK_IDS.WHAT_WE_DO, 'items'));
  describe('OurGoals block', () => runCommonTests(OurGoals, ourGoalsBlock, BLOCK_IDS.OUR_GOALS, 'goals'));
});
