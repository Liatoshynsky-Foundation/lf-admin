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
  menuActions?: { menuItems: readonly MenuItem[]; menuTriggerLabel: string };
};

type GroupHeaderData = {
  numberLabel: string;
  title: string;
  genre: string;
  startDate: string;
  endDate?: string;
  status: BaseContentStatuses;
} & ActionFields;

type GroupSubRowData = {
  id: string;
  title: string;
  year: string;
};

type IndividualRowData = {
  id: string;
  title: string;
  year: string;
  genre: string;
  status: BaseContentStatuses;
} & ActionFields;

const MOCK_WORK_MENU_ITEMS: readonly MenuItem[] = [
  { id: 'edit', label: 'Редагувати' },
  { id: 'delete', label: 'Видалити', danger: true }
];

const columns: readonly ColumnDef<GroupHeaderData, GroupSubRowData, IndividualRowData>[] = [
  {
    id: 'group',
    headerLabel: 'Номер',
    width: '40px',
    renderGroup: (g) => g.numberLabel
  },
  {
    id: 'title',
    headerLabel: 'Назва',
    width: 'minmax(320px, 1fr)',
    renderGroup: (g) => g.title,
    renderSub: (w) => w.title,
    renderPlain: (w) => w.title
  },
  {
    id: 'genre',
    headerLabel: 'Жанр',
    width: '106px',
    renderGroup: (g) => g.genre,
    renderPlain: (w) => w.genre
  },
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
    renderGroup: (g) => <StatusBadge status={g.status} />,
    renderPlain: (w) => <StatusBadge status={w.status} />
  },
  {
    id: 'actions',
    headerLabel: '',
    width: '80px',
    align: 'right',
    renderGroup: (g) => <RowActions editAction={g.editAction} menuActions={g.menuActions} />,
    renderSub: (w) => (
      <RowActions
        menuActions={{
          menuItems: MOCK_WORK_MENU_ITEMS,
          menuTriggerLabel: `Дії твору ${w.title}`
        }}
      />
    ),
    renderPlain: (w) => <RowActions editAction={w.editAction} menuActions={w.menuActions} />
  }
];

const mockGroupsOnly: BaseRowData<GroupHeaderData, GroupSubRowData, IndividualRowData>[] = [
  {
    type: 'group',
    id: 'group-1',
    groupData: {
      numberLabel: '1',
      title: 'Антологія класичної музики (Група)',
      genre: 'Classical',
      startDate: '2020',
      endDate: '2022',
      status: BaseContentStatuses.Draft,
      editAction: { editHref: '#', editLabel: 'Редагувати групу' },
      menuActions: { menuItems: MOCK_WORK_MENU_ITEMS, menuTriggerLabel: 'меню групи' }
    },
    subRows: [
      { id: 'sub-1', title: 'Частина 1: Епоха бароко', year: '2020' },
      { id: 'sub-2', title: 'Частина 2: Класицизм', year: '2021' }
    ]
  },
  {
    type: 'group',
    id: 'group-2',
    groupData: {
      numberLabel: '2',
      title: 'Трилогія ретроспектив',
      genre: 'Jazz',
      startDate: '2024',
      status: BaseContentStatuses.Published,
      editAction: { editHref: '#', editLabel: 'Редагувати групу' },
      menuActions: { menuItems: MOCK_WORK_MENU_ITEMS, menuTriggerLabel: 'меню групи' }
    },
    subRows: [{ id: 'sub-3', title: 'Сесія I: Витоки', year: '2024' }]
  }
];

const mockIndividualsOnly: BaseRowData<GroupHeaderData, GroupSubRowData, IndividualRowData>[] = [
  {
    type: 'individual',
    id: 'individual-1',
    plainData: {
      id: 'individual-1',
      title: 'Окремий музичний твір (Поодинокий)',
      genre: 'Jazz',
      year: '2023',
      status: BaseContentStatuses.Published,
      editAction: { editHref: '#', editLabel: 'Редагувати твір' },
      menuActions: { menuItems: MOCK_WORK_MENU_ITEMS, menuTriggerLabel: 'меню елемента' }
    }
  },
  {
    type: 'individual',
    id: 'individual-2',
    plainData: {
      id: 'individual-2',
      title: 'Сингл року',
      genre: 'Classical',
      year: '2025',
      status: BaseContentStatuses.Draft,
      editAction: { editHref: '#', editLabel: 'Редагувати твір' },
      menuActions: { menuItems: [], menuTriggerLabel: 'меню елемента' }
    }
  }
];

const mockAllData = [...mockGroupsOnly, ...mockIndividualsOnly];

const meta: Meta<typeof TableLayout> = {
  title: 'Shared/TableLayout',
  component: TableLayout,
  tags: ['autodocs'],
  argTypes: {
    data: {
      control: 'object',
      description: 'Array of items supporting both nested groups and individual rows.'
    },
    columns: {
      control: 'object',
      description:
        'Column definitions containing widths, headers, alignment, right/left dividers and type-specific render functions.'
    }
  },
  parameters: {
    docs: {
      description: {
        component: `
A flexible grid table designed to display two types of content structures:

* **Group Mode (\`type: 'group'\`)** renders a parent group header with collapsible sub-rows.
* **Individual Mode (\`type: 'individual'\`)** for standalone items without nesting.

Each column handles its own layout using explicit renderers (\`renderGroup\`, \`renderSub\`, \`renderPlain\`).
        `
      }
    }
  },
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

export const Default: Story = {
  args: {
    columns,
    data: mockAllData
  }
};

export const WithGroupsOnly: Story = {
  args: {
    columns,
    data: mockGroupsOnly
  }
};

export const WithIndividualsOnly: Story = {
  args: {
    columns,
    data: mockIndividualsOnly
  }
};

export const Empty: Story = {
  args: {
    columns,
    data: []
  }
};
