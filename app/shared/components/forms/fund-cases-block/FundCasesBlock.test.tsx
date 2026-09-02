import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import toast from 'react-hot-toast';

import FundCasesBlock from './FundCasesBlock';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { CaseStatus } from '~/types/graphql/generated/graphql';

interface ColumnDefLike {
  id: string;
  headerLabel: string;
  renderPlain: (row: Record<string, unknown>) => ReactNode;
}

const capturedTableLayoutProps: {
  columns?: ColumnDefLike[];
  data?: { plainData: Record<string, unknown> }[];
} = {};

jest.mock('~/shared/components/table-layout/TableLayout', () => ({
  __esModule: true,
  TableLayout: (props: {
    columns: ColumnDefLike[];
    data: { plainData: Record<string, unknown> }[];
  }) => {
    capturedTableLayoutProps.columns = props.columns;
    capturedTableLayoutProps.data = props.data;
    return (
      <div data-testid="table-layout">
        {props.data.map((row) => (
          <div key={String(row.plainData.id)} data-testid={`row-${row.plainData.id}`}>
            {props.columns.map((col) => (
              <div key={col.id} data-testid={`cell-${row.plainData.id}-${col.id}`}>
                {col.renderPlain(row.plainData)}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
}));

jest.mock('~/shared/components/table-layout/components/StatusBadge', () => ({
  __esModule: true,
  StatusBadge: ({ status }: { status: string }) => <span data-testid="status-badge">{status}</span>
}));

jest.mock('~/shared/components/table-layout/components/RowActions', () => ({
  __esModule: true,
  RowActions: ({
    editAction,
    menuActions
  }: {
    editAction: { editLabel: string; onEditClick?: () => void };
    menuActions: { menuItems: { items: { id: string; text: { name: string }; onClick?: () => void }[] }[] };
  }) => (
    <div data-testid="row-actions">
      <button onClick={editAction.onEditClick}>{editAction.editLabel}</button>
      {menuActions.menuItems.flatMap((group) =>
        group.items.map((item) => (
          <button key={item.id} onClick={item.onClick}>
            {item.text.name}
          </button>
        ))
      )}
    </div>
  )
}));

let capturedModalProps: Record<string, unknown> | null = null;
jest.mock('../../../../(logged_in)/archive/(components)/ArchiveCaseModal', () => ({
  __esModule: true,
  ArchiveCaseModal: (props: Record<string, unknown>) => {
    capturedModalProps = props;
    return props.isOpen ? (
      <div data-testid="archive-case-modal">
        <button onClick={() => (props.setIsOpen as (open: boolean) => void)(false)}>close modal</button>
        <button onClick={() => (props.onSaved as () => void)()}>save modal</button>
      </div>
    ) : null;
  }
}));

let capturedDeleteModalProps: Record<string, unknown> | null = null;
jest.mock('~/shared/components/delete-composition-modal/DeleteCompositionModal', () => ({
  __esModule: true,
  DeleteCompositionModal: (props: Record<string, unknown>) => {
    capturedDeleteModalProps = props;
    return props.open ? (
      <div data-testid="delete-modal">
        <span>{props.description as string}</span>
        <button onClick={() => (props.onConfirm as () => void)()}>confirm delete</button>
        <button onClick={() => (props.onClose as () => void)()}>close delete</button>
      </div>
    ) : null;
  }
}));

const mockRefetch = jest.fn();
const mockDeleteCase = jest.fn().mockResolvedValue({});
const mockUpdateCase = jest.fn().mockResolvedValue({});
let mockCases: unknown[] = [];
let mockError: unknown = undefined;

jest.mock('~/shared/hooks/use-funds/useFunds', () => ({
  __esModule: true,
  useCasesByFundId: () => ({ cases: mockCases, error: mockError, refetch: mockRefetch }),
  useDeleteCase: () => [mockDeleteCase],
  useUpdateCase: () => [mockUpdateCase]
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() }
}));

const localized = (uk: string) => ({ uk, en: uk });

const buildCase = (
  overrides: Partial<{
    id: string;
    cipher: string;
    caseName: string;
    sheetsNumber: number;
    caseDate: string;
    caseDescriptions: string;
    status: CaseStatus;
    descriptionNumber: number;
    caseNumber: number;
    pdfFile: { filename: string; url: string; mimeType: string } | null;
  }> = {}
) => ({
  id: overrides.id ?? 'case-1',
  fundId: 'fund-1',
  descriptionNumber: overrides.descriptionNumber ?? 1,
  caseNumber: overrides.caseNumber ?? 1,
  cipher: overrides.cipher ?? 'Ф. 2, оп. 1, спр. 1',
  caseName: localized(overrides.caseName ?? 'Тестова справа'),
  caseDate: localized(overrides.caseDate ?? '1930'),
  sheetsNumber: overrides.sheetsNumber ?? 5,
  caseDescriptions: localized(overrides.caseDescriptions ?? 'Опис справи'),
  detailedCaseDescription: localized('Детальний опис'),
  pdfFile: overrides.pdfFile !== undefined ? overrides.pdfFile : null,
  status: overrides.status ?? CaseStatus.Published,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
});

describe('FundCasesBlock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedTableLayoutProps.columns = undefined;
    capturedTableLayoutProps.data = undefined;
    capturedModalProps = null;
    capturedDeleteModalProps = null;
    mockCases = [buildCase()];
    mockError = undefined;
  });

  it('renders the header, add button, and a row per case', () => {
    mockCases = [buildCase({ id: 'case-1' }), buildCase({ id: 'case-2', caseName: 'Друга справа' })];
    render(<FundCasesBlock fundId="fund-1" />);

    expect(screen.getByText('Справи в фонді')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Додати справу/ })).toBeInTheDocument();
    expect(screen.getByTestId('table-layout')).toBeInTheDocument();
    expect(screen.getByTestId('row-case-1')).toBeInTheDocument();
    expect(screen.getByTestId('row-case-2')).toBeInTheDocument();
  });

  it('renders an error message when the cases query fails', () => {
    mockError = new Error('network error');
    render(<FundCasesBlock fundId="fund-1" />);

    expect(screen.getByText('Не вдалося завантажити справи фонду.')).toBeInTheDocument();
    expect(screen.queryByTestId('table-layout')).not.toBeInTheDocument();
  });

  it('opens the create modal (no caseId) when the add-case button is clicked', async () => {
    const user = userEvent.setup();
    render(<FundCasesBlock fundId="fund-1" />);

    await user.click(screen.getByRole('button', { name: /Додати справу/ }));

    expect(capturedModalProps?.isOpen).toBe(true);
    expect(capturedModalProps?.mode).toBe('create');
    expect(capturedModalProps?.caseId).toBeUndefined();
  });

  it('opens the edit modal with initialData mapped from the localized fields when a row is edited', async () => {
    const user = userEvent.setup();
    mockCases = [buildCase({ id: 'case-1', caseName: 'Архівна справа' })];
    render(<FundCasesBlock fundId="fund-1" />);

    await user.click(screen.getByText('Редагувати справу Архівна справа'));

    expect(capturedModalProps?.isOpen).toBe(true);
    expect(capturedModalProps?.mode).toBe('edit');
    expect(capturedModalProps?.caseId).toBe('case-1');
    expect(capturedModalProps?.initialData).toMatchObject({
      caseName: 'Архівна справа',
      caseDate: '1930',
      sheetsNumber: '5',
      caseDescriptions: 'Опис справи',
      detailedCaseDescription: 'Детальний опис',
      currentPdfFile: undefined
    });
  });

  it('opens the edit modal mapping pdfFile if present', async () => {
    const user = userEvent.setup();
    mockCases = [
      buildCase({
        id: 'case-1',
        caseName: 'Архівна справа',
        pdfFile: { filename: 'test.pdf', url: 'http://test.com', mimeType: 'application/pdf' }
      })
    ];
    render(<FundCasesBlock fundId="fund-1" />);

    await user.click(screen.getByText('Редагувати справу Архівна справа'));

    expect(capturedModalProps?.initialData).toMatchObject({
      currentPdfFile: { name: 'test.pdf', fileName: 'test.pdf', url: 'http://test.com', mimeType: 'application/pdf' }
    });
  });

  it('handles closing the edit modal and triggering refetch on save', async () => {
    const user = userEvent.setup();
    render(<FundCasesBlock fundId="fund-1" />);

    await user.click(screen.getByRole('button', { name: /Додати справу/ }));
    await user.click(screen.getByText('close modal'));

    expect(capturedModalProps?.isOpen).toBe(false);

    await user.click(screen.getByRole('button', { name: /Додати справу/ }));
    await user.click(screen.getByText('save modal'));

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('maps a published case to the Published badge status', () => {
    mockCases = [buildCase({ status: CaseStatus.Published })];
    render(<FundCasesBlock fundId="fund-1" />);

    expect(screen.getByTestId('status-badge')).toHaveTextContent(BaseContentStatuses.Published);
  });

  it('maps a draft case to the Hidden badge status', () => {
    mockCases = [buildCase({ status: CaseStatus.Draft })];
    render(<FundCasesBlock fundId="fund-1" />);

    expect(screen.getByTestId('status-badge')).toHaveTextContent(BaseContentStatuses.Hidden);
  });

  it('toggles a published case to hidden and refetches', async () => {
    const user = userEvent.setup();
    mockCases = [buildCase({ id: 'case-1', status: CaseStatus.Published })];
    render(<FundCasesBlock fundId="fund-1" />);

    await user.click(screen.getByText('Сховати'));

    expect(mockUpdateCase).toHaveBeenCalledWith({ id: 'case-1', input: { status: CaseStatus.Draft } });
    expect(toast.success).toHaveBeenCalledWith('Справу успішно сховано');
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('toggles a draft case to published and refetches', async () => {
    const user = userEvent.setup();
    mockCases = [buildCase({ id: 'case-1', status: CaseStatus.Draft })];
    render(<FundCasesBlock fundId="fund-1" />);

    await user.click(screen.getByText('Опублікувати'));

    expect(mockUpdateCase).toHaveBeenCalledWith({ id: 'case-1', input: { status: CaseStatus.Published } });
    expect(toast.success).toHaveBeenCalledWith('Справу успішно опубліковано');
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('handles errors when toggling a case status', async () => {
    const user = userEvent.setup();
    mockUpdateCase.mockRejectedValueOnce(new Error('Update failed'));
    mockCases = [buildCase({ id: 'case-1', status: CaseStatus.Draft })];
    render(<FundCasesBlock fundId="fund-1" />);

    await user.click(screen.getByText('Опублікувати'));

    expect(mockUpdateCase).toHaveBeenCalledWith({ id: 'case-1', input: { status: CaseStatus.Published } });
    expect(toast.error).toHaveBeenCalledWith('Update failed');
  });

  it('handles generic errors when toggling a case status', async () => {
    const user = userEvent.setup();
    mockUpdateCase.mockRejectedValueOnce('Some string error');
    mockCases = [buildCase({ id: 'case-1', status: CaseStatus.Draft })];
    render(<FundCasesBlock fundId="fund-1" />);

    await user.click(screen.getByText('Опублікувати'));

    expect(toast.error).toHaveBeenCalledWith('Не вдалося змінити статус справи');
  });

  it('opens the delete confirmation with the case name and deletes on confirm', async () => {
    const user = userEvent.setup();
    mockCases = [buildCase({ id: 'case-1', caseName: 'Справа на видалення' })];
    render(<FundCasesBlock fundId="fund-1" />);

    await user.click(screen.getByText('Видалити'));
    expect(screen.getByTestId('delete-modal')).toHaveTextContent('Справа на видалення');

    await user.click(screen.getByText('confirm delete'));

    expect(mockDeleteCase).toHaveBeenCalledWith({ id: 'case-1' });
    expect(mockRefetch).toHaveBeenCalled();
    expect(capturedDeleteModalProps?.open).toBe(false);
  });

  it('closes the delete confirmation without deleting', async () => {
    const user = userEvent.setup();
    mockCases = [buildCase({ id: 'case-1', caseName: 'Справа на видалення' })];
    render(<FundCasesBlock fundId="fund-1" />);

    await user.click(screen.getByText('Видалити'));
    await user.click(screen.getByText('close delete'));

    expect(mockDeleteCase).not.toHaveBeenCalled();
    expect(capturedDeleteModalProps?.open).toBe(false);
  });

  it('does not render the ArchiveCaseModal when fundId is not provided', () => {
    render(<FundCasesBlock />);

    expect(screen.queryByTestId('archive-case-modal')).not.toBeInTheDocument();
  });

  it('sorts rows by descriptionNumber, then by caseNumber within the same description', () => {
    const caseA = buildCase({ id: 'case-a', descriptionNumber: 2, caseNumber: 1 });
    const caseB = buildCase({ id: 'case-b', descriptionNumber: 1, caseNumber: 2 });
    const caseC = buildCase({ id: 'case-c', descriptionNumber: 1, caseNumber: 1 });
    mockCases = [caseA, caseB, caseC];

    render(<FundCasesBlock fundId="fund-1" />);

    const renderedRows = screen.getAllByTestId(/row-case-/);
    expect(renderedRows.map((row) => row.getAttribute('data-testid'))).toEqual([
      'row-case-c',
      'row-case-b',
      'row-case-a'
    ]);
  });

  it('renders correctly all columns in plain mode', () => {
    const testCase = buildCase({
      cipher: 'test-cipher',
      caseName: 'test-case-name',
      sheetsNumber: 99,
      caseDate: 'test-case-date',
      caseDescriptions: 'test-case-desc'
    });
    mockCases = [testCase];
    render(<FundCasesBlock fundId="fund-1" />);

    expect(screen.getByText('test-cipher')).toBeInTheDocument();
    expect(screen.getByText('test-case-name')).toBeInTheDocument();
    expect(screen.getByText('99')).toBeInTheDocument();
    expect(screen.getByText('test-case-date')).toBeInTheDocument();
    expect(screen.getByText('test-case-desc')).toBeInTheDocument();
  });
});