import { render, screen } from '@testing-library/react';

import { usePageBlockMock } from '../../__mocks__/setup-mocks';
import { createStandardMockBlock, runCommonBlockTests } from '../../test-utils/block-test-factory';
import { EditParagraphsBlock } from './EditParagraphsBlock';


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
  });
  it('should render a correct title if provided', () => {
    usePageBlockMock.mockReturnValue({ block: createStandardMockBlock().block });

    render(<EditParagraphsBlock blockId={mockBlockId} title={mockTitle} />);
    expect(screen.getByText(mockTitle)).toBeInTheDocument();
  });
  it('should return null if block does not have description or content is empty', () => {
    usePageBlockMock.mockReturnValue({
      block: { description: { uk: { type: 'doc', content: [] }, en: { type: 'doc', content: [] } } }
    });

    render(<EditParagraphsBlock blockId={mockBlockId} title={mockTitle} />);

    expect(screen.queryByTestId('collapsible-block')).not.toBeInTheDocument();
  });
});