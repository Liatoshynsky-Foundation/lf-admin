import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ArchiveCase, FundsTable, FundsTableProps } from './ArchiveFundsTable';
import {
  ARCHIVE_EMPTY_STATE_DESCRIPTION,
  ARCHIVE_EMPTY_STATE_NO_RESULTS_DESCRIPTION,
  ARCHIVE_EMPTY_STATE_NO_RESULTS_TITLE,
  ARCHIVE_EMPTY_STATE_NO_STATUS_MATCH_TITLE,
  ARCHIVE_EMPTY_STATE_TITLE,
  ARCHIVE_FUNDS_TABLE_HEADERS,
} from '~/constants/archive';
import { BaseRowData, ColumnDef } from '~/shared/components/table-layout/row-variants/Row.types';
import { BaseContentStatuses } from '~/types/enums/common.enums';

type EmptyStateProps = {
  title: string;
  description?: string;
};

type TableLayoutProps<TGroup, TSub, TPlain> = {
  data: readonly BaseRowData<TGroup, TSub, TPlain>[];
  columns: readonly ColumnDef<TGroup, TSub, TPlain>[];
};

const mockDeleteFund = jest.fn();
const mockDeleteCase = jest.fn();
const mockUpdateCase = jest.fn();
jest.mock('~/shared/hooks/use-funds/useFunds', () => ({
  useDeleteFund: () => [mockDeleteFund],
  useDeleteCase: () => [mockDeleteCase],
  useUpdateCase: () => [mockUpdateCase],
}));

const mockGetCaseRow = jest.fn((caseItem: ArchiveCase) => ({
  id: caseItem.id,
  cipher: caseItem.cipher,
  name: caseItem.name,
  descriptionLabel: String(caseItem.descriptionNumber),
  caseLabel: String(caseItem.sheetsNumber),
  caseDate: caseItem.editCaseDate,
  status: caseItem.status,
  updatedAt: caseItem.updatedAt,
  editAction: { editLabel: `Редагувати справу ${caseItem.name}` },
  menuActions: { menuItems: [], menuTriggerLabel: `Дії для справи ${caseItem.name}` },
}));

jest.mock('~/shared/hooks/use-archive-case-row-actions/useArchiveCaseRowActions', () => ({
  useArchiveCaseRowActions: (_onCaseChanged?: () => Promise<unknown>) => ({
    getCaseRow: mockGetCaseRow,
    caseRowModals: <div data-testid="mock-case-row-modals" />,
  }),
}));

jest.mock('~/shared/components/empty-state', () => ({
  EmptyState: ({ title, description }: EmptyStateProps) => (
    <div data-testid="mock-empty-state">
      <div data-testid="mock-empty-state-title">{title}</div>
      <div data-testid="mock-empty-state-description">{description}</div>
    </div>
  ),
}));

jest.mock('~/shared/components/delete-composition-modal/DeleteCompositionModal', () => ({
  DeleteCompositionModal: (props: { open: boolean; onClose: () => void; onConfirm: () => void; description: string }) => (
    <div data-testid="mock-delete-modal" data-open={props.open}>
      <span>{props.description}</span>
      <button onClick={props.onClose} data-testid="mock-delete-close">Close</button>
      <button onClick={props.onConfirm} data-testid="mock-delete-confirm">Confirm</button>
    </div>
  )
}));

jest.mock('~/shared/components/table-layout/components/RowActions', () => ({
  RowActions: ({ menuActions }: { menuActions: { menuItems: { items: { id: string; onClick?: () => void }[] }[] } }) => (
    <div data-testid="row-actions">
      {menuActions.menuItems.flatMap(group => group.items).map(item => (
        <button key={item.id} data-testid={`action-${item.id}`} onClick={item.onClick}>
          {item.id}
        </button>
      ))}
    </div>
  )
}));

jest.mock('~/shared/components/table-layout/components/StatusBadge');

