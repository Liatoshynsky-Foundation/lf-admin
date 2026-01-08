// import { render, screen } from '@testing-library/react';

// import { BlockNoteEditor } from './BlockNoteEditor';

// // Mock BlockNote modules
// jest.mock('@blocknote/react', () => ({
//   __esModule: true,
//   //eslint-disable-next-line
//   BlockNoteViewRaw: ({ editor, editable }: { editor: unknown; editable: boolean }) => (
//     <div data-testid="blocknote-view" data-editable={editable}>
//       BlockNote Editor Mock
//     </div>
//   ),
//   useCreateBlockNote: jest.fn(() => ({
//     document: [],
//     insertBlocks: jest.fn(),
//     removeBlocks: jest.fn(),
//     updateBlock: jest.fn()
//   }))
// }));

// jest.mock('@blocknote/core', () => ({
//   __esModule: true,
//   BlockNoteSchema: {
//     create: jest.fn(() => ({}))
//   },
//   defaultBlockSpecs: {}
// }));

// describe('BlockNoteEditor', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should render the editor component', () => {
//     render(<BlockNoteEditor />);

//     expect(screen.getByTestId('blocknote-view')).toBeInTheDocument();
//   });

//   it('should render with editable prop', () => {
//     render(<BlockNoteEditor editable={true} />);

//     const editor = screen.getByTestId('blocknote-view');
//     expect(editor).toHaveAttribute('data-editable', 'true');
//   });

//   it('should render with non-editable prop', () => {
//     render(<BlockNoteEditor editable={false} />);

//     const editor = screen.getByTestId('blocknote-view');
//     expect(editor).toHaveAttribute('data-editable', 'false');
//   });

//   it('should render with custom minHeight', () => {
//     const { container } = render(<BlockNoteEditor minHeight="800px" />);

//     const editorContainer = container.querySelector('div');
//     expect(editorContainer).toBeInTheDocument();
//   });

//   it('should handle onChange callback', () => {
//     const handleChange = jest.fn();
//     render(<BlockNoteEditor onChange={handleChange} />);

//     expect(screen.getByTestId('blocknote-view')).toBeInTheDocument();
//   });

//   it('should handle onSave callback', () => {
//     const handleSave = jest.fn();
//     render(<BlockNoteEditor onSave={handleSave} />);

//     expect(screen.getByTestId('blocknote-view')).toBeInTheDocument();
//   });

//   it('should accept initialContent prop', () => {
//     // Using null as initialContent to avoid complex Block type construction
//     render(<BlockNoteEditor initialContent={null} />);

//     expect(screen.getByTestId('blocknote-view')).toBeInTheDocument();
//   });

//   it('should render with custom placeholder', () => {
//     render(<BlockNoteEditor placeholder="Custom placeholder text" />);

//     expect(screen.getByTestId('blocknote-view')).toBeInTheDocument();
//   });
// });
