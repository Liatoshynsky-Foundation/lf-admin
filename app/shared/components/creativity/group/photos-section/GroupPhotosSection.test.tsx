import { fireEvent, render, screen } from '@testing-library/react';
import React, { ChangeEvent, MouseEvent, ReactNode } from 'react';

import { GroupPhotosSection } from './GroupPhotosSection';
import { useGroupPhotos } from './useGroupPhotos';
import { GroupPhoto } from '~/constants/creativity';
import type { MediaModalResult } from '~/shared/components/media-modal/MediaModal.types';

type MockButtonProps = {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
};

type MockCustomTextFieldProps = {
  label: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

type MockImagePreviewBlockProps = {
  imageUrl: string;
  onChangeAltText: (newAlt: string) => void;
  onChangeImage: (url: string, crop?: MediaModalResult['crop']) => void;
};

type MockDeleteModalProps = {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
};

jest.mock('./useGroupPhotos');

jest.mock('~/public/icons/trash.svg', () => ({
  __esModule: true,
  default: () => <span data-testid="icon-trash" />
}));

jest.mock('~/public/icons/plus.svg', () => ({
  __esModule: true,
  default: () => <span data-testid="icon-plus" />
}));

jest.mock('~/shared/components/design-system/button/Button', () => ({
  __esModule: true,
  default: ({ children, onClick }: MockButtonProps) => (
    <button data-testid="mock-button-add" onClick={onClick}>
      {children}
    </button>
  )
}));

jest.mock('~/shared/components/design-system/photo-block/PhotoBlock', () => ({
  ImagePreviewBlock: ({ imageUrl, onChangeAltText, onChangeImage }: MockImagePreviewBlockProps) => (
    <div data-testid={`mock-image-preview-${imageUrl}`}>
      <button data-testid={`trigger-alt-${imageUrl}`} onClick={() => onChangeAltText('New Alt Text')} />
      <button
        data-testid={`trigger-img-${imageUrl}`}
        onClick={() => onChangeImage('new-url.jpg', { rect: { width: 50, height: 50, x: 0, y: 0 } })}
      />
    </div>
  )
}));

jest.mock('~/shared/components/design-system/text-field/TextField', () => ({
  CustomTextField: ({ label, value, onChange }: MockCustomTextFieldProps) => (
    <input data-testid={`mock-input-${label}`} value={value || ''} onChange={onChange} aria-label={label} />
  )
}));

jest.mock('~/shared/components/delete-card-modal/DeleteCardModal', () => ({
  __esModule: true,
  default: ({ open, onClose, onDelete }: MockDeleteModalProps) => {
    if (!open) return null;
    return (
      <div data-testid="mock-delete-modal">
        <button data-testid="modal-confirm" onClick={onDelete}>
          Confirm
        </button>
        <button data-testid="modal-cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    );
  }
}));

const defaultPhotos: GroupPhoto[] = [
  {
    id: '1',
    src: 'img1.jpg',
    fileName: 'file1',
    caption: { uk: 'Caption 1', en: 'Cap 1 EN' },
    altText: { uk: 'Alt 1', en: 'Alt 1 EN' },
    crop: null
  },
  {
    id: '2',
    src: 'img2.jpg',
    fileName: 'file2',
    caption: { uk: 'Caption 2', en: 'Cap 2 EN' },
    altText: { uk: 'Alt 2', en: 'Alt 2 EN' },
    crop: null
  }
];

describe('GroupPhotosSection UI Component', () => {
  const mockOnChange = jest.fn();

  const mockHandleAddPhoto = jest.fn();
  const mockHandleUpdatePhoto = jest.fn();
  const mockHandleConfirmDelete = jest.fn();
  const mockSetPhotoIdToDelete = jest.fn();

  const mockedUseGroupPhotos = useGroupPhotos as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseGroupPhotos.mockReturnValue({
      photoIdToDelete: null,
      setPhotoIdToDelete: mockSetPhotoIdToDelete,
      getPhotoKey: (photo: GroupPhoto) => `${photo.id}-no-crop`,
      handleAddPhoto: mockHandleAddPhoto,
      handleUpdatePhoto: mockHandleUpdatePhoto,
      handleConfirmDelete: mockHandleConfirmDelete
    });
  });

  it('should render the list of photos with correct indices', () => {
    render(<GroupPhotosSection currentLanguage="UA" photos={defaultPhotos} onChange={mockOnChange} />);

    expect(screen.getByText('Зображення 1')).toBeInTheDocument();
    expect(screen.getByText('Зображення 2')).toBeInTheDocument();

    const captionInputs = screen.getAllByTestId('mock-input-Підпис до зображення');
    expect(captionInputs[0]).toHaveValue('Caption 1');
    expect(captionInputs[1]).toHaveValue('Caption 2');
  });

  it('should call handleAddPhoto when the add button is clicked', () => {
    render(<GroupPhotosSection currentLanguage="UA" photos={defaultPhotos} onChange={mockOnChange} />);

    fireEvent.click(screen.getByTestId('mock-button-add'));
    expect(mockHandleAddPhoto).toHaveBeenCalledTimes(1);
  });

  it('should call handleUpdatePhoto when typing in the caption text field', () => {
    render(<GroupPhotosSection currentLanguage="UA" photos={defaultPhotos} onChange={mockOnChange} />);

    const captionInputs = screen.getAllByTestId('mock-input-Підпис до зображення');
    fireEvent.change(captionInputs[0], { target: { value: 'Updated Caption' } });

    expect(mockHandleUpdatePhoto).toHaveBeenCalledWith('1', {
      caption: { uk: 'Updated Caption', en: 'Cap 1 EN' }
    });
  });

  it('should call handleUpdatePhoto when alt text is updated from ImagePreviewBlock', () => {
    render(<GroupPhotosSection currentLanguage="UA" photos={defaultPhotos} onChange={mockOnChange} />);

    fireEvent.click(screen.getByTestId('trigger-alt-img1.jpg'));
    expect(mockHandleUpdatePhoto).toHaveBeenCalledWith('1', {
      altText: { uk: 'New Alt Text', en: 'Alt 1 EN' }
    });
  });

  it('should call handleUpdatePhoto when src and crop are updated from ImagePreviewBlock', () => {
    render(<GroupPhotosSection currentLanguage="UA" photos={defaultPhotos} onChange={mockOnChange} />);

    fireEvent.click(screen.getByTestId('trigger-img-img1.jpg'));

    expect(mockHandleUpdatePhoto).toHaveBeenCalledWith('1', {
      src: 'new-url.jpg',
      crop: { rect: { width: 50, height: 50, x: 0, y: 0 } }
    });
  });

  it('should call setPhotoIdToDelete when trash icon is clicked', () => {
    render(<GroupPhotosSection currentLanguage="UA" photos={defaultPhotos} onChange={mockOnChange} />);

    const trashButtons = screen.getAllByTestId('delete-photo-btn');
    fireEvent.click(trashButtons[0]);

    expect(mockSetPhotoIdToDelete).toHaveBeenCalledWith('1');
  });

  it('should pass photoIdToDelete to DeleteCardModal and call handleConfirmDelete', () => {
    mockedUseGroupPhotos.mockReturnValue({
      photoIdToDelete: '1',
      setPhotoIdToDelete: mockSetPhotoIdToDelete,
      getPhotoKey: (photo: GroupPhoto) => `${photo.id}-no-crop`,
      handleAddPhoto: mockHandleAddPhoto,
      handleUpdatePhoto: mockHandleUpdatePhoto,
      handleConfirmDelete: mockHandleConfirmDelete
    });

    render(<GroupPhotosSection currentLanguage="UA" photos={defaultPhotos} onChange={mockOnChange} />);

    expect(screen.getByTestId('mock-delete-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('modal-confirm'));

    expect(mockHandleConfirmDelete).toHaveBeenCalledTimes(1);
  });
  it('should call setPhotoIdToDelete when delete modal is closed', () => {
    mockedUseGroupPhotos.mockReturnValue({
      photoIdToDelete: '1',
      setPhotoIdToDelete: mockSetPhotoIdToDelete,
      getPhotoKey: (photo: GroupPhoto) => `${photo.id}-no-crop`,
      handleAddPhoto: mockHandleAddPhoto,
      handleUpdatePhoto: mockHandleUpdatePhoto,
      handleConfirmDelete: mockHandleConfirmDelete
    });

    render(<GroupPhotosSection currentLanguage="UA" photos={defaultPhotos} onChange={mockOnChange} />);
    expect(screen.getByTestId('mock-delete-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('modal-cancel'));
    expect(mockSetPhotoIdToDelete).toHaveBeenCalledWith(null);
  });
  it('should render correctly when currentLanguage is EN', () => {
    render(<GroupPhotosSection currentLanguage="EN" photos={defaultPhotos} onChange={mockOnChange} />);

    const captionInputs = screen.getAllByTestId('mock-input-Підпис до зображення');
    expect(captionInputs[0]).toHaveValue('Cap 1 EN');
  });

  it('should handle fallbacks correctly for missing optional fields', () => {
    const photosWithMissingData: GroupPhoto[] = [
      {
        id: undefined as unknown as string, 
        src: undefined as unknown as string,
        fileName: 'empty.jpg',
        caption: undefined as unknown as { uk: string; en: string },
        altText: undefined as unknown as { uk: string; en: string },
        crop: null
      }
    ];

    render(<GroupPhotosSection currentLanguage="UA" photos={photosWithMissingData} onChange={mockOnChange} />);

    const captionInput = screen.getByTestId('mock-input-Підпис до зображення');
    expect(captionInput).toHaveValue('');

    const trashButton = screen.getByTestId('delete-photo-btn');
    fireEvent.click(trashButton);
    expect(mockSetPhotoIdToDelete).toHaveBeenCalledWith('');

    fireEvent.click(screen.getByTestId('trigger-alt-'));
    expect(mockHandleUpdatePhoto).toHaveBeenCalledWith('', expect.anything());

    fireEvent.change(captionInput, { target: { value: 'Новий текст' } });
    expect(mockHandleUpdatePhoto).toHaveBeenCalledWith('', expect.anything());
  });
});
