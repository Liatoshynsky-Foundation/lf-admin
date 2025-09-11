import { fireEvent, render, screen } from '@testing-library/react';

import OurGoals from './OurGoals';
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
        <div key={it.id} data-testid={`goal-${it.id}`}>
          <input
            data-testid={`input-goal-title-${it.id}`}
            value={it.title}
            onChange={(e) => onChangeItem(it.id, 'title', e.target.value)}
          />
          <input
            data-testid={`input-goal-desc-${it.id}`}
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
  goals: [
    {
      id: '1',
      title: { uk: 'Ціль 1', en: 'Goal 1' },
      description: { uk: 'Опис 1', en: 'Desc 1' }
    }
  ]
};

describe('OurGoals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render skeleton when block is not available', () => {
    usePageBlockMock.mockReturnValue({ block: null });
    render(<OurGoals />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should update section title', () => {
    usePageBlockMock.mockReturnValue({ block: mockBlock });
    render(<OurGoals />);
    fireEvent.change(screen.getByTestId('input-section-title'), {
      target: { value: 'New Section Title' }
    });
    expect(setFieldMock).toHaveBeenCalledWith(PAGE_IDS.ABOUT_US, BLOCK_IDS.OUR_GOALS, 'title', {
      uk: 'New Section Title',
      en: 'Initial title en'
    });
  });

  it('should update goal item title and description', () => {
    usePageBlockMock.mockReturnValue({ block: mockBlock });
    render(<OurGoals />);
    fireEvent.change(screen.getByTestId('input-goal-title-1'), {
      target: { value: 'Updated goal' }
    });
    fireEvent.change(screen.getByTestId('input-goal-desc-1'), {
      target: { value: 'Updated desc' }
    });
    expect(setFieldMock).toHaveBeenCalledWith(PAGE_IDS.ABOUT_US, BLOCK_IDS.OUR_GOALS, 'goals', expect.any(Array));
  });

  it('should delete goal item', () => {
    usePageBlockMock.mockReturnValue({ block: mockBlock });
    render(<OurGoals />);
    fireEvent.click(screen.getByTestId('delete-1'));
    expect(setFieldMock).toHaveBeenCalledWith(PAGE_IDS.ABOUT_US, BLOCK_IDS.OUR_GOALS, 'goals', expect.any(Array));
  });
  it('should create new item', () => {
    usePageBlockMock.mockReturnValue({ block: mockBlock });
    render(<OurGoals />);
    fireEvent.click(screen.getByTestId('add-btn'));
    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.OUR_GOALS,
      'goals',
      expect.arrayContaining([expect.objectContaining({ id: 'unique-id' })])
    );
  });
});
