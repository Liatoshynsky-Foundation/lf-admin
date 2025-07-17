import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ImagePreviewBlock } from './PhotoBlock';

jest.mock('../../../../lib/utils/readFileAsDataURL.ts', () => ({
  readFileAsDataURL: () => Promise.resolve('data:image/png;base64,mockImage')
}));

jest.mock('../../../../../public/icons/image.svg', () => ({
  __esModule: true,
  default: () => <span>ImageIcon</span>
}));

jest.mock('../../../../../public/icons/pencil.svg', () => ({
  __esModule: true,
  default: () => <span>PencilIcon</span>
}));

jest.mock('../../../hooks/use-image-metadata/useImageMetadata.ts', () => ({
  useImageMetadata: () => ({
    dimensions: { width: 200, height: 150 },
    fileName: 'test.jpg'
  })
}));

describe('ImagePreviewBlock', () => {
  const mockOnChangeImage = jest.fn();

  beforeEach(() => {
    mockOnChangeImage.mockClear();
  });

  it('should render correctly with initial image', () => {
    render(
      <ImagePreviewBlock
        imageUrl="https://example.com/test.jpg"
        cropWidth={300}
        cropHeight={200}
        onChangeImage={mockOnChangeImage}
      />
    );

    expect(screen.getByText(/Основне зображення/)).toBeInTheDocument();
    expect(screen.getByAltText('Preview')).toHaveAttribute('src', 'https://example.com/test.jpg');
    expect(screen.getByText(/Назва файлу test.jpg/)).toBeInTheDocument();
    expect(screen.getByText(/Розмір: 200 × 150/)).toBeInTheDocument();
  });

  it('should open cropper modal on "Редагувати" click', async () => {
    render(
      <ImagePreviewBlock
        imageUrl="https://example.com/test.jpg"
        cropWidth={300}
        cropHeight={200}
        onChangeImage={mockOnChangeImage}
      />
    );

    const editButton = screen.getByRole('button', { name: /Редагувати/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('Редагування зображення')).toBeInTheDocument();
    });
  });
});
