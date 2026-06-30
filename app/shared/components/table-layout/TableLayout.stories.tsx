'use client';

import { Box } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { RowActions } from './components/RowActions';
import { BaseRowData, ColumnDef, MenuItem } from './row-variants/Row.types';
import { TableLayout } from './TableLayout';
import { StatusBadge } from '~/shared/components/table-layout/components/StatusBadge';
import { BaseContentStatuses } from '~/types/enums/common.enums';

type ActionFields = {
  editAction?: { editHref: string; editLabel: string };
  menuActions?: { menuItems: readonly (readonly MenuItem[])[]; menuTriggerLabel: string };
};

type GroupHeaderData = {
  numberLabel: string;
  title: string;
  genre: string;
  startDate: string;
  endDate?: string;
  status: BaseContentStatuses;
  updatedAt: string;
} & ActionFields;

type GroupSubRowData = { id: string; title: string; year: string } & ActionFields;

type IndividualRowData = {
  id: string;
  title: string;
  year: string;
  genre: string;
  status: BaseContentStatuses;
  updatedAt: string;
} & ActionFields;

const mockItems: readonly (readonly MenuItem[])[] = [
  [
    { id: 'edit', label: 'Редагувати', href: '/edit' } as MenuItem,
    { id: 'delete', label: 'Видалити', onClick: () => {} } as MenuItem
  ]
];

const baseColumns: readonly ColumnDef<GroupHeaderData, GroupSubRowData, IndividualRowData>[] = [
  { id: 'group', headerLabel: 'Номер', width: '40px', renderGroup: (g) => g.numberLabel },
  {
    id: 'title',
    headerLabel: 'Назва',
    width: 'minmax(320px, 1fr)',
    renderGroup: (g) => g.title,
    renderSub: (w) => w.title,
    renderPlain: (w) => w.title
  },
  { id: 'genre', headerLabel: 'Жанр', width: '106px', renderGroup: (g) => g.genre, renderPlain: (w) => w.genre },
  {
    id: 'years',
    headerLabel: 'Роки',
    width: '104px',
    renderGroup: (g) => (g.endDate ? `${g.startDate} - ${g.endDate}` : g.startDate),
    renderPlain: (w) => w.year
  },
  {
    id: 'status',
    headerLabel: 'Статус',
    width: '100px',
    hasRightDivider: true,
    hasLeftDivider: true,
    align: 'center',
    renderGroup: (g) => <StatusBadge status={g.status} updatedAt={g.updatedAt} />,
    renderPlain: (w) => <StatusBadge status={w.status} updatedAt={w.updatedAt} />
  }
];

const actionsColumn = (width: string): ColumnDef<GroupHeaderData, GroupSubRowData, IndividualRowData> => {
  return {
    id: 'actions',
    headerLabel: '',
    width: width ?? '80px',
    align: 'right',
    renderGroup: (g) => <RowActions editAction={g.editAction} menuActions={g.menuActions} />,
    renderSub: (w) => <RowActions menuActions={w.menuActions} />,
    renderPlain: (w) => <RowActions editAction={w.editAction} menuActions={w.menuActions} />
  };
};

const columnsWithActions = [...baseColumns, actionsColumn('80px')];
const columnsWithSmallerActions = [...baseColumns, actionsColumn('40px')];

const createMockData = (
  withEdit: boolean,
  withMenu: boolean
): BaseRowData<GroupHeaderData, GroupSubRowData, IndividualRowData>[] => [
  {
    type: 'group',
    id: 'group-1',
    groupData: {
      numberLabel: '1',
      title: 'Група з підрядками',
      genre: 'Classical',
      startDate: '2020',
      endDate: '2022',
      status: BaseContentStatuses.Draft,
      updatedAt: '2026-06-20T10:00:00.000Z',
      ...(withEdit && { editAction: { editHref: '/edit', editLabel: 'Редагувати групу' } }),
      ...(withMenu && { menuActions: { menuItems: mockItems, menuTriggerLabel: 'меню групи' } })
    },
    subRows: [
      {
        id: 'sub-1',
        title: 'Частина 1: Епоха бароко',
        year: '2020',
        ...(withMenu && { menuActions: { menuItems: mockItems, menuTriggerLabel: 'Дії твору' } })
      }
    ]
  },
  {
    type: 'group',
    id: 'group-empty-subrows',
    groupData: {
      numberLabel: '2',
      title: 'Порожня група',
      genre: 'Pop',
      startDate: '2026',
      status: BaseContentStatuses.Published,
      updatedAt: '2026-06-24T15:30:00.000Z',
      ...(withEdit && { editAction: { editHref: '/edit', editLabel: 'Редагувати групу' } }),
      ...(withMenu && { menuActions: { menuItems: mockItems, menuTriggerLabel: 'меню групи' } })
    },
    subRows: []
  },
  {
    type: 'individual',
    id: 'individual-1',
    plainData: {
      id: 'individual-1',
      title: 'Окремий рядок',
      genre: 'Jazz',
      year: '2023',
      status: BaseContentStatuses.Published,
      updatedAt: '2026-06-25T02:59:27.000Z',
      ...(withEdit && { editAction: { editHref: '/edit', editLabel: 'Редагувати твір' } }),
      ...(withMenu && { menuActions: { menuItems: mockItems, menuTriggerLabel: 'меню елемента' } })
    }
  }
];

const mockAllData = createMockData(true, true);
const mockGroupsOnly = mockAllData.filter((item) => item.type === 'group');
const mockIndividualsOnly = mockAllData.filter((item) => item.type === 'individual');
const mockWithoutEditActions = createMockData(false, true);
const mockPureDataOnly = createMockData(false, false);

const meta: Meta<typeof TableLayout> = {
  title: 'Shared/TableLayout',
  component: TableLayout,
  tags: ['autodocs'],
  argTypes: { data: { control: 'object' }, columns: { control: 'object' } },
  decorators: [
    (Story) => (
      <Box sx={{ width: '100%', maxWidth: '1200px', p: 2 }}>
        <Story />
      </Box>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof TableLayout<GroupHeaderData, GroupSubRowData, IndividualRowData>>;

export const Default: Story = { args: { columns: columnsWithActions, data: mockAllData } };
export const WithGroupsOnly: Story = { args: { columns: columnsWithActions, data: mockGroupsOnly } };
export const WithIndividualsOnly: Story = { args: { columns: columnsWithActions, data: mockIndividualsOnly } };

export const WithoutEditActions: Story = {
  name: 'Without Edit Actions (Menu Only)',
  args: { columns: columnsWithSmallerActions, data: mockWithoutEditActions }
};

export const PureDataOnly: Story = {
  name: 'No Actions Column',
  args: { columns: baseColumns, data: mockPureDataOnly }
};

export const Empty: Story = { args: { columns: columnsWithActions, data: [] } };
