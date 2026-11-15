import { Editor, JSONContent } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';

import { createRequisitesTable, REQUISITES_TABLE_INITIAL_ROWS, requisitesTableExtensions } from './requisitesTable';

const createEditor = () =>
  new Editor({
    extensions: [Document.extend({ content: '(paragraph | table)+' }), Paragraph, Text, ...requisitesTableExtensions],
    content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Before' }] }] }
  });

const getTableRows = (editor: Editor): JSONContent[] =>
  editor.getJSON().content?.find((node) => node.type === 'table')?.content ?? [];

const getCellTypes = (row: JSONContent) => row.content?.map((cell) => cell.type);

const placeCursorInFirstCell = (editor: Editor) => {
  let cellPosition = 0;

  editor.state.doc.descendants((node, position) => {
    if (!cellPosition && node.type.name === 'tableCell') cellPosition = position + 2;
  });

  editor.commands.setTextSelection(cellPosition);
};

describe('requisitesTable', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = createEditor();
    editor.commands.setTextSelection(editor.state.doc.content.size);
    editor.chain().focus().insertContent(createRequisitesTable()).run();
  });

  afterEach(() => {
    editor.destroy();
  });

  it('creates a two-column table with parameter headers on the left and values on the right', () => {
    const [table, paragraphAfter] = createRequisitesTable();

    expect(table.type).toBe('table');
    expect(table.content).toHaveLength(REQUISITES_TABLE_INITIAL_ROWS);
    table.content?.forEach((row) => expect(getCellTypes(row)).toEqual(['tableHeader', 'tableCell']));
    expect(paragraphAfter).toEqual({ type: 'paragraph' });
  });

  it('keeps paragraphs before and after the inserted table', () => {
    const nodeTypes = editor.getJSON().content?.map((node) => node.type);

    expect(nodeTypes).toEqual(['paragraph', 'table', 'paragraph']);
  });

  it('adds a new row with a header cell and a value cell', () => {
    placeCursorInFirstCell(editor);

    editor.chain().focus().addRowAfter().run();

    const rows = getTableRows(editor);
    expect(rows).toHaveLength(REQUISITES_TABLE_INITIAL_ROWS + 1);
    rows.forEach((row) => expect(getCellTypes(row)).toEqual(['tableHeader', 'tableCell']));
  });

  it('deletes a row', () => {
    placeCursorInFirstCell(editor);

    editor.chain().focus().deleteRow().run();

    expect(getTableRows(editor)).toHaveLength(REQUISITES_TABLE_INITIAL_ROWS - 1);
  });

  it('disables manual column resizing', () => {
    const tableExtension = editor.extensionManager.extensions.find((extension) => extension.name === 'table');

    expect(tableExtension?.options.resizable).toBe(false);
  });

  it('allows only paragraphs inside table cells', () => {
    const { tableCell, tableHeader } = editor.schema.nodes;

    expect(tableCell.spec.content).toBe('paragraph+');
    expect(tableHeader.spec.content).toBe('paragraph+');
  });
});