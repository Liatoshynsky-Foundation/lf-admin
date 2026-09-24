'use client';

import type { SxProps, Theme } from '@mui/material';
import { Typography } from '@mui/material';

import { ActionMenuGroups } from '~/shared/components/dropdown-menu/ActionMenu';
import { RowActions } from '~/shared/components/table-layout/components/RowActions';
import { StatusBadge } from '~/shared/components/table-layout/components/StatusBadge';
import { ColumnDef } from '~/shared/components/table-layout/row-variants/Row.types';
import { twoLineEllipsis } from '~/shared/components/table-layout/TableLayout.styles';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export type CaseTableRow = {
  id: string;
  cipher: string;
  caseName: string;
  sheetsNumber: number;
  caseDate: string;
  caseDescription: string;
  updatedAt: string;
  status: BaseContentStatuses;
  editAction: { editHref?: string; editLabel: string; onEditClick?: () => void };
  menuActions: { menuItems: ActionMenuGroups; menuTriggerLabel: string };
};

export const createCaseTableColumns = (
  cipherTextSx: SxProps<Theme>
): readonly ColumnDef<never, never, CaseTableRow>[] => [
  {
    id: 'cipher',
    headerLabel: 'Шифр',
    width: '120px',
    align: 'left',
    renderPlain: (row) => (
      <Typography component="span" sx={cipherTextSx}>
        {row.cipher}
      </Typography>
    )
  },
  {
    id: 'caseName',
    headerLabel: 'Назва справи',
    width: 'minmax(260px, 1fr)',
    align: 'left',
    renderPlain: (row) => row.caseName
  },
  {
    id: 'sheetsNumber',
    headerLabel: 'Аркуші',
    width: '84px',
    align: 'left',
    renderPlain: (row) => row.sheetsNumber
  },
  {
    id: 'caseDate',
    headerLabel: 'Дати',
    width: '110px',
    align: 'left',
    renderPlain: (row) => row.caseDate
  },
  {
    id: 'caseDescription',
    headerLabel: 'Склад і зміст документів',
    width: 'minmax(240px, 1fr)',
    align: 'left',
    renderPlain: (row) => <Typography sx={twoLineEllipsis}>{row.caseDescription}</Typography>
  },
  {
    id: 'publishedAt',
    headerLabel: 'Статус',
    width: '60px',
    align: 'center',
    hasLeftDivider: true,
    hasRightDivider: true,
    renderPlain: (row) => <StatusBadge status={row.status} updatedAt={row.updatedAt} />
  },
  {
    id: 'actions',
    headerLabel: '',
    width: '96px',
    align: 'right',
    renderPlain: (row) => <RowActions editAction={row.editAction} menuActions={row.menuActions} />
  }
];