import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { ContributorCard } from './ContributorCard';
import { CropResult,ImageType } from '~/types/common';

jest.mock('~/ds-components/text-field/TextField', () => ({
  CustomTextField: ({
    label,
    value,
    onChange
  }: {
        label: string;
        value: string;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    }) => (
    <div>
      <label>{label}</label>
      <input value={value} aria-label={label} onChange={onChange} />
    </div>
  )
}));

jest.mock('~/shared/components/design-system/photo-block/PhotoBlock', () => ({
  ImagePreviewBlock: ({
    imageUrl,
    fileName,
    onChangeImage
  }: {
        imageUrl: string;
        fileName: string;
        onChangeImage: (url: string, crop?: CropResult | null) => void;
    }) => (
    <div>
      <img src={imageUrl} alt="Preview" data-testid="preview-img" />
      <span data-testid="file-name">{fileName}</span>
      <button
        data-testid="image-upload-trigger"
        onClick={() =>
          onChangeImage('new-image-url.png', {
            rect: {x: 0, y: 0, width: 10, height: 10}
          })
        }
      >
          Upload
      </button>
    </div>
  )
}));

describe('ContributorCard', () => {
  const baseContributor = {
    name: {uk: 'John Doe', en: ''},
    description: {uk: 'Team leader', en: ''},
    photo: {
      generatedSrc: '',
      src: '',
      alt: {uk: 'Initial Alt', en: ''}
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

  it('should render contributor name and description fields with default values', () => {
    renderCard();

    expect(screen.getByLabelText('Ім`я')).toHaveValue('John Doe');
    expect(screen.getByLabelText('Опис учасника')).toHaveValue('Team leader');
  });

  it('should render image preview with default placeholder image', () => {
    renderCard({
      photo: { generatedSrc: '', src: '', alt: { uk: '', en: '' } } as ImageType
    });
    const img = screen.getByTestId('preview-img') as HTMLImageElement;
    expect(img.src).toContain('/images/oval-contributor-card.png');
  });

  it('should call onChangePhoto with updated photo when uploading a file', () => {
    const { onChangePhoto } = renderCard();

    const trigger = screen.getByTestId('image-upload-trigger');
    fireEvent.click(trigger);

    expect(onChangePhoto).toHaveBeenCalledWith(
      expect.objectContaining({
        src: 'new-image-url.png',
        generatedSrc: 'new-image-url.png',
        alt: expect.objectContaining({ uk: 'Initial Alt' }),
        crop: {
          rect: { x: 0, y: 0, width: 10, height: 10 }
        }
      })
    );
  });

  it('should use URL as fallback for alt if current alt is empty', () => {
    const { onChangePhoto } = renderCard({
      photo: { generatedSrc: '', src: '', alt: { uk: '', en: '' } } as ImageType
    });

    const trigger = screen.getByTestId('image-upload-trigger');
    fireEvent.click(trigger);

    expect(onChangePhoto).toHaveBeenCalledWith(
      expect.objectContaining({
        alt: expect.objectContaining({ uk: 'new-image-url.png' })
      })
    );
  });

  it('should call onChangeName when typing in name field', () => {
    const { onChangeName } = renderCard();
    const input = screen.getByLabelText('Ім`я');
    fireEvent.change(input, { target: { value: 'New Name' } });
    expect(onChangeName).toHaveBeenCalledWith('New Name');
  });

  it('should call onChangeDescription when typing in description field', () => {
    const { onChangeDescription } = renderCard();
    const input = screen.getByLabelText('Опис учасника');
    fireEvent.change(input, { target: { value: 'New Description' } });
    expect(onChangeDescription).toHaveBeenCalledWith('New Description');
  });
});
