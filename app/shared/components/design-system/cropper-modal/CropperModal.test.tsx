import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import getCroppedImg from '../../../../lib/utils/CropperHelper';
import { CropperModal } from './CropperModal';

jest.mock('../../../../lib/utils/CropperHelper', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve({ dataUrl: 'mocked-image-data-url' }))
}));

jest.mock('./ImageCropper/ImageCropper', () => ({
  __esModule: true,
  ImageCropper: ({ onCropComplete }: any) => {
    React.useEffect(() => {
      onCropComplete({ x: 10, y: 10, width: 100, height: 50, unit: 'px' });
    }, []);
    return <div data-testid="image-cropper-mock" />;
  }
}));

describe('Cropper modal', () => {
  const width = 10;
  const height = 10;
  const imageUrl = './test.png';

  it('should render the modal', () => {
    render(
      <CropperModal
        open={true}
        width={width}
        height={height}
        imageUrl={imageUrl}
        handleClose={() => {}}
        handleSetNewPic={() => {}}
      />
    );
    expect(screen.getByText('Редагування зображення')).toBeInTheDocument();
  });
  it('should work on click at closing', () => {
    const mockClose = jest.fn();
    render(
      <CropperModal
        open={true}
        width={width}
        height={height}
        imageUrl={imageUrl}
        handleClose={mockClose}
        handleSetNewPic={() => {}}
      />
    );
    const closeBtn = screen.getByRole('button', { name: /Скасувати/i });
    fireEvent.click(closeBtn);
    expect(mockClose).toHaveBeenCalled();
  });
  it('should call onCropComplete and sets crop state', async () => {
    const handleClose = jest.fn();
    const handleSetNewPic = jest.fn();
    render(
      <CropperModal
        width={width}
        height={height}
        imageUrl={imageUrl}
        open={true}
        handleClose={handleClose}
        handleSetNewPic={handleSetNewPic}
      />
    );
    const saveButton = screen.getByRole('button', { name: /Зберегти/i });

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(getCroppedImg).toHaveBeenCalled();
      expect(handleSetNewPic).toHaveBeenCalledWith('mocked-image-data-url');
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
