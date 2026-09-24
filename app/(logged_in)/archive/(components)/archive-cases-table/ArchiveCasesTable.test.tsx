import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import toast from 'react-hot-toast';

import type { ArchiveCase } from '../archive-funds-table/ArchiveFundsTable';
import { ArchiveCasesTable } from './ArchiveCasesTable';
import { ARCHIVE_BASE_PATH } from '~/constants/archive';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { CaseStatus } from '~/types/graphql/generated/graphql';

function mockCase(overrides: Partial<ArchiveCase> = {}): ArchiveCase {
  return {
    id: '1',
    name: 'Справа про щось',
    fundId: 'fund-1',
    cipher: 'Ф. 1, оп. 1, спр. 1',
    caseNumber: 1,
    descriptionNumber: 1,
    sheetsNumber: 42,
    editCaseDate: '1930-1935',
    editCaseDescriptions: 'Опис справи',
    detailedCaseDescription: 'Детальний опис справи',
    status: BaseContentStatuses.Published,
    updatedAt: '2023-01-01',
    ...overrides
  };
}

jest.mock('../ArchiveCaseModal', () => ({
  __esModule: true,
  ArchiveCaseModal: ({
    isOpen,
    setIsOpen,
    mode,
    initialData,
    fundId,
    caseId,
    onSaved
  }: {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    mode: string;
    initialData: unknown;
    fundId?: string;
    caseId: string;
    onSaved: () => void;
  }) =>
    isOpen ? (
      <div data-testid="archive-case-modal">
        <div data-testid="modal-mode">{mode}</div>
        <div data-testid="modal-case-id">{caseId}</div>
        <div data-testid="modal-fund-id">{fundId}</div>
        <div data-testid="modal-initial-data">{JSON.stringify(initialData)}</div>
        <button onClick={() => setIsOpen(true)}>keep modal open</button>
        <button onClick={() => setIsOpen(false)}>close modal</button>
        <button onClick={() => onSaved()}>save case</button>
      </div>
    ) : null
}));

jest.mock('~/shared/components/delete-composition-modal/DeleteCompositionModal', () => ({
  __esModule: true,
  DeleteCompositionModal: ({
    open,
    onClose,
    title,
    description,
    onConfirm
  }: {
    open: boolean;
    onClose: () => void;
    title: string;
    description: string;
    onConfirm: () => void;
  }) => (
    <div data-testid="delete-modal">
      <div data-testid="delete-modal-open">{JSON.stringify(open)}</div>
      <div data-testid="delete-modal-title">{title}</div>
      <div data-testid="delete-modal-description">{description}</div>
      <button onClick={onClose}>cancel delete</button>
      <button onClick={onConfirm}>confirm delete</button>
    </div>
  )
}));

