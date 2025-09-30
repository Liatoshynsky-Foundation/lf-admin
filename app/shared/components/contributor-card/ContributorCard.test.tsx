import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { ContributorCard } from './ContributorCard';

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
    onChangeImage: (file: File | undefined) => void;
  }) => (
    <div>
      <img src={imageUrl} alt="Preview" data-testid="preview-img" />
      <span data-testid="file-name">{fileName}</span>
      <input type="file" onChange={(e) => onChangeImage(e.target.files?.[0])} data-testid="image-upload" />
    </div>
  )
}));

beforeAll(() => {
  URL.createObjectURL = jest.fn(() => 'mocked-url');
});

describe('ContributorCard', () => {
  const baseContributor = {
    name: { uk: 'John Doe', en: '' },
    description: { uk: 'Team leader', en: '' },
    photo: { generatedSrc: '', alt: { uk: '', en: '' } }
  };

  const renderCard = (overrides: any = {}) => {
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
    renderCard();

    const img = screen.getByTestId('preview-img') as HTMLImageElement;
    expect(img.src).toContain('/images/oval-contributor-card.png');
  });

  it('should call onChangePhoto with updated photo when uploading a file', () => {
    const { onChangePhoto } = renderCard();

    const fileInput = screen.getByTestId('image-upload') as HTMLInputElement;
    const file = new File(['dummy'], 'photo.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(onChangePhoto).toHaveBeenCalledWith(
      expect.objectContaining({
        generatedSrc: 'mocked-url',
        alt: expect.objectContaining({ uk: 'photo.png' })
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
