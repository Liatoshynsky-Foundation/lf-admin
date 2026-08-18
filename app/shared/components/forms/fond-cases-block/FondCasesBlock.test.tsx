import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import FondCasesBlock from './FondCasesBlock';

interface ColumnDefLike {
  id: string;
  headerLabel: string;
  renderPlain: (row: Record<string, unknown>) => ReactNode;
}

const capturedTableLayoutProps: { columns?: ColumnDefLike[]; data?: unknown[] } = {};

jest.mock('~/shared/components/table-layout/TableLayout', () => ({
  __esModule: true,
  TableLayout: (props: { columns: ColumnDefLike[]; data: { plainData: Record<string, unknown> }[] }) => {
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

jest.mock('../../badge/Badge', () => ({
  __esModule: true,
  default: ({ variant }: { variant: string }) => <span data-testid="badge">{variant}</span>
}));

jest.mock('~/shared/components/table-layout/components/RowActions', () => ({
  __esModule: true,
  RowActions: ({ editAction }: { editAction: { editLabel: string } }) => (
    <span data-testid="row-actions">{editAction.editLabel}</span>
  )
}));

describe('FondCasesBlock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedTableLayoutProps.columns = undefined;
    capturedTableLayoutProps.data = undefined;
  });

  it('renders the header, add button, and the two mock case rows', () => {
    render(<FondCasesBlock />);

    expect(screen.getByText('Справи в фонді')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Додати справу/ })).toBeInTheDocument();
    expect(screen.getByTestId('table-layout')).toBeInTheDocument();
    expect(screen.getByTestId('row-1')).toBeInTheDocument();
    expect(screen.getByTestId('row-2')).toBeInTheDocument();
  });

  it('logs to the console when the add-case button is clicked', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    render(<FondCasesBlock />);
    await user.click(screen.getByRole('button', { name: /Додати справу/ }));

    expect(consoleSpy).toHaveBeenCalledWith('Додати справу клік');
    consoleSpy.mockRestore();
  });

  it('renders the status badge for a published case', () => {
    render(<FondCasesBlock />);

    const badges = screen.getAllByTestId('badge');
    expect(badges.length).toBeGreaterThan(0);
    expect(badges[0]).toHaveTextContent('published');
  });

  it('renders no badge for a non-published status (covers the ternary branch)', () => {
    render(<FondCasesBlock />);

    const statusBadgeColumn = capturedTableLayoutProps.columns?.find((col) => col.id === 'statusBadge');
    expect(statusBadgeColumn).toBeDefined();

    const result = statusBadgeColumn?.renderPlain({ status: 'hidden' });
    expect(result).toBeUndefined();
  });

  it('renders every other column for a given row (full coverage of renderPlain functions)', () => {
    const row = {
      id: '99',
      cipher: 'оп. 2 спр. 5',
      caseName: 'Test Case',
      sheetsNumber: 3,
      caseDate: '1930',
      caseDescription: 'Опис справи',
      status: 'hidden',
      editAction: { editHref: '/x', editLabel: 'Редагувати справу' },
      menuActions: { menuTriggerLabel: 'Дії', menuItems: [] }
    };

    capturedTableLayoutProps.columns?.forEach((col) => {
      expect(() => col.renderPlain(row)).not.toThrow();
    });
  });
});