jest.mock('~/shared/components/table-layout/components/RowActions', () => ({
  __esModule: true,
  RowActions: ({
    editAction,
    menuActions
  }: {
    editAction: { editLabel: string; onEditClick?: () => void };
    menuActions: {
      menuTriggerLabel: string;
      menuItems: { items: { id: string; text: { name: string }; onClick?: () => void; href?: string }[] }[];
    };
  }) => (
    <div data-testid="row-actions">
      <button aria-label={editAction.editLabel} onClick={editAction.onEditClick}>
        edit-pencil
      </button>
      <div data-testid="menu-trigger-label">{menuActions.menuTriggerLabel}</div>
      {menuActions.menuItems.map((group, groupIndex) => (
        <div key={groupIndex} data-testid={`menu-group-${groupIndex}`}>
          {group.items.map((item) => (
            <button
              key={item.id}
              data-testid={`menu-item-${item.id}`}
              data-href={item.href}
              onClick={item.onClick}
            >
              {item.text.name}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}));

jest.mock('~/shared/components/table-layout/components/StatusBadge', () => ({
  __esModule: true,
  StatusBadge: ({ status, updatedAt }: { status: string; updatedAt: string }) => (
    <div data-testid="status-badge">
      {status} / {updatedAt}
    </div>
  )
}));

jest.mock('~/shared/components/table-layout/TableLayout', () => ({
  __esModule: true,
  TableLayout: ({
    data,
    columns
  }: {
    data: { id: string; plainData: Record<string, unknown> }[];
    columns: { id: string; renderPlain: (row: Record<string, unknown>) => ReactNode }[];
  }) => (
    <table>
      <tbody>
        {data.map((row) => (
          <tr key={row.id} data-testid={`row-${row.id}`}>
            {columns.map((column) => (
              <td key={column.id} data-testid={`cell-${row.id}-${column.id}`}>
                {column.renderPlain(row.plainData)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}));

const mockDeleteCase = jest.fn();
const mockUpdateCase = jest.fn();

jest.mock('~/shared/hooks/use-funds/useFunds', () => ({
  __esModule: true,
  useDeleteCase: () => [mockDeleteCase, { loading: false }],
  useUpdateCase: () => [mockUpdateCase, { loading: false }]
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() }
}));

describe('ArchiveCasesTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDeleteCase.mockResolvedValue(undefined);
    mockUpdateCase.mockResolvedValue(undefined);
  });

  it('renders an empty table when there are no cases', () => {
    render(<ArchiveCasesTable cases={[]} />);

    expect(screen.queryByTestId(/^row-/)).not.toBeInTheDocument();
  });

  it('renders a row per case with the mapped cell content for every column', () => {
    render(
      <ArchiveCasesTable
        cases={[
          mockCase({
            id: '1',
            cipher: 'Ф. 1, оп. 1, спр. 1',
            name: 'Перша справа',
            sheetsNumber: 12,
            editCaseDate: '1930-1935',
            editCaseDescriptions: 'Опис першої справи',
            status: BaseContentStatuses.Published,
            updatedAt: '2023-01-01'
          }),
          mockCase({ id: '2', caseNumber: 2, name: 'Друга справа' })
        ]}
      />
    );

    expect(screen.getByTestId('row-1')).toBeInTheDocument();
    expect(screen.getByTestId('row-2')).toBeInTheDocument();
    expect(screen.getByTestId('cell-1-cipher')).toHaveTextContent('Ф. 1, оп. 1, спр. 1');
    expect(screen.getByTestId('cell-1-caseName')).toHaveTextContent('Перша справа');
    expect(screen.getByTestId('cell-1-sheetsNumber')).toHaveTextContent('12');
    expect(screen.getByTestId('cell-1-caseDate')).toHaveTextContent('1930-1935');
    expect(screen.getByTestId('cell-1-caseDescription')).toHaveTextContent('Опис першої справи');
    expect(screen.getByTestId('cell-1-publishedAt')).toHaveTextContent('published / 2023-01-01');
    expect(screen.getByTestId('cell-1-actions')).toBeInTheDocument();
  });

  it('opens the edit modal with the mapped initial data when the edit pencil is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ArchiveCasesTable
        cases={[
          mockCase({
            id: '1',
            fundId: 'fund-7',
            name: 'Справа для редагування',
            descriptionNumber: 3,
            caseNumber: 4,
            sheetsNumber: 55,
            editCaseDate: '1940-1945',
            editCaseDescriptions: 'Склад справи',
            detailedCaseDescription: 'Деталі справи'
          })
        ]}
      />
    );

    expect(screen.queryByTestId('archive-case-modal')).not.toBeInTheDocument();

    await user.click(screen.getByText('edit-pencil'));

    expect(screen.getByTestId('archive-case-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-mode')).toHaveTextContent('edit');
    expect(screen.getByTestId('modal-case-id')).toHaveTextContent('1');
    expect(screen.getByTestId('modal-fund-id')).toHaveTextContent('fund-7');
    expect(screen.getByTestId('modal-initial-data')).toHaveTextContent(
      JSON.stringify({
        descriptionNumber: '3',
        caseNumber: '4',
        sheetsNumber: '55',
        caseDate: '1940-1945',
        caseName: 'Справа для редагування',
        caseDescriptions: 'Склад справи',
        detailedCaseDescription: 'Деталі справи'
      })
    );
  });

  it('opens the edit modal when the Редагувати menu item is clicked', async () => {
    const user = userEvent.setup();
    render(<ArchiveCasesTable cases={[mockCase({ id: '1' })]} />);

    await user.click(screen.getByTestId('menu-item-edit'));

    expect(screen.getByTestId('archive-case-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-case-id')).toHaveTextContent('1');
  });

  it('renders the share menu item pointing to the case share page', () => {
    render(<ArchiveCasesTable cases={[mockCase({ id: '1' })]} />);

    expect(screen.getByTestId('menu-item-share')).toHaveAttribute(
      'data-href',
      `${ARCHIVE_BASE_PATH}/case/1/share`
    );
  });

  it('keeps the edit modal open when setIsOpen is called with true, and closes it when called with false', async () => {
    const user = userEvent.setup();
    render(<ArchiveCasesTable cases={[mockCase({ id: '1' })]} />);

    await user.click(screen.getByText('edit-pencil'));
    expect(screen.getByTestId('archive-case-modal')).toBeInTheDocument();

    await user.click(screen.getByText('keep modal open'));
    expect(screen.getByTestId('archive-case-modal')).toBeInTheDocument();

    await user.click(screen.getByText('close modal'));
    expect(screen.queryByTestId('archive-case-modal')).not.toBeInTheDocument();
  });

  it('saves the edit and notifies the parent that the case changed', async () => {
    const user = userEvent.setup();
    const onCaseChanged = jest.fn(async () => undefined);
    render(<ArchiveCasesTable cases={[mockCase({ id: '1' })]} onCaseChanged={onCaseChanged} />);

    await user.click(screen.getByText('edit-pencil'));
    await user.click(screen.getByText('save case'));

    expect(onCaseChanged).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('archive-case-modal')).not.toBeInTheDocument();
  });

  it.each([
    {
      currentStatus: BaseContentStatuses.Published,
      expectedLabel: 'Сховати',
      expectedNextStatus: CaseStatus.Draft,
      expectedMessage: 'Справу успішно сховано'
    },
    {
      currentStatus: BaseContentStatuses.Hidden,
      expectedLabel: 'Опублікувати',
      expectedNextStatus: CaseStatus.Published,
      expectedMessage: 'Справу успішно опубліковано'
    }
  ])(
    'toggles status from $currentStatus to $expectedNextStatus and shows a matching toast',
    async ({ currentStatus, expectedLabel, expectedNextStatus, expectedMessage }) => {
      const user = userEvent.setup();
      const onCaseChanged = jest.fn(async () => undefined);
      render(
        <ArchiveCasesTable cases={[mockCase({ id: '1', status: currentStatus })]} onCaseChanged={onCaseChanged} />
      );

      expect(screen.getByTestId('menu-item-toggle-status')).toHaveTextContent(expectedLabel);

      await user.click(screen.getByTestId('menu-item-toggle-status'));

      expect(mockUpdateCase).toHaveBeenCalledWith({ id: '1', input: { status: expectedNextStatus } });
      expect(toast.success).toHaveBeenCalledWith(expectedMessage);
      expect(onCaseChanged).toHaveBeenCalledTimes(1);
    }
  );

  it.each([
    { thrown: new Error('мережева помилка'), expectedMessage: 'мережева помилка' },
    { thrown: 'щось пішло не так', expectedMessage: 'Не вдалося змінити статус справи' }
  ])('shows an error toast when changing status fails ($expectedMessage)', async ({ thrown, expectedMessage }) => {
    const user = userEvent.setup();
    mockUpdateCase.mockRejectedValueOnce(thrown);
    const onCaseChanged = jest.fn(async () => undefined);
    render(<ArchiveCasesTable cases={[mockCase({ id: '1' })]} onCaseChanged={onCaseChanged} />);

    await user.click(screen.getByTestId('menu-item-toggle-status'));

    expect(toast.error).toHaveBeenCalledWith(expectedMessage);
    expect(onCaseChanged).not.toHaveBeenCalled();
  });

  it('opens the delete confirmation with the case name and does nothing when cancelled', async () => {
    const user = userEvent.setup();
    render(<ArchiveCasesTable cases={[mockCase({ id: '1', name: 'Справа на видалення' })]} />);

    expect(screen.getByTestId('delete-modal-open')).toHaveTextContent('false');

    await user.click(screen.getByTestId('menu-item-delete'));

    expect(screen.getByTestId('delete-modal-open')).toHaveTextContent('true');
    expect(screen.getByTestId('delete-modal-description')).toHaveTextContent('Справа на видалення');

    await user.click(screen.getByText('cancel delete'));

    expect(screen.getByTestId('delete-modal-open')).toHaveTextContent('false');
    expect(mockDeleteCase).not.toHaveBeenCalled();
  });

  it('deletes the case and notifies the parent when the deletion is confirmed', async () => {
    const user = userEvent.setup();
    const onCaseChanged = jest.fn(async () => undefined);
    render(<ArchiveCasesTable cases={[mockCase({ id: '1' })]} onCaseChanged={onCaseChanged} />);

    await user.click(screen.getByTestId('menu-item-delete'));
    await user.click(screen.getByText('confirm delete'));

    expect(mockDeleteCase).toHaveBeenCalledWith({ id: '1' });
    expect(screen.getByTestId('delete-modal-open')).toHaveTextContent('false');
    expect(onCaseChanged).toHaveBeenCalledTimes(1);
  });

  it('does not call deleteCase when the deletion is confirmed without a case selected', async () => {
    const user = userEvent.setup();
    render(<ArchiveCasesTable cases={[mockCase({ id: '1' })]} />);

    await user.click(screen.getByText('confirm delete'));

    expect(mockDeleteCase).not.toHaveBeenCalled();
  });

  it('works without an onCaseChanged callback for status toggling, deleting and editing', async () => {
    const user = userEvent.setup();
    render(<ArchiveCasesTable cases={[mockCase({ id: '1' })]} />);

    await user.click(screen.getByTestId('menu-item-toggle-status'));
    expect(mockUpdateCase).toHaveBeenCalledTimes(1);

    await user.click(screen.getByTestId('menu-item-delete'));
    await user.click(screen.getByText('confirm delete'));
    expect(mockDeleteCase).toHaveBeenCalledTimes(1);

    await user.click(screen.getByText('edit-pencil'));
    await user.click(screen.getByText('save case'));
    expect(screen.queryByTestId('archive-case-modal')).not.toBeInTheDocument();
  });
});
