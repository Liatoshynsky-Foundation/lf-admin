import { render, screen } from '@testing-library/react';

import { FundsTable, FundsTableProps } from './ArchiveFundsTable';
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

jest.mock('~/shared/components/empty-state', () => ({
  EmptyState: ({ title, description }: EmptyStateProps) => (
    <div data-testid="mock-empty-state">
      <div data-testid="mock-empty-state-title">{title}</div>
      <div data-testid="mock-empty-state-description">{description}</div>
    </div>
  ),
}));

jest.mock('~/shared/components/table-layout/components/RowActions');
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
        {data
          .filter((item) => item.type === 'individual')
          .map((item) => (
            <div key={item.id} data-testid={`mock-table-layout-row-${item.id}`}>
              {JSON.stringify(item)}
              {columns.map((col) => (
                <span key={col.id} data-testid={`mock-cell-${col.id}`}>
                  {col.renderPlain ? col.renderPlain(item.plainData) : null}
                </span>
              ))}
            </div>
          ))}
      </div>
    </div>
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

describe('ArchiveFundsTable', () => {
  it('should render all columns and rows with funds data', () => {
    renderComponent();

    expect(screen.getByTestId('mock-table-layout')).toBeInTheDocument();
    expect(screen.getByTestId('mock-table-layout-columns')).toBeInTheDocument();
    expect(screen.getByTestId('mock-table-layout-data')).toBeInTheDocument();
    expect(screen.getByTestId('mock-table-layout-row-1')).toHaveTextContent(JSON.stringify(rowWithActions));
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
});
