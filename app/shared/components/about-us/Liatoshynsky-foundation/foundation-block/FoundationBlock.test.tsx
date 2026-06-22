import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { FoundationBlock } from './FoundationBlock';
import { createDocNode } from '~/__mocks__/utils';


interface MockImagePreviewBlockProps {
  readonly imageUrl: string;
  readonly fileName?: string;
  readonly onChangeImage: (url: string) => void;
  readonly title?: string;
}

jest.mock('~/ds-components/text-field/TextField');

jest.mock('~/ds-components/photo-block/PhotoBlock', () => ({
  __esModule: true,
  ImagePreviewBlock: ({ imageUrl, fileName, onChangeImage, title }: MockImagePreviewBlockProps) => (
    <div data-testid="image-preview-block" data-title={title}>
      <span data-testid="preview-url">{imageUrl}</span>
      <span data-testid="preview-filename">{fileName}</span>
      <button data-testid="trigger-image-upload" onClick={() => onChangeImage('uploaded-image-path.png')}>
        Upload Image
      </button>
    </div>
  )
}));

const MAIN_TEXT_KEY = 'Основний текст секції';
const mockMainTextJson = createDocNode(MAIN_TEXT_KEY);

const mockParagraphsJson = [{ text: createDocNode('Перший абзац') }, { text: createDocNode('Другий абзац') }];

const mockProps = {
  mainText: mockMainTextJson,
  paragraphs: mockParagraphsJson,
  imageUrl: '/images/test.png',
  fileName: 'test.png',
  onMainTextChange: jest.fn(),
  onParagraphChange: jest.fn(),
  onImageChange: jest.fn()
};

const getParagraphLabel = (index: number) => `Текст ${index + 1} абзацу`;

describe('FoundationBlock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render main text, paragraph lists, and image layouts with correct structural values', () => {
    render(<FoundationBlock {...mockProps} />);

    expect(screen.getByTestId(`textfield-json-${MAIN_TEXT_KEY}`)).toHaveTextContent(JSON.stringify(mockMainTextJson));

    mockProps.paragraphs.forEach((p, index) => {
      expect(screen.getByTestId(`textfield-json-${getParagraphLabel(index)}`)).toHaveTextContent(
        JSON.stringify(p.text)
      );
    });

    expect(screen.getByTestId('image-preview-block')).toBeInTheDocument();
    expect(screen.getByTestId('preview-url')).toHaveTextContent(mockProps.imageUrl);
    expect(screen.getByTestId('preview-filename')).toHaveTextContent(mockProps.fileName);
  });

  it.each([
    [
      'main section text field changes',
      `trigger-change-${MAIN_TEXT_KEY}`,
      () => {
        expect(mockProps.onMainTextChange).toHaveBeenCalledWith(createDocNode(`Updated ${MAIN_TEXT_KEY}`));
      }
    ],
    [
      'first dynamic paragraph array alterations',
      `trigger-change-${getParagraphLabel(0)}`,
      () => {
        expect(mockProps.onParagraphChange).toHaveBeenCalledWith(0, createDocNode(`Updated ${getParagraphLabel(0)}`));
      }
    ],
    [
      'second dynamic paragraph array alterations',
      `trigger-change-${getParagraphLabel(1)}`,
      () => {
        expect(mockProps.onParagraphChange).toHaveBeenCalledWith(1, createDocNode(`Updated ${getParagraphLabel(1)}`));
      }
    ],
    [
      'image asset upload handler interactions',
      'trigger-image-upload',
      () => {
        expect(mockProps.onImageChange).toHaveBeenCalledTimes(1);
        expect(mockProps.onImageChange).toHaveBeenCalledWith('uploaded-image-path.png');
      }
    ]
  ])('should dispatch matching callbacks upon executing %s', (_scenario, triggerId, assertionCallback) => {
    render(<FoundationBlock {...mockProps} />);

    fireEvent.click(screen.getByTestId(triggerId));
    assertionCallback();
  });
});
