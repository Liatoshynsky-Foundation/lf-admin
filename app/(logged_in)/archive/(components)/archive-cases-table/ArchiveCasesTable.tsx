'use client';

import type { ArchiveCase } from '../archive-funds-table/ArchiveFundsTable';
import { styles } from './ArchiveCasesTable.styles';
import { createCaseTableColumns } from '~/shared/components/table-layout/columns/caseTableColumns';
import { TableLayout } from '~/shared/components/table-layout/TableLayout';
import { useArchiveCaseRowActions } from '~/shared/hooks/use-archive-case-row-actions/useArchiveCaseRowActions';

const columns = createCaseTableColumns(styles.cipherText);

export interface ArchiveCasesTableProps {
  cases: ArchiveCase[];
  onCaseChanged?: () => Promise<unknown>;
}

export const ArchiveCasesTable = ({ cases, onCaseChanged }: ArchiveCasesTableProps) => {
  const { getCaseRow, caseRowModals } = useArchiveCaseRowActions(onCaseChanged);

  const rows = cases.map((item) => {
    const row = getCaseRow(item);

    return {
      type: 'individual' as const,
      id: item.id,
      plainData: {
        id: item.id,
        cipher: row.cipher,
        caseName: row.name,
        sheetsNumber: item.sheetsNumber,
        caseDate: row.caseDate,
        caseDescription: item.editCaseDescriptions,
        updatedAt: row.updatedAt,
        status: row.status,
        editAction: row.editAction,
        menuActions: row.menuActions
      }
    };
  });

  return (
    <>
      <TableLayout data={rows} columns={columns} withoutFirstColOffset={true} />
      {caseRowModals}
    </>
  );
};
