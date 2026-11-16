import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import { Gapcursor } from '@tiptap/extensions';
import type { JSONContent } from '@tiptap/react';

export const REQUISITES_TABLE_INITIAL_ROWS = 2;

const createRequisitesTableRow = (): JSONContent => ({
  type: 'tableRow',
  content: [
    { type: 'tableHeader', content: [{ type: 'paragraph' }] },
    { type: 'tableCell', content: [{ type: 'paragraph' }] }
  ]
});

export const createRequisitesTable = (rows = REQUISITES_TABLE_INITIAL_ROWS): JSONContent[] => [
  { type: 'table', content: Array.from({ length: rows }, createRequisitesTableRow) },
  { type: 'paragraph' }
];

export const requisitesTableExtensions = [
  Table.configure({ resizable: false, allowTableNodeSelection: false }),
  TableRow,
  TableHeader.extend({ content: 'paragraph+' }),
  TableCell.extend({ content: 'paragraph+' }),
  Gapcursor
];