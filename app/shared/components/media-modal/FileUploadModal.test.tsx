import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { FileUploadModal } from './FileUploadModal';

jest.mock('~/public/icons/arrowLeft.svg', () => 'ArrowLeftIcon');
jest.mock('next/image', () => ({
  __esModule: true,
   
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} data-testid="next-image" alt="mock-icon" />
  )
}));

jest.mock('~/shared/components/design-system/button/Button', () => ({
  __esModule: true,
  default: ({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled} data-testid={`btn-${label}`}>
      {label}
    </button>
  )
}));

jest.mock('./components/container/MediaModalContainer', () => ({
  __esModule: true,
  MediaModalContainer: ({
    open,
    children,
    headerLeft,
    footerLeft,
    footerRight
  }: {
    open: boolean;
    children: React.ReactNode;
    headerLeft: React.ReactNode;
    footerLeft: React.ReactNode;
    footerRight: React.ReactNode;
  }) => {
    if (!open) return null;
    return (
      <div data-testid="MediaModalContainer">
        <div data-testid="headerLeft">{headerLeft}</div>
        <div data-testid="children">{children}</div>
        <div data-testid="footerLeft">{footerLeft}</div>
        <div data-testid="footerRight">{footerRight}</div>
      </div>
    );
  }
}));

jest.mock('./views/upload-view/UploadView', () => ({
  __esModule: true,
  UploadView: ({ onPick }: { onPick: (data: { file: File }) => void }) => (
    <div data-testid="UploadView">
      <button
        data-testid="pick-zip"
        onClick={() => {
          const file = new File(['a'.repeat(2 * 1024 * 1024)], 'archive.zip', { type: 'application/zip' });
          onPick({ file });
        }}
      >
        Pick ZIP
      </button>
      <button
        data-testid="pick-image"
        onClick={() => {
          const file = new File([''], 'photo.jpg', { type: 'image/jpeg' });
          onPick({ file });
        }}
      >
        Pick Image
      </button>
    </div>
  )
}));

describe('FileUploadModal', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onApply: jest.fn().mockResolvedValue(undefined),
    accept: 'image/*,application/pdf',
    invalidFileError: 'Invalid file',
    isAllowedFile: jest.fn().mockReturnValue(true)
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render UploadView by default when no file is selected', () => {
    render(<FileUploadModal {...defaultProps} />);

    expect(screen.getByTestId('UploadView')).toBeInTheDocument();
    expect(screen.getByText('Завантажити файл')).toBeInTheDocument();

    expect(screen.queryByTestId('btn-Повернутись назад')).not.toBeInTheDocument();
    expect(screen.queryByTestId('btn-Скасувати')).not.toBeInTheDocument();
    expect(screen.queryByTestId('btn-Застосувати')).not.toBeInTheDocument();
  });

  it('should not render anything if open is false', () => {
    render(<FileUploadModal {...defaultProps} open={false} />);
    expect(screen.queryByTestId('MediaModalContainer')).not.toBeInTheDocument();
  });

  it('should show preview with correct data and buttons when ZIP file is picked', () => {
    render(<FileUploadModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('pick-zip'));

    expect(screen.queryByTestId('UploadView')).not.toBeInTheDocument();

    expect(screen.getByText('archive.zip')).toBeInTheDocument();
    expect(screen.getByText('2.00 MB')).toBeInTheDocument();

    const icon = screen.getByTestId('next-image');
    expect(icon).toHaveAttribute('src', '/icons/zip.svg');

    expect(screen.getByTestId('btn-Повернутись назад')).toBeInTheDocument();
    expect(screen.getByTestId('btn-Скасувати')).toBeInTheDocument();
    expect(screen.getByTestId('btn-Застосувати')).toBeInTheDocument();
  });

  it('should show correct icon when Image file is picked', () => {
    render(<FileUploadModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('pick-image'));

    const icon = screen.getByTestId('next-image');
    expect(icon).toHaveAttribute('src', '/icons/img.svg');
  });

  it('should clear selection and show UploadView when "Повернутись назад" is clicked', () => {
    render(<FileUploadModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('pick-zip'));
    expect(screen.getByText('archive.zip')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('btn-Повернутись назад'));

    expect(screen.queryByText('archive.zip')).not.toBeInTheDocument();
    expect(screen.getByTestId('UploadView')).toBeInTheDocument();
  });

  it('should call onClose when "Скасувати" is clicked', () => {
    render(<FileUploadModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('pick-zip'));
    fireEvent.click(screen.getByTestId('btn-Скасувати'));

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onApply and onClose when "Застосувати" is clicked', async () => {
    render(<FileUploadModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('pick-zip'));
    fireEvent.click(screen.getByTestId('btn-Застосувати'));

    expect(defaultProps.onApply).toHaveBeenCalledTimes(1);
    expect(defaultProps.onApply).toHaveBeenCalledWith(expect.any(File));

    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });
});
