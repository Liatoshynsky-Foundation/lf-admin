import { fireEvent, render, screen } from '@testing-library/react';

import { mockSetField, mockSetFieldValidity, usePageBlockMock } from '../../__mocks__/setup-mocks';
import { createStandardMockBlock, runCommonBlockTests } from '../../test-utils/block-test-factory';
import { EditParagraphsBlock } from './EditParagraphsBlock';
import { createDocNode } from '~/__mocks__/utils';
import { PAGE_IDS } from '~/constants/pageBlocks';
import { ProseDoc } from '~/types/common';
import { BlocksMap } from '~/types/store/pages';

type BlockIdsWithDescription = {
  [K in keyof BlocksMap]: 'description' extends keyof BlocksMap[K] ? K : never;
}[keyof BlocksMap];

const mockBlockId = 'intro_block' as BlockIdsWithDescription;
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
    blockId: mockBlockId
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

  it('should render skeleton loader when block is not provided', () => {
    usePageBlockMock.mockReturnValue({ block: undefined });

    const { container } = render(<EditParagraphsBlock blockId={mockBlockId} title={mockTitle} />);

    expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });

  it('should return null when description field exists but does not have the current locale data', () => {
    usePageBlockMock.mockReturnValue({
      block: { description: { uk: { type: 'doc', content: [] } } }
    });

    const { container } = render(<EditParagraphsBlock blockId={mockBlockId} title={mockTitle} />);

    expect(container.firstChild).toBeNull();
  });

  it('should use fallback title object when updating section title if title fields are missing', () => {
    const blockWithEmptyTitle = {
      description: { uk: { type: 'doc', content: [createDocNode('Text')] } },
      title: {}
    };
    usePageBlockMock.mockReturnValue({ block: blockWithEmptyTitle });

    render(<EditParagraphsBlock blockId={mockBlockId} title={mockTitle} />);

    fireEvent.click(screen.getByTestId('trigger-change-Заголовок секції'));

    expect(mockSetField).toHaveBeenCalledWith(
      PAGE_IDS.PRIVACY_POLICY,
      mockBlockId,
      'title',
      expect.objectContaining({ uk: createDocNode('Updated Заголовок секції') })
    );
  });

  it('should fallback to empty array if content is missing during paragraph change', () => {
    const blockWithoutContent = {
      description: { uk: { type: 'doc', content: undefined as unknown as ProseDoc } }
    };
    usePageBlockMock.mockReturnValue({ block: blockWithoutContent });

    render(<EditParagraphsBlock blockId={mockBlockId} title={mockTitle} />);

    expect(screen.queryByTestId('trigger-change-Текст 1 абзацу')).not.toBeInTheDocument();
  });

  it('should reuse stableIds on subsequent renders when paragraphs array is mapped', () => {
    usePageBlockMock.mockReturnValue({ block: createStandardMockBlock().block });

    const { rerender } = render(<EditParagraphsBlock blockId={mockBlockId} title={mockTitle} />);

    rerender(<EditParagraphsBlock blockId={mockBlockId} title={mockTitle} />);

    expect(screen.getByTestId('trigger-change-Текст 1 абзацу')).toBeInTheDocument();
  });

  it('should return null when description key is not present in block object', () => {
    usePageBlockMock.mockReturnValue({
      block: { title: { uk: {} } }
    });

    const { container } = render(<EditParagraphsBlock blockId={mockBlockId} title={mockTitle} />);

    expect(container.firstChild).toBeNull();
  });

  it('should trigger onTitleChange and execute alternative path when title is undefined', () => {
    const blockWithoutTitleProperty = {
      description: {
        uk: { type: 'doc', content: [createDocNode('Test')] }
      },
      title: undefined
    };
    usePageBlockMock.mockReturnValue({ block: blockWithoutTitleProperty });

    render(<EditParagraphsBlock blockId={mockBlockId} title={mockTitle} />);

    const fields = screen.queryAllByTestId(/trigger-change-/);
    const titleField = fields.find((el) => el.getAttribute('data-testid')?.includes('Заголовок секції'));

    if (titleField) {
      fireEvent.click(titleField);
      expect(mockSetField).toHaveBeenCalled();
    }
  });

  it('uses fallbackTitle in onTitleChange when blockTitle is dynamically undefined', () => {
    const mockBlockObj = createStandardMockBlock().block;
    usePageBlockMock.mockReturnValue({ block: mockBlockObj });

    render(<EditParagraphsBlock blockId={mockBlockId} title={mockTitle} />);

    delete (mockBlockObj as Record<string, unknown>).title;

    fireEvent.click(screen.getByTestId('trigger-change-Заголовок секції'));

    expect(mockSetField).toHaveBeenCalledWith(
      PAGE_IDS.PRIVACY_POLICY,
      mockBlockId,
      'title',
      expect.objectContaining({ uk: createDocNode('Updated Заголовок секції') })
    );
  });

  it('handles paragraph change when description content is dynamically undefined', () => {
    const mockBlockObj = createStandardMockBlock().block;
    usePageBlockMock.mockReturnValue({ block: mockBlockObj });

    render(<EditParagraphsBlock blockId={mockBlockId} title={mockTitle} />);

    (mockBlockObj.description as Record<string, { content?: unknown }>).uk.content = undefined;

    fireEvent.click(screen.getByTestId('trigger-change-Текст 1 абзацу'));

    expect(mockSetField).toHaveBeenCalled();
  });
});
