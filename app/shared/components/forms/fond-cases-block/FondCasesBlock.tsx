'use client';

import { Box, Button, Typography } from '@mui/material';
import { Plus } from 'lucide-react';

import Badge from '../../badge/Badge';
import { styles } from './FondCasesBlock.styles';
import { ActionMenuGroups } from '~/shared/components/dropdown-menu/ActionMenu';
import { RowActions } from '~/shared/components/table-layout/components/RowActions';
import { ColumnDef } from '~/shared/components/table-layout/row-variants/Row.types';
import { TableLayout } from '~/shared/components/table-layout/TableLayout';
import { twoLineEllipsis } from '~/shared/components/table-layout/TableLayout.styles';

const FOND_CASES_LABEL = 'Справи в фонді';

type CaseRow = {
  id: string;
  cipher: string;
  caseName: string;
  sheetsNumber: number;
  caseDate: string;
  caseDescription: string;
  status: 'published' | 'hidden';
  editAction: { editHref: string; editLabel: string };
  menuActions: { menuItems: ActionMenuGroups; menuTriggerLabel: string };
};

const MOCK_CASES: CaseRow[] = [
  {
    id: '1',
    cipher: 'оп. 1  спр. 1',
    caseName: 'Документи про народження і освіту',
    sheetsNumber: 11,
    caseDate: '1922-1923',
    caseDescription: 'Метричні виписки, свідоцтва, студентські квитки, довідки...',
    status: 'published',
    editAction: { editHref: '/archive/fond/1/case/1/edit', editLabel: 'Редагувати справу' },
    menuActions: {
      menuTriggerLabel: 'Дії для справи',
      menuItems: [{ items: [{ id: 'delete', text: { name: 'Видалити' } }] }]
    }
  },
  {
    id: '2',
    cipher: 'оп. 1  спр. 1',
    caseName: 'Документи про народження і освіту',
    sheetsNumber: 11,
    caseDate: '1922-1923',
    caseDescription: 'Метричні виписки, свідоцтва, студентські квитки, довідки...',
    status: 'published',
    editAction: { editHref: '/archive/fond/1/case/2/edit', editLabel: 'Редагувати справу' },
    menuActions: {
      menuTriggerLabel: 'Дії для справи',
      menuItems: [{ items: [{ id: 'delete', text: { name: 'Видалити' } }] }]
    }
  }
];

const columns: readonly ColumnDef<never, never, CaseRow>[] = [
  {
    id: 'cipher',
    headerLabel: 'Шифр',
    width: '120px',
    align: 'left',
    renderPlain: (row) => (
      <Typography component="span" sx={styles.cipherText}>
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
    id: 'statusBadge',
    headerLabel: '',
    width: '48px',
    align: 'center',
    hasLeftDivider: true,
    hasRightDivider: true,
    renderPlain: (row) => (row.status === 'published' ? <Badge variant={row.status} /> : undefined)
  },
  {
    id: 'actions',
    headerLabel: '',
    width: '96px',
    align: 'right',
    renderPlain: (row) => <RowActions editAction={row.editAction} menuActions={row.menuActions} />
  }
];

const rows = MOCK_CASES.map((caseRow) => ({
  type: 'individual' as const,
  id: caseRow.id,
  plainData: caseRow
}));

export default function FondCasesBlock() {
  return (
    <Box sx={styles.container}>
      <Box sx={styles.header}>
        <Typography variant="h6" sx={styles.title}>
          {FOND_CASES_LABEL}
        </Typography>

        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          sx={styles.addButton}
          onClick={() => console.log('Додати справу клік')}
        >
          Додати справу
        </Button>
      </Box>

      <Box sx={styles.content}>
        <TableLayout data={rows} columns={columns} />
      </Box>
    </Box>
  );
}