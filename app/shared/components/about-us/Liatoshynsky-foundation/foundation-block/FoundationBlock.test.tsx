import { fireEvent, render, screen } from '@testing-library/react';
import { JSONContent } from '@tiptap/react';
import React from 'react';

import { FoundationBlock } from './FoundationBlock';

interface MockCustomTextFieldProps {
  readonly title: string;
  readonly value: JSONContent;
  readonly onChange: (value: JSONContent) => void;
}

interface MockImagePreviewBlockProps {
  readonly imageUrl: string;
  readonly fileName?: string;
  readonly onChangeImage: (url: string) => void;
  readonly title?: string;
}

jest.mock('~/shared/components/design-system/text-field/TextField', () => ({
  __esModule: true,
  CustomTextField: ({ title, value, onChange }: MockCustomTextFieldProps) => (
    <div data-testid={`textfield-wrapper-${title}`}>
      <span data-testid={`textfield-json-${title}`}>{JSON.stringify(value)}</span>
      <button
        data-testid={`trigger-textfield-change-${title}`}
        onClick={() => {
          const mockUpdatedJson: JSONContent = {
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: `Updated ${title}` }] }]
          };
          onChange(mockUpdatedJson);
        }}
      >
        Change {title}
      </button>
    </div>
  )
}));

jest.mock('~/shared/components/design-system/photo-block/PhotoBlock', () => ({
  __esModule: true,
  ImagePreviewBlock: ({ imageUrl, fileName, onChangeImage, title }: MockImagePreviewBlockProps) => (
    <div data-testid="image-preview-block" data-title={title}>
      <span data-testid="preview-url">{imageUrl}</span>
      <span data-testid="preview-filename">{fileName}</span>
      <button 
        data-testid="trigger-image-upload" 
        onClick={() => onChangeImage('uploaded-image-path.png')}
      >
        Upload Image
      </button>
    </div>
  )
}));

const mockMainTextJson: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Основний текст секції' }] }]
};

const mockParagraphsJson: { text: JSONContent }[] = [
  {
    text: {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Перший абзац' }] }]
    }
  },
  {
    text: {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Другий абзац' }] }]
    }
  }
];

describe('FoundationBlock', () => {
  const mockProps = {
    mainText: mockMainTextJson,
    paragraphs: mockParagraphsJson,
    imageUrl: '/images/test.png',
    fileName: 'test.png',
    onMainTextChange: jest.fn(),
    onParagraphChange: jest.fn(),
    onImageChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render main text, paragraph lists, and image layouts with correct structural values', () => {
    render(<FoundationBlock {...mockProps} />);

    expect(screen.getByTestId('textfield-json-Основний текст секції')).toHaveTextContent(
      JSON.stringify(mockMainTextJson)
    );

    mockProps.paragraphs.forEach((p, index) => {
      const containerLabel = `Текст ${index + 1} абзацу`;
      expect(screen.getByTestId(`textfield-json-${containerLabel}`)).toHaveTextContent(
        JSON.stringify(p.text)
      );
    });

    const imageBlock = screen.getByTestId('image-preview-block');
    expect(imageBlock).toBeInTheDocument();
    expect(screen.getByTestId('preview-url')).toHaveTextContent('/images/test.png');
    expect(screen.getByTestId('preview-filename')).toHaveTextContent('test.png');
  });

  it('should dispatch corresponding parent callbacks when the main formatting section text field mutates', () => {
    render(<FoundationBlock {...mockProps} />);

    fireEvent.click(screen.getByTestId('trigger-textfield-change-Основний текст секції'));

    const expectedMainPayload: JSONContent = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated Основний текст секції' }] }]
    };

    expect(mockProps.onMainTextChange).toHaveBeenCalledWith(expectedMainPayload);
  });

  it('should pass index identities along with rich text payloads when executing parameter modifications on dynamic paragraphs', () => {
    render(<FoundationBlock {...mockProps} />);

    mockProps.paragraphs.forEach((_, index) => {
      const containerLabel = `Текст ${index + 1} абзацу`;
      fireEvent.click(screen.getByTestId(`trigger-textfield-change-${containerLabel}`));

      const expectedParagraphPayload: JSONContent = {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: `Updated ${containerLabel}` }] }]
      };

      expect(mockProps.onParagraphChange).toHaveBeenCalledWith(index, expectedParagraphPayload);
    });
  });

  it('should call onImageChange when an asset upload handler interaction executes', () => {
    render(<FoundationBlock {...mockProps} />);

    fireEvent.click(screen.getByTestId('trigger-image-upload'));

    expect(mockProps.onImageChange).toHaveBeenCalledTimes(1);
    expect(mockProps.onImageChange).toHaveBeenCalledWith('uploaded-image-path.png');
  });
});