jest.mock('~/shared/components/table-layout/TableLayout', () => ({
  TableLayout: <TGroup, TSub, TPlain>({ data, columns }: TableLayoutProps<TGroup, TSub, TPlain>) => (
    <div data-testid="mock-table-layout">
      <div data-testid="mock-table-layout-columns">
        {columns.map((col) => (
          <span key={col.id} data-testid={`mock-table-layout-column-${col.id}`}>
            {col.headerLabel}
          </span>
        ))}
      </div>
      <div data-testid="mock-table-layout-data">
        {data.map((item) => {
          if (item.type === 'individual') {
            return (
              <div key={item.id} data-testid={`mock-table-layout-row-${item.id}`}>
                <span data-testid="row-json">{JSON.stringify(item)}</span>
                {columns.map((col) => (
                  <span key={col.id} data-testid={`mock-cell-${col.id}`}>
                    {col.renderPlain ? col.renderPlain(item.plainData) : null}
                  </span>
                ))}
              </div>
            );
          }

          return (
            <div key={item.id} data-testid={`mock-table-layout-group-${item.id}`}>
              {columns.map((col) => (
                <span key={col.id} data-testid={`mock-group-cell-${col.id}-${item.id}`}>
                  {col.renderGroup ? col.renderGroup(item.groupData) : null}
                </span>
              ))}
              {item.subRows.map((sub) => (
                <div key={sub.id} data-testid={`mock-table-layout-subrow-${sub.id}`}>
                  {columns.map((col) => (
                    <span key={col.id} data-testid={`mock-sub-cell-${col.id}-${sub.id}`}>
                      {col.renderSub ? col.renderSub(sub, item.groupData) : null}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  ),
}));

jest.mock('../archive-cases-table/ArchiveCasesTable', () => ({
  ArchiveCasesTable: ({ cases }: { cases: ArchiveCase[] }) => (
    <div data-testid="mock-archive-cases-table">{cases.length}</div>
  ),
}));

const defaultProps: FundsTableProps = {
  funds: [
    {
      id: '1',
      fundNumber: 1,
      name: 'Фонд 1',
      descriptions: 10,
      cases: 20,
      dates: '1990 - 2000',
      status: BaseContentStatuses.Published,
      updatedAt: '2023-01-01',
    },
  ],
  hasActiveSearch: false,
  hasActiveStatusFilter: false,
};

const renderComponent = (overrides?: Partial<FundsTableProps>) => {
  return render(<FundsTable {...defaultProps} {...overrides} />);
};

const fund = defaultProps.funds[0];
const rowWithActions = {
  type: 'individual', id: fund.id, plainData: {
    ...defaultProps.funds[0], editAction: {
      editHref: `/archive/fund/${fund.id}/edit`, editLabel: `Редагувати фонд Фонд ${fund.id}`
    },

    menuActions: {
      menuItems: [{ items: [{ id: 'edit', text: { name: 'Редагувати' }, href: `/archive/fund/${fund.id}/edit` }, { id: 'share', text: { name: 'Поширити' }, href: `/archive/fund/${fund.id}/share` }] }, { items: [{ id: 'delete', text: { name: 'Видалити' } }] }], menuTriggerLabel: `Дії для фонду Фонд ${fund.id}`
    }
  },
};

const buildCase = (overrides?: Partial<ArchiveCase>): ArchiveCase => ({
  id: 'case-1',
  name: 'Справа 1',
  fundId: fund.id,
  cipher: '1-1-1',
  caseNumber: 1,
  descriptionNumber: 1,
  sheetsNumber: 5,
  editCaseDate: '1995',
  editCaseDescriptions: 'desc',
  detailedCaseDescription: 'detailed',
  status: BaseContentStatuses.Published,
  updatedAt: '2023-01-01',
  ...overrides,
});

describe('ArchiveFundsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all columns and rows with funds data', () => {
    renderComponent();

    expect(screen.getByTestId('mock-table-layout')).toBeInTheDocument();
    expect(screen.getByTestId('mock-table-layout-columns')).toBeInTheDocument();
    expect(screen.getByTestId('mock-table-layout-data')).toBeInTheDocument();
    expect(screen.getByTestId(`mock-table-layout-row-${fund.id}`)).toHaveTextContent(JSON.stringify(rowWithActions));
  });

  it.each([
    { column: 'fundNumber', value: ARCHIVE_FUNDS_TABLE_HEADERS.fund },
    { column: 'name', value: ARCHIVE_FUNDS_TABLE_HEADERS.name },
    { column: 'descriptionsCount', value: ARCHIVE_FUNDS_TABLE_HEADERS.descr },
    { column: 'casesCount', value: ARCHIVE_FUNDS_TABLE_HEADERS.cases },
    { column: 'dates', value: ARCHIVE_FUNDS_TABLE_HEADERS.dates },
  ])('should render the $column column with value $value', ({ column, value }) => {
    renderComponent();
    expect(screen.getByTestId(`mock-table-layout-column-${column}`)).toHaveTextContent(value);
  });

  it.each([
    { cell: 'fundNumber', value: String(fund.fundNumber) },
    { cell: 'name', value: fund.name },
    { cell: 'descriptionsCount', value: String(fund.descriptions) },
    { cell: 'casesCount', value: String(fund.cases) },
    { cell: 'dates', value: fund.dates },
    { cell: 'status', value: undefined },
    { cell: 'actions', value: undefined },
  ])('should render the $cell cell with value $value', ({ cell, value }) => {
    renderComponent();
    if (value) {
      expect(screen.getByTestId(`mock-cell-${cell}`)).toHaveTextContent(value);
    } else {
      expect(screen.getByTestId(`mock-cell-${cell}`)).toBeInTheDocument();
    }
  });

  describe('Delete Fund Flow', () => {
    it('should handle opening the delete modal, closing it, and confirming deletion', async () => {
      const user = userEvent.setup();
      const onDeletedMock = jest.fn();
      renderComponent({ onDeleted: onDeletedMock });

      await user.click(screen.getByTestId('mock-delete-confirm'));
      expect(mockDeleteFund).not.toHaveBeenCalled();

      await user.click(screen.getByTestId('action-delete'));
      expect(screen.getByTestId('mock-delete-modal')).toHaveAttribute('data-open', 'true');
      expect(screen.getByText(new RegExp(`Ви впевнені, що хочете видалити фонд «${fund.name}»\\?`))).toBeInTheDocument();

      await user.click(screen.getByTestId('mock-delete-close'));
      expect(screen.getByTestId('mock-delete-modal')).toHaveAttribute('data-open', 'false');

      await user.click(screen.getByTestId('action-delete'));
      await user.click(screen.getByTestId('mock-delete-confirm'));
      expect(mockDeleteFund).toHaveBeenCalledWith({ id: fund.id });
      expect(onDeletedMock).toHaveBeenCalled();
      expect(screen.getByTestId('mock-delete-modal')).toHaveAttribute('data-open', 'false');
    });

    it('should not call onDeleted if it is not provided', async () => {
      const user = userEvent.setup();
      renderComponent({ onDeleted: undefined });

      await user.click(screen.getByTestId('action-delete'));
      await user.click(screen.getByTestId('mock-delete-confirm'));
      expect(mockDeleteFund).toHaveBeenCalledWith({ id: fund.id });
      expect(screen.getByTestId('mock-delete-modal')).toHaveAttribute('data-open', 'false');
    });
  });

  it('should add the publish action for hidden funds and call onPublish when clicked', async () => {
    const user = userEvent.setup();
    const onPublishMock = jest.fn();
    const hiddenFund = { ...fund, status: BaseContentStatuses.Hidden };
    renderComponent({ funds: [hiddenFund], onPublish: onPublishMock });

    expect(screen.getByTestId(`mock-table-layout-row-${fund.id}`)).toHaveTextContent('Опублікувати');
    expect(screen.getByTestId(`mock-table-layout-row-${fund.id}`)).toHaveTextContent('"id":"publish"');

    await user.click(screen.getByTestId('action-publish'));
    expect(onPublishMock).toHaveBeenCalledWith(hiddenFund);
  });

  it('should not add the publish action for non-hidden funds', () => {
    renderComponent({ onPublish: jest.fn() });

    expect(screen.getByTestId(`mock-table-layout-row-${fund.id}`)).not.toHaveTextContent('Опублікувати');
    expect(screen.getByTestId(`mock-table-layout-row-${fund.id}`)).not.toHaveTextContent('"id":"publish"');
  });

  it('should add the unpublish action for published funds and call onUnpublish when clicked', async () => {
    const user = userEvent.setup();
    const onUnpublishMock = jest.fn();
    const publishedFund = { ...fund, status: BaseContentStatuses.Published };
    renderComponent({ funds: [publishedFund], onUnpublish: onUnpublishMock });

    expect(screen.getByTestId(`mock-table-layout-row-${fund.id}`)).toHaveTextContent('"id":"unpublish"');

    await user.click(screen.getByTestId('action-unpublish'));
    expect(onUnpublishMock).toHaveBeenCalledWith(publishedFund);
  });

  it('should not add the unpublish action for non-published funds', () => {
    renderComponent({
      funds: [{ ...fund, status: BaseContentStatuses.Hidden }],
      onUnpublish: jest.fn()
    });

    expect(screen.getByTestId(`mock-table-layout-row-${fund.id}`)).not.toHaveTextContent('"id":"unpublish"');
  });

  it('should not add the unpublish action when no unpublish handler is provided', () => {
    renderComponent({ funds: [{ ...fund, status: BaseContentStatuses.Published }] });

    expect(screen.getByTestId(`mock-table-layout-row-${fund.id}`)).not.toHaveTextContent('"id":"unpublish"');
  });

  describe('should render state UIs', () => {
    it('should render the "not created yet" fallback when there are no funds and no active criteria', () => {
      renderComponent({ funds: [], hasActiveSearch: false, hasActiveStatusFilter: false });

      expect(screen.getByTestId('mock-empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('mock-empty-state-title')).toHaveTextContent(ARCHIVE_EMPTY_STATE_TITLE);
      expect(screen.getByTestId('mock-empty-state-description')).toHaveTextContent(ARCHIVE_EMPTY_STATE_DESCRIPTION);
    });

    it('should render the no search results fallback when search is active (with or without status filter)', () => {
      renderComponent({ funds: [], hasActiveSearch: true, hasActiveStatusFilter: false });

      expect(screen.getByTestId('mock-empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('mock-empty-state-title')).toHaveTextContent(ARCHIVE_EMPTY_STATE_NO_RESULTS_TITLE);
      expect(screen.getByTestId('mock-empty-state-description')).toHaveTextContent(ARCHIVE_EMPTY_STATE_NO_RESULTS_DESCRIPTION);
    });

    it('should render the no search results fallback when both search and status filter are active', () => {
      renderComponent({ funds: [], hasActiveSearch: true, hasActiveStatusFilter: true });

      expect(screen.getByTestId('mock-empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('mock-empty-state-title')).toHaveTextContent(ARCHIVE_EMPTY_STATE_NO_RESULTS_TITLE);
      expect(screen.getByTestId('mock-empty-state-description')).toHaveTextContent(ARCHIVE_EMPTY_STATE_NO_RESULTS_DESCRIPTION);
    });

    it('should render the status-only fallback when only the status filter is active', () => {
      renderComponent({ funds: [], hasActiveSearch: false, hasActiveStatusFilter: true });

      expect(screen.getByTestId('mock-empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('mock-empty-state-title')).toHaveTextContent(ARCHIVE_EMPTY_STATE_NO_STATUS_MATCH_TITLE);
    });
  });

  describe('non-grouped mode with cases', () => {
    it('should render only the cases table when there are no funds but cases exist', () => {
      renderComponent({ funds: [], cases: [buildCase()] });

      expect(screen.queryByTestId('mock-table-layout')).not.toBeInTheDocument();
      expect(screen.getByTestId('mock-archive-cases-table')).toBeInTheDocument();
    });

    it('should render both the funds table and the cases table when both are provided', () => {
      renderComponent({ cases: [buildCase()] });

      expect(screen.getByTestId('mock-table-layout')).toBeInTheDocument();
      expect(screen.getByTestId('mock-archive-cases-table')).toBeInTheDocument();
    });
  });

  describe('grouped mode (groupCasesByFund)', () => {
    it('should render a fund as a group row with its matching case as a sub-row', () => {
      const matchingCase = buildCase({ fundId: fund.id });
      renderComponent({ groupCasesByFund: true, cases: [matchingCase] });

      expect(screen.getByTestId(`mock-table-layout-group-${fund.id}`)).toBeInTheDocument();
      expect(screen.getByTestId(`mock-table-layout-subrow-${matchingCase.id}`)).toBeInTheDocument();
      expect(screen.getByTestId(`mock-group-cell-name-${fund.id}`)).toHaveTextContent(fund.name);
      expect(screen.getByTestId(`mock-sub-cell-name-${matchingCase.id}`)).toHaveTextContent(matchingCase.name);
    });

    it('should render a case with no matching fund as an orphan individual row', () => {
      const orphanCase = buildCase({ id: 'case-orphan', fundId: 'missing-fund' });
      renderComponent({ groupCasesByFund: true, cases: [orphanCase] });

      expect(screen.getByTestId(`mock-table-layout-row-${orphanCase.id}`)).toBeInTheDocument();
      expect(screen.getByTestId('mock-cell-name')).toHaveTextContent(orphanCase.name);
      expect(screen.getByTestId('mock-cell-fundNumber')).toHaveTextContent(orphanCase.cipher);
    });

    it('should render the delete-fund modal and the case row modals', () => {
      renderComponent({ groupCasesByFund: true, cases: [buildCase()] });

      expect(screen.getByTestId('mock-delete-modal')).toBeInTheDocument();
      expect(screen.getByTestId('mock-case-row-modals')).toBeInTheDocument();
    });
  });
});