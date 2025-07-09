import { fireEvent, render, screen } from '@testing-library/react';

import { ImageCropper } from './ImageCropper';

jest.mock('react-image-crop', () => {
  return {
    __esModule: true,
    default: ({ crop, children }: any) => (
      <div data-testid="react-crop" data-crop={JSON.stringify(crop)}>
        {children}
      </div>
    ),
    makeAspectCrop: jest.fn((crop, aspect) => ({
      ...crop,
      height: crop.width / aspect
    })),
    centerCrop: jest.fn((crop, width, height) => ({
      ...crop,
      x: (width - crop.width) / 2,
      y: (height - crop.height) / 2
    }))
  };
});

describe('Image cropper', () => {
  it('should render an image for cropper', () => {
    render(<ImageCropper width={100} height={100} imageUrl="test.png" onCropComplete={() => {}} />);
    const img = screen.getByAltText('Source') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain('test.png');
  });

  it('should update crop state on image load', () => {
    const { getByAltText, getByTestId } = render(
      <ImageCropper width={100} height={50} imageUrl="test.png" onCropComplete={() => {}} />
    );

    const img = getByAltText('Source');

    Object.defineProperty(img, 'naturalWidth', { configurable: true, value: 200 });
    Object.defineProperty(img, 'naturalHeight', { configurable: true, value: 100 });

    fireEvent.load(img);

    const reactCropDiv = getByTestId('react-crop');
    const dataCrop = reactCropDiv.getAttribute('data-crop') ?? '{}';
    const cropProp = JSON.parse(dataCrop);

    expect(cropProp.width).toBeDefined();
    expect(cropProp.height).toBeDefined();
    expect(cropProp.width / cropProp.height).toBeCloseTo(2, 1);
  });
});
