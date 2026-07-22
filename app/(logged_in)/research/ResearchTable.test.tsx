import { Box } from '@mui/material';
import { render } from '@testing-library/react';
import React from 'react';

import type { ResearchWork } from './research.mock';
import { ResearchTable } from './ResearchTable';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const mockTableLayout = jest.fn();

jest.mock('~/shared/components/table-layout/TableLayout', () => ({
  TableLayout: (props: unknown) => {
    mockTableLayout(props);
    return <Box data-testid="table-layout" />;
  }
}));

jest.mock('~/shared/components/table-layout/components/StatusBadge', () => ({
  StatusBadge: ({ status }: { status: string }) => <span data-testid="status-badge">{status}</span>
}));

jest.mock('~/shared/components/table-layout/components/RowActions', () => ({
  RowActions: () => <span data-testid="row-actions" />
}));

const work: ResearchWork = {
  id: 'work-1',
  author: 'Архимович Лідія',
  bibliographicDescription: 'Архимович, Лідія. Шляхи розвитку української радянської опери.',
  year: '1970',
  keywords: '',
  status: BaseContentStatuses.Published,
  createdAt: '2025-09-01T10:00:00.000Z',
  updatedAt: '2025-09-11T10:00:00.000Z',
  publishedAt: '2025-09-11T10:00:00.000Z'
};

const secondWork: ResearchWork = {
  id: 'work-2',
  author: 'Бєлза Ігор',
  bibliographicDescription: 'Бєлза, Ігор. Творчість Б. М. Лятошинського.',
  year: '1947',
  keywords: '',
  status: BaseContentStatuses.Hidden,
  createdAt: '2025-09-01T10:00:00.000Z',
  updatedAt: '2025-09-10T10:00:00.000Z'
};

describe('ResearchTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maps each work into an individual row with correct id and plainData', () => {
    render(<ResearchTable works={[work]} />);

    const { data } = mockTableLayout.mock.calls[0][0];

    expect(data).toHaveLength(1);
    expect(data[0]).toMatchObject({
      type: 'individual',
      id: 'work-1',
      plainData: expect.objectContaining({
        author: 'Архимович Лідія',
        bibliographicDescription: 'Архимович, Лідія. Шляхи розвитку української радянської опери.',
        year: '1970',
        status: BaseContentStatuses.Published
      })
    });
  });

  it('builds correct edit and menu actions for each work', () => {
    render(<ResearchTable works={[work]} />);

    const { data } = mockTableLayout.mock.calls[0][0];
    const { plainData } = data[0];

    expect(plainData.editAction).toEqual({
      editHref: '/research/work-1/edit',
      editLabel: 'Редагувати роботу Архимович Лідія'
    });

    expect(plainData.menuActions.menuTriggerLabel).toBe('Дії для роботи Архимович Лідія');
    expect(plainData.menuActions.menuItems).toEqual([
      {
        items: [
          { id: 'edit', text: { name: 'Редагувати' }, href: '/research/work-1/edit' },
          { id: 'share', text: { name: 'Поширити' } }
        ]
      },
      {
        items: [{ id: 'delete', text: { name: 'Видалити' } }]
      }
    ]);
  });

  it('renders one row per work, preserving order', () => {
    render(<ResearchTable works={[work, secondWork]} />);

    const { data } = mockTableLayout.mock.calls[0][0];

    expect(data).toHaveLength(2);
    expect(data.map((row: { id: string }) => row.id)).toEqual(['work-1', 'work-2']);
  });

  it('renders an empty table when no works are provided', () => {
    render(<ResearchTable works={[]} />);

    const { data } = mockTableLayout.mock.calls[0][0];

    expect(data).toHaveLength(0);
  });

  it('passes the correct columns to TableLayout', () => {
    render(<ResearchTable works={[]} />);

    expect(mockTableLayout).toHaveBeenCalledTimes(1);

    const { columns } = mockTableLayout.mock.calls[0][0];

    expect(columns).toHaveLength(6);
    expect(columns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'author', headerLabel: 'Автор' }),
        expect.objectContaining({ id: 'description', headerLabel: 'Бібліографічний опис' }),
        expect.objectContaining({ id: 'year', headerLabel: 'Рік' }),
        expect.objectContaining({ id: 'keywords', headerLabel: 'Ключові слова' }),
        expect.objectContaining({ id: 'status', headerLabel: 'Статус' }),
        expect.objectContaining({ id: 'actions', headerLabel: '' })
      ])
    );
  });

  it('renders status column with left and right dividers', () => {
    render(<ResearchTable works={[]} />);

    const { columns } = mockTableLayout.mock.calls[0][0];
    const statusColumn = columns.find((col: { id: string }) => col.id === 'status');

    expect(statusColumn.hasLeftDivider).toBe(true);
    expect(statusColumn.hasRightDivider).toBe(true);
    expect(statusColumn.align).toBe('center');
  });
});
