import { fireEvent, render, screen } from '@testing-library/react';

import { EntrySection } from './EntrySection';
import { hardcodedData } from './EntrySection.consts';

jest.mock('../../design-system/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div data-testid="collapsible-block">
      <h2>{title}</h2>
      {children}
    </div>
  )
}));

jest.mock('../../design-system/photo-block/PhotoBlock', () => ({
  __esModule: true,
  ImagePreviewBlock: ({
    fileName,
    imageUrl,
    onChangeImage
  }: {
    fileName: string;
    imageUrl: string;
    onChangeImage: (e: { name: string }) => void;
  }) => (
    <div>
      <div data-testid="image-preview-block" onClick={() => onChangeImage({ name: 'mocked-image.jpg' })}>
        Mocked Image Block
      </div>
      <p data-testid="image-file-name">{fileName}</p>
      <img data-testid="image-element" src={imageUrl} alt="Preview" />
    </div>
  )
}));

describe('Entry section', () => {
  it('should render the section', () => {
    render(<EntrySection />);
    expect(screen.getByText('Вступна секція')).toBeInTheDocument();
    expect(screen.getByDisplayValue(hardcodedData.title)).toBeInTheDocument();
    expect(screen.getByDisplayValue(hardcodedData.imageCaption)).toBeInTheDocument();
    expect(screen.getByText(hardcodedData.quoteText)).toBeInTheDocument();
  });

  it('should update title when user types in title field', () => {
    render(<EntrySection />);
    const input = screen.getByLabelText(/текст заголовку/i);
    fireEvent.change(input, { target: { value: 'New Title' } });
    expect(input).toHaveValue('New Title');
  });

  it('should update title when user types in caption field', () => {
    render(<EntrySection />);
    const input = screen.getByDisplayValue(hardcodedData.imageCaption);
    fireEvent.change(input, { target: { value: 'New Caption' } });
    expect(input).toHaveValue('New Caption');
  });

  it('should update image when ImagePreviewBlock triggers onChangeImage', () => {
    render(<EntrySection />);
    fireEvent.click(screen.getByTestId('image-preview-block'));

    expect(screen.getByText('mocked-image.jpg')).toBeInTheDocument();
  });
});
