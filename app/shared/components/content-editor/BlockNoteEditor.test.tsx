import { render, screen } from '@testing-library/react';

jest.mock('@blocknote/core', () => ({
  BlockNoteSchema: {
    create: jest.fn(() => ({}))
  },
  defaultBlockSpecs: {},
  defaultInlineContentSpecs: {},
  defaultStyleSpecs: {}
}));

jest.mock('@blocknote/react', () => ({
  useCreateBlockNote: jest.fn(() => ({
    document: [],
    getTextCursorPosition: jest.fn(() => ({ block: {} })),
    insertBlocks: jest.fn()
  }))
}));

jest.mock('@blocknote/mantine', () => ({
  BlockNoteView: ({ editable }: { editable: boolean }) => (
    <div data-testid="blocknote-editor" data-editable={editable}>
      BlockNote Editor
    </div>
  )
}));

jest.mock('@blocknote/xl-multi-column', () => ({
  multiColumnDropCursor: {},
  withMultiColumn: jest.fn((schema) => schema)
}));

import { BlockNoteEditor } from './BlockNoteEditor';

describe('BlockNoteEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the editor after mounting', async () => {
    render(<BlockNoteEditor />);

    const editor = await screen.findByTestId('blocknote-editor');
    expect(editor).toBeInTheDocument();
    expect(editor).toHaveAttribute('data-editable', 'true');
  });

  it('should render the editor with custom props', async () => {
    const onChange = jest.fn();
    const onSave = jest.fn();

    render(
      <BlockNoteEditor
        onChange={onChange}
        onSave={onSave}
        placeholder="Custom placeholder"
        editable={false}
        minHeight="500px"
      />
    );

    const editor = await screen.findByTestId('blocknote-editor');
    expect(editor).toBeInTheDocument();
    expect(editor).toHaveAttribute('data-editable', 'false');
  });
});
