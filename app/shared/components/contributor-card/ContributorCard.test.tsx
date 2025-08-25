import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { ContributorCard } from './ContributorCard';

jest.mock('~/ds-components/text-field/TextField', () => ({
  CustomTextField: ({ label, defaultValue }: { label: string; defaultValue: string }) => (
    <div>
      <label>{label}</label>
      <input defaultValue={defaultValue} aria-label={label} />
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
      <span>{fileName}</span>
      <input type="file" onChange={(e) => onChangeImage(e.target.files?.[0])} data-testid="image-upload" />
    </div>
  )
}));

beforeAll(() => {
  URL.createObjectURL = jest.fn(() => 'mocked-url');
});

describe('ContributorCard', () => {
  const name = 'John Doe';
  const description = 'Team leader';

  it('should render contributor name and description fields with default values', () => {
    render(<ContributorCard contributorNameValue={name} contributorDescriptionValue={description} />);

    expect(screen.getByLabelText('Ім`я')).toHaveValue(name);
    expect(screen.getByLabelText('Опис учасника')).toHaveValue(description);
  });

  it('should render image preview with default image', () => {
    render(<ContributorCard contributorNameValue={name} contributorDescriptionValue={description} />);

    const img = screen.getByTestId('preview-img') as HTMLImageElement;
    expect(img.src).toContain('/images/oval-contributor-card.png');
  });
  it('should update image preview and fileName when uploading a file', () => {
    render(<ContributorCard contributorNameValue={name} contributorDescriptionValue={description} />);

    const fileInput = screen.getByTestId('image-upload') as HTMLInputElement;
    const file = new File(['dummy'], 'photo.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    const img = screen.getByTestId('preview-img') as HTMLImageElement;
    expect(img.src).toContain('mocked-url');

    expect(screen.getByText('photo.png')).toBeInTheDocument();
  });

  it('should render horizontal layout with spacing', () => {
    const { container } = render(<ContributorCard contributorNameValue="Test" contributorDescriptionValue="Desc" />);
    const stack = container.querySelector('.MuiStack-root');
    expect(stack).toHaveStyle('flex-direction: row');
  });
});
