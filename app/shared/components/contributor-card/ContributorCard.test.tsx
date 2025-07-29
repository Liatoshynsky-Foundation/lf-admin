import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContributorCard } from './ContributorCard';

jest.mock('~/ds-components/text-field/TextField', () => ({
  CustomTextField: ({ label, defaultValue }: any) => (
    <div>
      <label>{label}</label>
      <input defaultValue={defaultValue} aria-label={label} />
    </div>
  ),
}));

jest.mock('~/shared/components/design-system/photo-block/PhotoBlock', () => ({
  ImagePreviewBlock: ({ imageUrl, fileName, onChangeImage }: any) => (
    <div>
      <img src={imageUrl} alt="Preview" />
      <span>{fileName}</span>
      <input
        type="file"
        onChange={(e) => onChangeImage(e.target.files?.[0])}
        data-testid="image-upload"
      />
    </div>
  ),
}));

describe('ContributorCard', () => {
  const name = 'John Doe';
  const description = 'Team leader';

  it('renders contributor name and description fields with default values', () => {
    render(<ContributorCard contributorNameValue={name} contributorDescriptionValue={description} />);
    
    expect(screen.getByLabelText("Ім'я")).toHaveValue(name);
    expect(screen.getByLabelText('Опис учасника')).toHaveValue(description);
  });

  it('renders image preview with default image', () => {
    render(<ContributorCard contributorNameValue={name} contributorDescriptionValue={description} />);
    
    const img = screen.getByAltText('Preview') as HTMLImageElement;
    expect(img.src).toContain('/images/oval-contributor-card.png');
  });
  it('renders with horizontal layout and correct spacing', () => {
  const { container } = render(
    <ContributorCard contributorNameValue="Test" contributorDescriptionValue="Desc" />
  );

  const stack = container.querySelector('.MuiStack-root');
  expect(stack).toHaveStyle('flex-direction: row');
});

});
