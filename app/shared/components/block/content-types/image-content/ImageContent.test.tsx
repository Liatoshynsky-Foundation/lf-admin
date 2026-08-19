import { fireEvent, render, screen } from '@testing-library/react';

import { ImageContent } from './ImageContent';
import { createDocNode } from '~/__mocks__/utils';
import { CROP_RATIOS } from '~/constants/publications';
import type { ImageContentItem } from '~/types/blocks/contentTypes';
import type { CropResult } from '~/types/common';

jest.mock('~/utils/getImageUrl', () => ({
  getImageUrl: jest.fn((image: { src: string }) => image.src)
}));

jest.mock('~/ds-components/photo-block/PhotoBlock', () => ({
  ImagePreviewBlock: ({
    onChangeImage,
    onChangeAltText,
    title,
    previewWidth,
    previewHeight,
    alignActionsToPreviewBottom
  }: {
    onChangeImage: (url: string, crop?: CropResult | null) => void;
    onChangeAltText?: (value: string) => void;
    title?: string;
    previewWidth?: number;
    previewHeight?: number;
    alignActionsToPreviewBottom?: boolean;
  }) => (
    <>
      {title && <span data-testid={`preview-size-${title}`}>{`${previewWidth}x${previewHeight}`}</span>}
      {title && (
        <span data-testid={`align-bottom-${title}`}>{String(alignActionsToPreviewBottom ?? false)}</span>
      )}
      <button
        data-testid="trigger-image-change"
        onClick={() => onChangeImage('/updated.jpg', { rect: { x: 0, y: 0, width: 100, height: 100 } })}
      >
        Change image
      </button>
      <button data-testid="trigger-image-change-no-crop" onClick={() => onChangeImage('/updated-no-crop.jpg')}>
        Change image without crop
      </button>
      <button data-testid="trigger-alt-change" onClick={() => onChangeAltText?.('Updated alt text')}>
        Change alt text
      </button>
    </>
  )
}));

jest.mock('~/shared/components/design-system/text-field/TextField');

const baseItem: ImageContentItem = {
  id: 'image-1',
  type: 'image',
  value: {
    src: '/image.jpg',
    generatedSrc: '/generated.jpg',
    alt: { uk: createDocNode('alt UK'), en: createDocNode('alt EN') },
    caption: { uk: createDocNode('caption UK'), en: createDocNode('caption EN') }
  },
  aspectRatio: CROP_RATIOS.FUNDATION_PROFILE_SMALL
};

describe('ImageContent', () => {
  it('should update image src and crop on image change', () => {
    const onChange = jest.fn();

    render(<ImageContent item={baseItem} locale="uk" onChange={onChange} pageId="about-us" blockId="mission" />);

    fireEvent.click(screen.getByTestId('trigger-image-change'));

    expect(onChange).toHaveBeenCalledWith({
      ...baseItem,
      value: {
        ...baseItem.value,
        src: '/updated.jpg',
        crop: { rect: { x: 0, y: 0, width: 100, height: 100 } },
        isTmp: false
      }
    });
  });

  it('should render caption field and update localized caption', () => {
    const onChange = jest.fn();

    render(
      <ImageContent
        item={{ ...baseItem, label: 'Перше зображення секції' }}
        locale="uk"
        onChange={onChange}
        pageId="about-us"
        blockId="mission"
      />
    );

    expect(screen.getByTestId('textfield-wrapper-Підпис до зображення (Перше зображення секції)')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('trigger-change-Підпис до зображення (Перше зображення секції)'));

    expect(onChange).toHaveBeenCalledWith({
      ...baseItem,
      label: 'Перше зображення секції',
      value: {
        ...baseItem.value,
        caption: {
          ...baseItem.value.caption,
          uk: createDocNode('Updated Підпис до зображення (Перше зображення секції)')
        }
      }
    });
  });

  it('should set crop to null when crop is not provided', () => {
    const onChange = jest.fn();

    render(<ImageContent item={baseItem} locale="uk" onChange={onChange} pageId="about-us" blockId="mission" />);

    fireEvent.click(screen.getByTestId('trigger-image-change-no-crop'));

    expect(onChange).toHaveBeenCalledWith({
      ...baseItem,
      value: {
        ...baseItem.value,
        src: '/updated-no-crop.jpg',
        crop: null,
        isTmp: false
      }
    });
  });

  it('should update localized alt text on change', () => {
    const onChange = jest.fn();

    render(<ImageContent item={baseItem} locale="uk" onChange={onChange} pageId="about-us" blockId="mission" />);

    fireEvent.click(screen.getByTestId('trigger-alt-change'));

    expect(onChange).toHaveBeenCalledWith({
      ...baseItem,
      value: {
        ...baseItem.value,
        alt: {
          ...baseItem.value.alt,
          uk: 'Updated alt text'
        }
      }
    });
  });

  it('should hide caption field when showCaption is false', () => {
    render(
      <ImageContent
        item={{ ...baseItem, showCaption: false }}
        locale="uk"
        onChange={jest.fn()}
        pageId="about-us"
        blockId="mission"
      />
    );

    expect(screen.queryByTestId('textfield-wrapper-Підпис до зображення (Зображення)')).not.toBeInTheDocument();
  });

  it('should pass preview size and bottom-aligned actions to ImagePreviewBlock', () => {
    render(
      <ImageContent
        item={{
          ...baseItem,
          label: 'Перше зображення секції',
          previewWidth: 188,
          previewHeight: 224,
          alignActionsToPreviewBottom: true
        }}
        locale="uk"
        onChange={jest.fn()}
        pageId="about-us"
        blockId="mission"
      />
    );

    expect(screen.getByTestId('preview-size-Перше зображення секції')).toHaveTextContent('188x224');
    expect(screen.getByTestId('align-bottom-Перше зображення секції')).toHaveTextContent('true');
  });
});
