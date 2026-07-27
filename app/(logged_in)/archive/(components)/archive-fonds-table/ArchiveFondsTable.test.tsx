import { render, screen } from '@testing-library/react';

import { FondsTable, FondsTableProps } from './ArchiveFondsTable';
import { ARCHIVE_EMPTY_STATE_DESCRIPTION, ARCHIVE_EMPTY_STATE_NO_RESULTS_DESCRIPTION, ARCHIVE_EMPTY_STATE_NO_RESULTS_TITLE, ARCHIVE_EMPTY_STATE_TITLE } from '~/constants/archive';
import { BaseRowData, ColumnDef } from '~/shared/components/table-layout/row-variants/Row.types';
import { BaseContentStatuses } from '~/types/enums/common.enums';

type EmptyStateProps = {
  title: string;
  description: string;
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

const defaultProps: FondsTableProps = {
  fonds: [
    {
      id: '1',
      fondNumber: 1,
      name: 'Фонд 1',
      descriptions: 10,
      cases: 20,
      dates: '1990 - 2000',
      status: BaseContentStatuses.Published,
      updatedAt: '2023-01-01',
    },
  ],
  hasActiveCriteria: false,
};

const renderComponent = (overrides?: Partial<FondsTableProps>) => {
  return render(<FondsTable {...defaultProps} {...overrides} />);
};

describe('ArchiveFondsTable', () => {
  it('should render all columns and rows with fonds data', () => {
    renderComponent();
    const fond = defaultProps.fonds[0];
    const rowWithActions = {
      type: 'individual', id: fond.id, plainData: {
        ...defaultProps.fonds[0], editAction: {
          editHref: `/archive/fond/${fond.id}/edit`, editLabel: `Редагувати фонд Фонд ${fond.id}`
        },

        menuActions: {
          menuItems: [{ items: [{ id: 'edit', text: { name: 'Редагувати' }, href: `/archive/fond/${fond.id}/edit` }, { id: 'share', text: { name: 'Поширити' }, href: `/archive/fond/${fond.id}/share` }] }, { items: [{ id: 'delete', text: { name: 'Видалити' } }] }], menuTriggerLabel: `Дії для фонду Фонд ${fond.id}`
        }
      },
    };


    expect(screen.getByTestId('mock-table-layout')).toBeInTheDocument();

    expect(screen.getByTestId('mock-table-layout-columns')).toBeInTheDocument();
    expect(screen.getByTestId('mock-table-layout-column-fondId')).toHaveTextContent('Фонд');
    expect(screen.getByTestId('mock-table-layout-column-name')).toHaveTextContent('Назва фонду');
    expect(screen.getByTestId('mock-table-layout-column-descriptionsCount')).toHaveTextContent('Описи');
    expect(screen.getByTestId('mock-table-layout-column-casesCount')).toHaveTextContent('Справи');
    expect(screen.getByTestId('mock-table-layout-column-dates')).toHaveTextContent('Дати утворення');
    expect(screen.getByTestId('mock-table-layout-column-status')).toBeInTheDocument();
    expect(screen.getByTestId('mock-table-layout-column-actions')).toBeInTheDocument();

    expect(screen.getByTestId('mock-table-layout-data')).toBeInTheDocument();
    expect(screen.getByTestId('mock-table-layout-row-1')).toHaveTextContent(JSON.stringify(rowWithActions));

    expect(screen.getByTestId('mock-cell-fondId')).toHaveTextContent(fond.id);
    expect(screen.getByTestId('mock-cell-name')).toHaveTextContent(fond.name);
    expect(screen.getByTestId('mock-cell-descriptionsCount')).toHaveTextContent(String(fond.descriptions));
    expect(screen.getByTestId('mock-cell-casesCount')).toHaveTextContent(String(fond.cases));
    expect(screen.getByTestId('mock-cell-dates')).toHaveTextContent(fond.dates);
    expect(screen.getByTestId('mock-cell-status')).toBeInTheDocument();
    expect(screen.getByTestId('mock-cell-actions')).toBeInTheDocument();
  });
  describe('should render state UIs', () => {
    it('should render the no search results fallback if rows.length is 0 and hasActiveCriteria is true', () => {
      renderComponent({ hasActiveCriteria: true, fonds: [] });

      expect(screen.getByTestId('mock-empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('mock-empty-state-title')).toHaveTextContent(ARCHIVE_EMPTY_STATE_NO_RESULTS_TITLE);
      expect(screen.getByTestId('mock-empty-state-description')).toHaveTextContent(ARCHIVE_EMPTY_STATE_NO_RESULTS_DESCRIPTION);
    });
    it('should render the not fond fallback if rows.length is 0 and hasActiveCriteria is false', () => {
      renderComponent({ fonds: [] });

      expect(screen.getByTestId('mock-empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('mock-empty-state-title')).toHaveTextContent(ARCHIVE_EMPTY_STATE_TITLE);
      expect(screen.getByTestId('mock-empty-state-description')).toHaveTextContent(ARCHIVE_EMPTY_STATE_DESCRIPTION);
    });
  });
});
