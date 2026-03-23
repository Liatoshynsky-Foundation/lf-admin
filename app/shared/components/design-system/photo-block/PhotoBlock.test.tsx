import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ImagePreviewBlock } from './PhotoBlock';
import { readFileAsDataURL } from '~/lib/utils/readFileAsDataURL';
import type { MediaModalOpenState, MediaModalResult } from '~/shared/components/media-modal/MediaModal.types';

jest.mock('~/lib/utils/readFileAsDataURL', () => ({
  readFileAsDataURL: jest.fn()
}));

jest.mock('~/public/icons/image.svg', () => ({
  __esModule: true,
  default: () => null
}));

jest.mock('~/public/icons/pencil.svg', () => ({
  __esModule: true,
  default: () => null
}));

type MediaModalProps = {
  open: boolean;
  initial?: MediaModalOpenState;
  onClose: () => void;
  onApply: (result: MediaModalResult) => void;
};

jest.mock('~/shared/components/media-modal/MediaModal', () => ({
  MediaModal: ({ open, initial, onApply, onClose }: MediaModalProps) => {
    if (!open) return null;

    return (
      <div data-testid="media-modal">
        <div data-testid="initial-step">{initial?.step ?? ''}</div>
        <div data-testid="initial-tab">{initial?.tab ?? ''}</div>

        <button type="button" data-testid="close" onClick={onClose}>
          close
        </button>

        <button
          type="button"
          data-testid="apply-upload"
          onClick={() =>
            onApply({
              selected: {
                kind: 'upload',
                id: 'upload-1',
                fileName: 'x.png',
                file: new File(['x'], 'x.png', { type: 'image/png' })
              },
              crop: null
            })
          }
        >
          apply
        </button>
        <button
          type="button"
          data-testid="apply-non-upload"
          onClick={() =>
            onApply({
              selected: {
                kind: 'used',
                id: '1',
                fileName: 'test.jpg',
                src: 'url',
                locale: 'uk'
              },
              crop: null
            })
          }
        >
          apply-non-upload
        </button>
      </div>
    );
  }
}));

describe('ImagePreviewBlock', () => {
  const onChangeImage = jest.fn();

  beforeEach(() => {
    onChangeImage.mockClear();
    (readFileAsDataURL as jest.Mock).mockReset();
    (readFileAsDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,mockImage');
  });

  it('should open cropper modal on "Редагувати" click (legacy)', async () => {
    const user = userEvent.setup();

    render(
      <ImagePreviewBlock
        imageUrl="https://example.com/test.jpg"
        cropWidth={300}
        cropHeight={200}
        onChangeImage={onChangeImage}
      />
    );

    await user.click(screen.getByRole('button', { name: /Редагувати/i }));

    await waitFor(() => {
      expect(screen.getByText('Редагування зображення')).toBeInTheDocument();
    });
  });

  it('should open MediaModal with CROP step in mediaModal mode and close it', async () => {
    const user = userEvent.setup();

    render(
      <ImagePreviewBlock
        imageUrl="https://example.com/test.jpg"
        cropWidth={300}
        cropHeight={200}
        onChangeImage={onChangeImage}
        editorMode="mediaModal"
      />
    );

    await user.click(screen.getByRole('button', { name: /Редагувати/i }));

    expect(screen.getByTestId('media-modal')).toBeInTheDocument();
    expect(screen.getByTestId('initial-step')).toHaveTextContent('CROP');

    await user.click(screen.getByTestId('close'));

    await waitFor(() => {
      expect(screen.queryByTestId('media-modal')).not.toBeInTheDocument();
    });
  });

  it('should apply upload result in mediaModal mode (updates preview + calls onChangeImage + closes)', async () => {
    const user = userEvent.setup();

    render(
      <ImagePreviewBlock
        imageUrl="https://example.com/test.jpg"
        cropWidth={300}
        cropHeight={200}
        onChangeImage={onChangeImage}
        editorMode="mediaModal"
      />
    );

    await user.click(screen.getByRole('button', { name: /Змінити зображення/i }));

    expect(screen.getByTestId('media-modal')).toBeInTheDocument();
    expect(screen.getByTestId('initial-tab')).toHaveTextContent('UPLOAD');

    await user.click(screen.getByTestId('apply-upload'));

    await waitFor(() => {
      expect(onChangeImage).toHaveBeenCalledTimes(1);
      expect(readFileAsDataURL).toHaveBeenCalledTimes(1);
      expect(screen.getByAltText('Selected')).toHaveAttribute(
        'src',
        expect.stringContaining('data:image/png;base64,mockImage')
      );
    });

    await waitFor(() => {
      expect(screen.queryByTestId('media-modal')).not.toBeInTheDocument();
    });
  });

  it('renders "No File" when no image', () => {
    render(<ImagePreviewBlock imageUrl="" cropWidth={300} cropHeight={200} onChangeImage={onChangeImage} />);

    expect(screen.getByText(/no file/i)).toBeInTheDocument();
  });

  it('handles file input change in legacy mode', async () => {
    const user = userEvent.setup();

    render(<ImagePreviewBlock imageUrl="" cropWidth={300} cropHeight={200} onChangeImage={onChangeImage} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['img'], 'test.png', { type: 'image/png' });

    await user.upload(input, file);

    await waitFor(() => {
      expect(readFileAsDataURL).toHaveBeenCalledWith(file);
      expect(onChangeImage).toHaveBeenCalledWith(file);
    });
  });

  it('does not apply if mediaModal result is not upload', async () => {
    const user = userEvent.setup();

    render(
      <ImagePreviewBlock
        imageUrl="test"
        cropWidth={300}
        cropHeight={200}
        onChangeImage={onChangeImage}
        editorMode="mediaModal"
      />
    );

    await user.click(screen.getByRole('button', { name: /змінити/i }));

    await user.click(screen.getByTestId('apply-non-upload'));

    expect(onChangeImage).not.toHaveBeenCalled();
  });

  it('updates preview when imageUrl changes', async () => {
    const { rerender } = render(
      <ImagePreviewBlock imageUrl="old.jpg" cropWidth={300} cropHeight={200} onChangeImage={onChangeImage} />
    );

    expect(screen.getByRole('img')).toHaveAttribute('src', 'old.jpg');

    rerender(<ImagePreviewBlock imageUrl="new.jpg" cropWidth={300} cropHeight={200} onChangeImage={onChangeImage} />);

    await waitFor(() => {
      expect(screen.getByRole('img')).toHaveAttribute('src', 'new.jpg');
    });
  });

  it('opens media modal in UPLOAD mode', async () => {
    const user = userEvent.setup();

    render(
      <ImagePreviewBlock
        imageUrl="test.jpg"
        cropWidth={300}
        cropHeight={200}
        onChangeImage={onChangeImage}
        editorMode="mediaModal"
      />
    );

    await user.click(screen.getByRole('button', { name: /змінити/i }));

    expect(screen.getByTestId('initial-tab')).toHaveTextContent('UPLOAD');
  });

  jest.mock('~/shared/hooks/use-image-metadata/useImageMetadata', () => ({
    useImageMetadata: () => ({
      dimensions: null,
      fileName: 'test.jpg'
    })
  }));
});
