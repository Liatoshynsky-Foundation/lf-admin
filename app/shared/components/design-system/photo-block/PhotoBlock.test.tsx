import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import toast from 'react-hot-toast';

import { ImagePreviewBlock } from './PhotoBlock';
import { readFileAsDataURL } from '~/lib/utils/readFileAsDataURL';
import type { MediaModalOpenState, MediaModalResult } from '~/shared/components/media-modal/MediaModal.types';

/* -------------------- MOCKS -------------------- */

jest.mock('../cropper-modal/CropperModal', () => ({
  CropperModal: ({ open, handleClose }: any) => {
    if (!open) return null;

    return (
      <div data-testid="cropper-modal">
        <button onClick={handleClose}>close</button>
      </div>
    );
  }
}));

jest.mock('react-hot-toast', () => {
  const success = jest.fn();
  const error = jest.fn();

  return {
    __esModule: true,
    default: { success, error },
    success,
    error
  };
});

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

jest.mock('~/shared/hooks/use-image-metadata/useImageMetadata', () => ({
  useImageMetadata: () => ({
    dimensions: null,
    fileName: 'test.jpg'
  })
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

        <button data-testid="close" onClick={onClose}>
          close
        </button>

        <button
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

/* -------------------- TESTS -------------------- */

describe('ImagePreviewBlock', () => {
  const onChangeImage = jest.fn();

  const renderComponent = (props = {}) =>
    render(
      <ImagePreviewBlock
        imageUrl="test.jpg"
        cropWidth={300}
        cropHeight={200}
        onChangeImage={onChangeImage}
        {...props}
      />
    );

  beforeEach(() => {
    jest.clearAllMocks();

    (readFileAsDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,mockImage');
  });

  it('opens cropper modal on "Редагувати" click (legacy)', async () => {
    const user = userEvent.setup();

    renderComponent();

    await user.click(screen.getByRole('button', { name: /редагувати/i }));

    expect(screen.getByTestId('cropper-modal')).toBeInTheDocument();
  });

  it('closes cropper modal', async () => {
    const user = userEvent.setup();

    renderComponent();

    await user.click(screen.getByRole('button', { name: /редагувати/i }));
    await user.click(screen.getByRole('button', { name: /close/i }));

    await waitFor(() => {
      expect(screen.queryByTestId('cropper-modal')).not.toBeInTheDocument();
    });
  });

  it('opens media modal in CROP mode and closes it', async () => {
    const user = userEvent.setup();

    renderComponent({ editorMode: 'mediaModal' });

    await user.click(screen.getByRole('button', { name: /редагувати/i }));

    expect(screen.getByTestId('media-modal')).toBeInTheDocument();
    expect(screen.getByTestId('initial-step')).toHaveTextContent('CROP');

    await user.click(screen.getByTestId('close'));

    await waitFor(() => {
      expect(screen.queryByTestId('media-modal')).not.toBeInTheDocument();
    });
  });

  it('opens media modal in UPLOAD mode', async () => {
    const user = userEvent.setup();

    renderComponent({ editorMode: 'mediaModal' });

    await user.click(screen.getByRole('button', { name: /змінити/i }));

    expect(screen.getByTestId('initial-tab')).toHaveTextContent('UPLOAD');
  });

  it('applies upload result (updates preview + calls onChangeImage)', async () => {
    const user = userEvent.setup();

    renderComponent({ editorMode: 'mediaModal' });

    await user.click(screen.getByRole('button', { name: /змінити/i }));
    await user.click(screen.getByTestId('apply-upload'));

    await waitFor(() => {
      expect(onChangeImage).toHaveBeenCalledTimes(1);
      expect(readFileAsDataURL).toHaveBeenCalledTimes(1);
      expect(screen.getByAltText('Selected')).toHaveAttribute(
        'src',
        expect.stringContaining('data:image/png;base64,mockImage')
      );
    });
  });

  it('applies non-upload result (used/gallery)', async () => {
    const user = userEvent.setup();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        blob: () => Promise.resolve(new Blob(['img'], { type: 'image/jpeg' }))
      } as Response)
    );

    renderComponent({ editorMode: 'mediaModal' });

    await user.click(screen.getByRole('button', { name: /змінити/i }));
    await user.click(screen.getByTestId('apply-non-upload'));

    await waitFor(() => {
      expect(onChangeImage).toHaveBeenCalledTimes(1);
    });
  });

  it('shows success toast on successful apply', async () => {
    const user = userEvent.setup();

    renderComponent({ editorMode: 'mediaModal' });

    await user.click(screen.getByRole('button', { name: /змінити/i }));
    await user.click(screen.getByTestId('apply-upload'));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Зображення змінено');
    });
  });

  it('shows error toast if apply fails', async () => {
    const user = userEvent.setup();

    (readFileAsDataURL as jest.Mock).mockRejectedValueOnce(new Error('fail'));

    renderComponent({ editorMode: 'mediaModal' });

    await user.click(screen.getByRole('button', { name: /змінити/i }));
    await user.click(screen.getByTestId('apply-upload'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Не вдалося змінити');
    });
  });

  it('handles file input change in legacy mode', async () => {
    const user = userEvent.setup();

    renderComponent({ imageUrl: '' });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['img'], 'test.png', { type: 'image/png' });

    await user.upload(input, file);

    await waitFor(() => {
      expect(readFileAsDataURL).toHaveBeenCalledWith(file);
      expect(onChangeImage).toHaveBeenCalledWith(file);
    });
  });

  it('renders placeholder when no image', () => {
    renderComponent({ imageUrl: '' });

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('updates preview when imageUrl changes', async () => {
    const { rerender } = renderComponent({ imageUrl: 'old.jpg' });

    expect(screen.getByRole('img')).toHaveAttribute('src', 'old.jpg');

    rerender(<ImagePreviewBlock imageUrl="new.jpg" cropWidth={300} cropHeight={200} onChangeImage={onChangeImage} />);

    await waitFor(() => {
      expect(screen.getByRole('img')).toHaveAttribute('src', 'new.jpg');
    });
  });

  it('renders and updates alt text', async () => {
    const user = userEvent.setup();
    const onChangeAltText = jest.fn();

    renderComponent({
      showAlternativeText: true,
      altText: 'old',
      onChangeAltText
    });

    const input = screen.getByLabelText(/alt текст/i);

    await user.clear(input);
    await user.type(input, 'new alt');

    expect(onChangeAltText).toHaveBeenCalled();
  });
});
