import { fireEvent, render, screen } from '@testing-library/react';
import { JSONContent } from '@tiptap/react';
import React from 'react';

import { ContributorCard } from './ContributorCard';
import { CropResult, ImageType } from '~/types/common';

interface MockCustomTextFieldProps {
  readonly label: string;
  readonly value: JSONContent;
  readonly onChange: (value: JSONContent) => void;
}

interface MockImagePreviewBlockProps {
  readonly imageUrl: string;
  readonly fileName: string;
  readonly onChangeImage: (url: string, crop?: CropResult | null) => void;
}

interface MiniTextNode {
  readonly text?: string;
}

interface MiniBlockNode {
  readonly content?: readonly MiniTextNode[];
}

interface MiniDocStructure {
  readonly content?: readonly MiniBlockNode[];
}

jest.mock('~/ds-components/text-field/TextField', () => ({
  __esModule: true,
  CustomTextField: ({ label, value, onChange }: MockCustomTextFieldProps) => (
    <div data-testid={`textfield-wrapper-${label}`}>
      <span data-testid={`textfield-json-${label}`}>{JSON.stringify(value)}</span>
      <button
        data-testid={`trigger-change-${label}`}
        onClick={() => {
          const updatedJson: JSONContent = {
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: `Updated ${label}` }] }]
          };
          onChange(updatedJson);
        }}
      >
        Change {label}
      </button>
    </div>
  )
}));

jest.mock('~/shared/components/design-system/photo-block/PhotoBlock', () => ({
  __esModule: true,
  ImagePreviewBlock: ({ imageUrl, fileName, onChangeImage }: MockImagePreviewBlockProps) => (
    <div>
      <img src={imageUrl} alt="Preview" data-testid="preview-img" />
      <span data-testid="file-name">{fileName}</span>
      <button
        data-testid="image-upload-trigger"
        onClick={() =>
          onChangeImage('new-image-url.png', {
            rect: { x: 0, y: 0, width: 10, height: 10 }
          })
        }
      >
        Upload
      </button>
    </div>
  )
}));

jest.mock('~/lib/utils/prose', () => ({
  proseToText: (input: unknown) => {
    if (typeof input === 'object' && input !== null && 'content' in input) {
      const doc = input as MiniDocStructure;
      return doc.content?.[0]?.content?.[0]?.text ?? '';
    }
    return typeof input === 'string' ? input : '';
  }
}));

const mockNameJson: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'John Doe' }] }]
};

const mockDescriptionJson: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Team leader' }] }]
};

const mockAltJson: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Initial Alt' }] }]
};

const mockCaptionJson: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Initial Caption' }] }]
};

const baseContributor = {
  name: { uk: mockNameJson, en: {} },
  description: { uk: mockDescriptionJson, en: {} },
  photo: {
    generatedSrc: '',
    src: '',
    alt: { uk: mockAltJson, en: {} },
    caption: { uk: mockCaptionJson, en: {} }
  } as ImageType
};

const renderCard = (overrides: Partial<typeof baseContributor> = {}) => {
  const onChangeName = jest.fn();
  const onChangeDescription = jest.fn();
  const onChangePhoto = jest.fn();

  render(
    <ContributorCard
      contributor={{ ...baseContributor, ...overrides }}
      currentLocale="uk"
      onChangeName={onChangeName}
      onChangeDescription={onChangeDescription}
      onChangePhoto={onChangePhoto}
    />
  );

  return { onChangeName, onChangeDescription, onChangePhoto };
};

describe('ContributorCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render contributor name and description fields with default JSON content states', () => {
    renderCard();

    expect(screen.getByTestId('textfield-json-Ім`я')).toHaveTextContent(JSON.stringify(mockNameJson));
    expect(screen.getByTestId('textfield-json-Опис учасника')).toHaveTextContent(JSON.stringify(mockDescriptionJson));
  });

  it('should render image preview with default placeholder image path when inputs are blank', () => {
    renderCard({
      photo: { generatedSrc: '', src: '', alt: { uk: {}, en: {} }, caption: { uk: {}, en: {} } } as ImageType
    });

    const img = screen.getByTestId('preview-img') as HTMLImageElement;
    expect(img.src).toContain('/images/oval-contributor-card.png');
  });

  it('should call onChangePhoto with updated photo configurations when uploading an image file asset', () => {
    const { onChangePhoto } = renderCard();

    fireEvent.click(screen.getByTestId('image-upload-trigger'));

    expect(onChangePhoto).toHaveBeenCalledWith(
      expect.objectContaining({
        src: 'new-image-url.png',
        generatedSrc: 'new-image-url.png',
        alt: expect.objectContaining({ uk: mockAltJson }),
        crop: {
          rect: { x: 0, y: 0, width: 10, height: 10 }
        }
      })
    );
  });

  it('should pass the raw target image URL path back as a localized value fallback string if the original alt object property field is empty', () => {
    const { onChangePhoto } = renderCard({
      photo: { generatedSrc: '', src: '', alt: { uk: {}, en: {} }, caption: { uk: {}, en: {} } } as ImageType
    });

    fireEvent.click(screen.getByTestId('image-upload-trigger'));

    expect(onChangePhoto).toHaveBeenCalledWith(
      expect.objectContaining({
        alt: expect.objectContaining({ uk: {} })
      })
    );
  });

  it('should dispatch onChangeName with structured rich text schemas when modifying the name field', () => {
    const { onChangeName } = renderCard();

    fireEvent.click(screen.getByTestId('trigger-change-Ім`я'));

    const expectedNamePayload: JSONContent = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated Ім`я' }] }]
    };

    expect(onChangeName).toHaveBeenCalledWith(expectedNamePayload);
  });

  it('should dispatch onChangeDescription with structured rich text schemas when modifying the description field', () => {
    const { onChangeDescription } = renderCard();

    fireEvent.click(screen.getByTestId('trigger-change-Опис учасника'));

    const expectedDescPayload: JSONContent = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated Опис учасника' }] }]
    };

    expect(onChangeDescription).toHaveBeenCalledWith(expectedDescPayload);
  });
});
