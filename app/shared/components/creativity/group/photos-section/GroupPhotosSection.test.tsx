import { fireEvent, render, screen } from '@testing-library/react';
import React, { ChangeEvent, MouseEvent,ReactNode } from 'react';

import { GroupPhotosSection } from './GroupPhotosSection';
import { GroupPhoto } from '~/constants/creativity';
import type { MediaModalResult } from '~/shared/components/media-modal/MediaModal.types';

Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'mock-uuid-1234'
  }
});

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
    <button data-testid="mock-button-add" onClick={onClick}>{children}</button>
  )
}));

jest.mock('~/shared/components/design-system/photo-block/PhotoBlock', () => ({
  ImagePreviewBlock: ({ imageUrl, onChangeAltText, onChangeImage }: MockImagePreviewBlockProps) => (
    <div data-testid={`mock-image-preview-${imageUrl}`}>
      <button 
        data-testid={`trigger-alt-${imageUrl}`} 
        onClick={() => onChangeAltText('New Alt Text')}
      />
      <button 
        data-testid={`trigger-img-${imageUrl}`} 
        onClick={() => onChangeImage('new-url.jpg', { rect: { width: 50, height: 50, x: 0, y: 0 } })}
      />
    </div>
  )
}));

jest.mock('~/shared/components/design-system/text-field/TextField', () => ({
  CustomTextField: ({ label, value, onChange }: MockCustomTextFieldProps) => (
    <input
      data-testid={`mock-input-${value}`}
      value={value || ''}
      onChange={onChange}
      aria-label={label}
    />
  )
}));

jest.mock('~/shared/components/delete-card-modal/DeleteCardModal', () => ({
  __esModule: true,
  default: ({ open, onClose, onDelete }: MockDeleteModalProps) => {
    if (!open) return null;
    return (
      <div data-testid="mock-delete-modal">
        <button data-testid="modal-confirm" onClick={onDelete}>Confirm</button>
        <button data-testid="modal-cancel" onClick={onClose}>Cancel</button>
      </div>
    );
  }
}));


const mockOnChange = jest.fn();

const defaultPhotos: GroupPhoto[] = [
  { id: '1', src: 'img1.jpg', fileName: 'file1', caption: 'Caption 1', altText: 'Alt 1', crop: null },
  { id: '2', src: 'img2.jpg', fileName: 'file2', caption: 'Caption 2', altText: 'Alt 2', crop: null }
];

describe('GroupPhotosSection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the list of photos with correct indices', () => {
    render(<GroupPhotosSection photos={defaultPhotos} onChange={mockOnChange} />);

    expect(screen.getByText('Зображення 1')).toBeInTheDocument();
    expect(screen.getByText('Зображення 2')).toBeInTheDocument();
    expect(screen.getByTestId('mock-input-Caption 1')).toBeInTheDocument();
  });

  it('should add a new photo when the add button is clicked', () => {
    render(<GroupPhotosSection photos={defaultPhotos} onChange={mockOnChange} />);

    fireEvent.click(screen.getByTestId('mock-button-add'));

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const newPhotosArray = mockOnChange.mock.calls[0][0];
    
    expect(newPhotosArray).toHaveLength(3);
    expect(newPhotosArray[2].id).toBe('mock-uuid-1234');
    expect(newPhotosArray[2].src).toBe('');
  });

  it('should update caption when typing in the text field', () => {
    render(<GroupPhotosSection photos={defaultPhotos} onChange={mockOnChange} />);

    const captionInput = screen.getByTestId('mock-input-Caption 1');
    fireEvent.change(captionInput, { target: { value: 'Updated Caption' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const updatedPhotos = mockOnChange.mock.calls[0][0];
    expect(updatedPhotos[0].caption).toBe('Updated Caption');
  });

  it('should update alt text from ImagePreviewBlock', () => {
    render(<GroupPhotosSection photos={defaultPhotos} onChange={mockOnChange} />);

    fireEvent.click(screen.getByTestId('trigger-alt-img1.jpg'));

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const updatedPhotos = mockOnChange.mock.calls[0][0];
    expect(updatedPhotos[0].altText).toBe('New Alt Text');
  });

  it('should update both src and crop simultaneously when changed in ImagePreviewBlock', () => {
    render(<GroupPhotosSection photos={defaultPhotos} onChange={mockOnChange} />);

    fireEvent.click(screen.getByTestId('trigger-img-img1.jpg'));

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const updatedPhotos = mockOnChange.mock.calls[0][0];
    
    expect(updatedPhotos[0].src).toBe('new-url.jpg');
    expect(updatedPhotos[0].crop).toEqual({ rect: { width: 50, height: 50, x: 0, y: 0 } });
  });

  it('should open delete modal when trash icon is clicked', () => {
    render(<GroupPhotosSection photos={defaultPhotos} onChange={mockOnChange} />);

    expect(screen.queryByTestId('mock-delete-modal')).not.toBeInTheDocument();
    const trashButtons = screen.getAllByTestId('delete-photo-btn');
    fireEvent.click(trashButtons[0]);

    expect(screen.getByTestId('mock-delete-modal')).toBeInTheDocument();
  });

  it('should delete photo when confirmed in modal', () => {
    render(<GroupPhotosSection photos={defaultPhotos} onChange={mockOnChange} />);

    const trashButtons = screen.getAllByTestId('delete-photo-btn');
    fireEvent.click(trashButtons[0]);

    fireEvent.click(screen.getByTestId('modal-confirm'));

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const updatedPhotos = mockOnChange.mock.calls[0][0];
    
    expect(updatedPhotos).toHaveLength(1);
    expect(updatedPhotos[0].id).toBe('2');
  });

  it('should close modal without deleting when cancelled', () => {
    render(<GroupPhotosSection photos={defaultPhotos} onChange={mockOnChange} />);

    const trashButtons = screen.getAllByTestId('delete-photo-btn');
    fireEvent.click(trashButtons[0]);

    fireEvent.click(screen.getByTestId('modal-cancel'));

    expect(mockOnChange).not.toHaveBeenCalled();
    expect(screen.queryByTestId('mock-delete-modal')).not.toBeInTheDocument();
  });
});
