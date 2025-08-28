import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { ChangeEvent } from 'react';

import { FoundationBlock } from './FoundationBlock';

jest.mock('~/shared/components/design-system/photo-block/PhotoBlock', () => ({
  ImagePreviewBlock: ({ onChangeImage }: { onChangeImage: (file: File) => void }) => (
    <div data-testid="image-preview-block">
      <input
        type="file"
        aria-label="Upload image"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          if (e.target.files?.[0]) onChangeImage(e.target.files?.[0]);
        }}
      />
    </div>
  )
}));

describe('FoundationBlock', () => {
  const mockProps = {
    mainText: 'Основний текст секції',
    paragraphs: [{ text: 'Перший абзац' }, { text: 'Другий абзац' }],
    imageUrl: '/images/test.png',
    fileName: 'test.png',
    onMainTextChange: jest.fn(),
    onParagraphChange: jest.fn(),
    onImageChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render main text, paragraphs and image block', () => {
    render(<FoundationBlock {...mockProps} />);

    expect(screen.getByDisplayValue(mockProps.mainText)).toBeInTheDocument();
    mockProps.paragraphs.forEach((p) => {
      expect(screen.getByDisplayValue(p.text)).toBeInTheDocument();
    });

    expect(screen.getByTestId('image-preview-block')).toBeInTheDocument();
  });

  it('should call onParagraphChange when paragraph inputs change', async () => {
    render(<FoundationBlock {...mockProps} />);
    const user = userEvent.setup();

    mockProps.paragraphs.forEach(async (p, index) => {
      const input = screen.getByDisplayValue(p.text) as HTMLInputElement;
      await user.clear(input);
      await user.type(input, `Новий текст ${index + 1}`);
      expect(mockProps.onParagraphChange).toHaveBeenCalledWith(index, expect.any(String));
    });
  });

  it('should call onImageChange when a file is uploaded', async () => {
    render(<FoundationBlock {...mockProps} />);
    const user = userEvent.setup();

    const fileInput = screen.getByLabelText('Upload image') as HTMLInputElement;
    const file = new File(['dummy'], 'photo.png', { type: 'image/png' });

    await user.upload(fileInput, file);

    expect(mockProps.onImageChange).toHaveBeenCalledTimes(1);
    const uploadedFile = mockProps.onImageChange.mock.calls[0][0];
    expect(uploadedFile.name).toBe('photo.png');
  });

  it('should render correct number of paragraph inputs', () => {
    render(<FoundationBlock {...mockProps} />);
    const paragraphInputs = mockProps.paragraphs.map((p) => screen.getByDisplayValue(p.text));
    expect(paragraphInputs.length).toBe(mockProps.paragraphs.length);
  });
});
