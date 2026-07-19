import { fireEvent, render, screen } from '@testing-library/react';

import { mockSetField, mockSetFieldValidity, usePageBlockMock } from '../../__mocks__/setup-mocks';
import { createStandardMockBlock, runCommonBlockTests } from '../../test-utils/block-test-factory';
import { EditParagraphsBlock } from './EditParagraphsBlock';
import { createDocNode } from '~/__mocks__/utils';
import { PAGE_IDS } from '~/constants/pageBlocks';


const mockBlockId = 'intro_block' as any;
const mockTitle = 'Вступ';
describe('EditParagraphsBlock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  runCommonBlockTests({
    Component: () => <EditParagraphsBlock blockId={mockBlockId} title={mockTitle} />,
    mockBlock: createStandardMockBlock().block,
    checkParagraph: true,
    checkGrip: true,
    checkToggleVisibility: true,
    blockId: mockBlockId,
  });
  it('should render a correct title if provided', () => {
    const blockWithoutTitle = { ...createStandardMockBlock().block, title: undefined };
    usePageBlockMock.mockReturnValue({ block: blockWithoutTitle });

    render(<EditParagraphsBlock blockId={mockBlockId} title={mockTitle} />);
    expect(screen.getByText(mockTitle)).toBeInTheDocument();
  });
  it('should update the section title via onTitleChange, merging into the existing localized title', () => {
    usePageBlockMock.mockReturnValue({ block: createStandardMockBlock().block });

    render(<EditParagraphsBlock blockId={mockBlockId} title={mockTitle} />);

    fireEvent.click(screen.getByTestId('trigger-change-Заголовок секції'));

    expect(mockSetField).toHaveBeenCalledWith(
      PAGE_IDS.PRIVACY_POLICY,
      mockBlockId,
      'title',
      expect.objectContaining({ uk: createDocNode('Updated Заголовок секції') })
    );
  });

  it('should update a paragraph via onChange, merging the updated value into the description content array', () => {
    usePageBlockMock.mockReturnValue({ block: createStandardMockBlock().block });

    render(<EditParagraphsBlock blockId={mockBlockId} title={mockTitle} />);
    fireEvent.click(screen.getByTestId('trigger-change-Текст 1 абзацу'));

    expect(mockSetField).toHaveBeenCalledWith(
      PAGE_IDS.PRIVACY_POLICY,
      mockBlockId,
      'description',
      expect.objectContaining({
        uk: expect.objectContaining({
          content: [createDocNode('Updated Текст 1 абзацу')]
        })
      })
    );
  });

  it('should mark the title as invalid after blur when it is empty, and clear the flag on unmount', () => {
    usePageBlockMock.mockReturnValue({
      block: { ...createStandardMockBlock().block, title: { uk: { type: 'doc', content: [] } } }
    });

    const { unmount } = render(<EditParagraphsBlock blockId={mockBlockId} title={mockTitle} />);

    fireEvent.click(screen.getByTestId('trigger-blur-Заголовок секції'));

    expect(screen.getByTestId('textfield-error-Заголовок секції')).toBeInTheDocument();
    expect(mockSetFieldValidity).toHaveBeenCalledWith(`${PAGE_IDS.PRIVACY_POLICY}:${mockBlockId}:title`, true);

    unmount();

    expect(mockSetFieldValidity).toHaveBeenLastCalledWith(`${PAGE_IDS.PRIVACY_POLICY}:${mockBlockId}:title`, false);
  });

  it('should return null if block does not have description or content is empty', () => {
    usePageBlockMock.mockReturnValue({
      block: { description: { uk: { type: 'doc', content: [] }, en: { type: 'doc', content: [] } } }
    });

    render(<EditParagraphsBlock blockId={mockBlockId} title={mockTitle} />);

    expect(screen.queryByTestId('collapsible-block')).not.toBeInTheDocument();
  });
});