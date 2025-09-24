import { fireEvent, render, screen } from '@testing-library/react';

import { FoundationFounders } from './FoundationFounders';

const setFieldMock = jest.fn();
const usePageBlockMock = jest.fn();

jest.mock('~/store', () => ({
  useStore: (selector: (state: { locale: string; setField: typeof setFieldMock }) => void) =>
    selector({ locale: 'uk', setField: setFieldMock })
}));

jest.mock('~/shared/hooks/use-page-block/usePageBlock', () => ({
  usePageBlock: (...args: [string, string]) => usePageBlockMock(...args)
}));

jest.mock('~/ds-components/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <section data-testid="collapsible">
      <h2>{title}</h2>
      {children}
    </section>
  )
}));

jest.mock('~/ds-components/text-field/TextField', () => ({
  CustomTextField: ({
    title,
    value,
    onChange
  }: {
    title: string;
    value: string;
    onChange: (e: { target: { value: string } }) => void;
  }) => (
    <label>
      {title}
      <input data-testid={`textfield-${title}`} value={value} onChange={onChange} />
    </label>
  )
}));

jest.mock('~/components/configurable-list/ConfigurableList', () => ({
  __esModule: true,
  default: ({
    items,
    addBtnLabel,
    onCreate,
    renderItem,
    editable,
    onDelete
  }: {
    items: { id: string }[];
    addBtnLabel: string;
    onCreate: () => void;
    renderItem: ({ item }: { item: { id: string } }) => React.ReactNode;
    editable: boolean;
    onDelete: (id: string) => void;
  }) => (
    <div data-testid="configurable-list">
      {items.map((item: { id: string }) => (
        <div key={item.id} data-testid="configurable-item">
          {renderItem({ item })}
          {editable && <button onClick={() => onDelete(item.id)}>Delete</button>}
        </div>
      ))}
      {editable && <button onClick={onCreate}>{addBtnLabel}</button>}
    </div>
  )
}));

jest.mock('~/components/contributor-card/ContributorCard', () => ({
  ContributorCard: ({
    contributor
  }: {
    contributor: {
      name: { uk: string; en: string };
      description: { uk: string; en: string };
      photo: {
        src: string;
        alt: { uk: string; en: string };
        caption: { uk: string; en: string };
        generatedSrc: string;
      };
    };
  }) => <div data-testid="contributor-card">{contributor.name.uk || 'Placeholder Name'}</div>
}));

const expectSetField = (field: string, value: unknown) =>
  expect(setFieldMock).toHaveBeenCalledWith('about-us', 'FoundationFounders', field, expect.objectContaining(value));

const updateField = (testId: string, value: string) =>
  fireEvent.change(screen.getByTestId(testId), { target: { value } });

beforeAll(() => {
  global.crypto.randomUUID = jest.fn(() => 'test-id') as unknown as typeof crypto.randomUUID;
});

describe('FoundationFounders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePageBlockMock.mockReturnValue({
      block: {
        titleText: {
          uk: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Вступ' }] }] },
          en: { type: 'doc', content: [] }
        },
        listTitle: {
          uk: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Список' }] }] },
          en: { type: 'doc', content: [] }
        },
        members: []
      }
    });
  });

  it('should render skeleton when no block', () => {
    usePageBlockMock.mockReturnValueOnce({ block: null });
    const { container } = render(<FoundationFounders />);
    expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });

  it('should update title text', () => {
    render(<FoundationFounders />);
    updateField('textfield-Вступний текст секції', 'Новий заголовок');
    expectSetField('titleText', { uk: expect.objectContaining({ type: 'doc' }) });
  });

  it('should update list title', () => {
    render(<FoundationFounders />);
    updateField('textfield-Заголовок секції', 'Новий список');
    expectSetField('listTitle', { uk: expect.objectContaining({ type: 'doc' }) });
  });

  it('should add a new member', () => {
    render(<FoundationFounders />);
    fireEvent.click(screen.getByText(/Додати учасника/));

    expect(setFieldMock).toHaveBeenCalledWith(
      'about-us',
      'FoundationFounders',
      'members',
      expect.arrayContaining([
        expect.objectContaining({
          id: 'test-id',
          name: { uk: 'Placeholder Name', en: 'Placeholder Name' }
        })
      ])
    );
  });

  it('should remove a member', () => {
    usePageBlockMock.mockReturnValueOnce({
      block: {
        titleText: {
          uk: { type: 'doc', content: [] },
          en: { type: 'doc', content: [] }
        },
        listTitle: {
          uk: { type: 'doc', content: [] },
          en: { type: 'doc', content: [] }
        },
        members: [{ id: '1', name: { uk: 'Тест', en: 'Test' }, description: { uk: '', en: '' }, photo: {} }]
      }
    });
    render(<FoundationFounders />);
    expect(screen.getByText('Тест')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Delete'));
    expectSetField('members', []);
  });
});
