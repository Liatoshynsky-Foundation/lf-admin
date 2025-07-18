import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ParagraphsBlock } from 'app/types/accordionBlocks';

jest.mock('../../../design-system/photo-block/PhotoBlock', () => ({
  ImagePreviewBlock: () => <div data-testid="image-preview-block" />
}));

import { FoundationBlock } from './FoundationBlock';

const mockProps: ParagraphsBlock = {
  mainText: 'Основний текст про фундацію',
  paragraphs: ['Перший абзац', 'Другий абзац'],
  onMainTextChange: jest.fn(),
  onParagraphsChange: jest.fn()
};

describe('FoundationBlock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render main text and all paragraph labels', () => {
    render(<FoundationBlock {...mockProps} />);

    expect(screen.getByText('Основний текст секції')).toBeInTheDocument();
    expect(screen.getByText('Текст 1 абзацу')).toBeInTheDocument();
    expect(screen.getByText('Текст 2 абзацу')).toBeInTheDocument();

    expect(screen.getByDisplayValue(mockProps.mainText)).toBeInTheDocument();
    mockProps.paragraphs.forEach((value) => {
      expect(screen.getByDisplayValue(value)).toBeInTheDocument();
    });
    expect(screen.getByTestId('image-preview-block')).toBeInTheDocument();
  });

  it('should call onMainTextChange when main text changes', async () => {
    render(<FoundationBlock {...mockProps} />);
    const user = userEvent.setup();

    const mainTextInput = screen.getByLabelText('Текст');
    await user.clear(mainTextInput);
    await user.type(mainTextInput, 'Новий текст');

    expect(mockProps.onMainTextChange).toHaveBeenCalledWith('Н');
  });

  it('should call onParagraphsChange when a paragraph changes', async () => {
    render(<FoundationBlock {...mockProps} />);
    const user = userEvent.setup();

    const paragraphInputs = screen.getAllByLabelText('Текст абзацу');
    const secondParagraphInput = paragraphInputs[1];

    await user.clear(secondParagraphInput);
    await user.type(secondParagraphInput, 'Updated second paragraph');

    expect(mockProps.onParagraphsChange).toHaveBeenCalledWith(1, 'Updated second paragraph');
  });
});
