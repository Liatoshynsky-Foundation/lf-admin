import { render } from '@testing-library/react';

import { usePageBlockMock } from '../../__mocks__/setup-mocks';
import { createStandardMockBlock, runCommonBlockTests } from '../../test-utils/block-test-factory';
import { EditParagraphsBlock } from './EditParagraphsBlock';


const mockBlockId = 'intro_block' as any;
const mockTitle = 'Вступ';
const commonTestKeys = {
  paragraphKey: 'Текст 1 абзацу'
};


describe('EditParagraphsBlock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  runCommonBlockTests({
    Component: () => <EditParagraphsBlock blockId={mockBlockId} title={mockTitle} />,
    mockBlock: createStandardMockBlock().block,
    ...commonTestKeys,
  });
  it('should render a correct title if provided', () => {
    usePageBlockMock.mockReturnValue({ block: createStandardMockBlock().block });
    
    render(<EditParagraphsBlock blockId={mockBlockId} title={mockTitle} />);
    usePageBlockMock.mockReturnValue({ block: createStandardMockBlock().block });
  });
  it('should return null if block does not have description or content is empty', () => {
    usePageBlockMock.mockReturnValue({
      block: { description: { uk: { type: 'doc', content: [] }, en: { type: 'doc', content: [] } } }
    });

    const { container } = render(<EditParagraphsBlock blockId={mockBlockId} title={mockTitle} />);

    expect(container).toBeEmptyDOMElement();
  });
});