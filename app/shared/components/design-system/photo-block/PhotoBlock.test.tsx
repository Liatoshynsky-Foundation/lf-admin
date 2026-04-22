 
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import toast from 'react-hot-toast';

import { ImagePreviewBlock } from './PhotoBlock';
import type { MediaModalOpenState, MediaModalResult } from '~/shared/components/media-modal/MediaModal.types';

/* -------------------- MOCKS -------------------- */

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

jest.mock('~/public/icons/image.svg', () => ({
  __esModule: true,
  default: () => <span data-testid="image-icon" />
}));

jest.mock('~/public/icons/pencil.svg', () => ({
  __esModule: true,
  default: () => <span data-testid="pencil-icon" />
}));

jest.mock('~/shared/hooks/use-image-metadata/useImageMetadata', () => ({
  useImageMetadata: () => ({
    dimensions: { width: 1024, height: 768 },
    fileName: 'test.jpg'
  })
}));

jest.mock('~/hooks/use-cropped-image/use-cropped-image', () => ({
  useCroppedImage: () => ({
    styles: { container: {}, image: {} },
    onLoad: jest.fn()
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
          data-testid="apply-upload-success"
          onClick={() =>
            onApply({
              selected: {
                kind: 'upload',
                id: 'upload-1',
                fileName: 'new.png',
                file: new File([''], 'new.png')
              },
              uploadResult: { url: 'https://cdn.com/uploaded.png' },
              crop: { rect: { x: 0, y: 0, width: 100, height: 100 } }
            })
          }
        >
          apply
        </button>

        <button
          data-testid="apply-fail"
          onClick={() =>
            onApply({
              selected: { kind: 'upload', id: 'fail', fileName: 'f.png', file: new File([''], 'f.png') },
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
        onChangeImage={onChangeImage}
        {...props}
      />
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with initial image', () => {
    renderComponent({ title: 'Основне зображення' });

    expect(screen.getByText(/Основне зображення/)).toBeInTheDocument();
    expect(screen.getByAltText('Основне зображення')).toHaveAttribute('src', 'test.jpg');
    expect(screen.getByText(/Назва файлу/)).toBeInTheDocument();
    expect(screen.getByText(/test\.jpg/)).toBeInTheDocument();
    expect(screen.getByText(/1024 × 768/)).toBeInTheDocument();
  });

  it('should open MediaModal on "Редагувати" click', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: /редагувати/i }));

    expect(screen.getByTestId('media-modal')).toBeInTheDocument();
    expect(screen.getByTestId('initial-step')).toHaveTextContent('CROP');
  });

  it('should open MediaModal in UPLOAD tab on "Змінити зображення" click', async () => {
    const user = userEvent.setup();

    renderComponent();

    await user.click(screen.getByRole('button', { name: /змінити зображення/i }));

    expect(screen.getByTestId('media-modal')).toBeInTheDocument();
    expect(screen.getByTestId('initial-tab')).toHaveTextContent('UPLOAD');
  });

  it('closes media modal on close click', async () => {
    const user = userEvent.setup();

    renderComponent();

    await user.click(screen.getByRole('button', { name: /редагувати/i }));
    await user.click(screen.getByTestId('close'));

    expect(screen.queryByTestId('media-modal')).not.toBeInTheDocument();
  });

  it('applies upload result successfully', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: /змінити зображення/i }));
    await user.click(screen.getByTestId('apply-upload-success'));

    await waitFor(() => {
      expect(onChangeImage).toHaveBeenCalledWith(
        'https://cdn.com/uploaded.png',
        { rect: { x: 0, y: 0, width: 100, height: 100 } }
      );
      expect(toast.success).toHaveBeenCalledWith('Зображення змінено');
      expect(screen.getByAltText('Selected')).toHaveAttribute('src', 'https://cdn.com/uploaded.png');
    });
  });

  it('shows error toast if URL is missing in result', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: /змінити зображення/i }));
    await user.click(screen.getByTestId('apply-fail'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Не вдалося отримати URL зображення');
      expect(onChangeImage).not.toHaveBeenCalled();
    });
  });

  it('renders placeholder when no image', () => {
    renderComponent({ imageUrl: '' });

    expect(screen.getByTestId('cloud-upload-icon')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('updates preview when imageUrl changes', () => {
    const { rerender } = renderComponent({ imageUrl: 'first.jpg' });
    expect(screen.getByAltText('Selected')).toHaveAttribute('src', 'first.jpg');

    rerender(<ImagePreviewBlock imageUrl="second.jpg" onChangeImage={onChangeImage} />);
    expect(screen.getByAltText('Selected')).toHaveAttribute('src', 'second.jpg');
  });

  it('renders and updates alt text', async () => {
    const user = userEvent.setup();
    const onChangeAltText = jest.fn();

    renderComponent({
      showAlternativeText: true,
      altText: 'old alt',
      onChangeAltText
    });

    const input = screen.getByLabelText(/alt текст зображення/i);
    expect(input).toHaveValue('old alt');

    await user.type(input, '!');
    expect(onChangeAltText).toHaveBeenCalled();
  });

  it('disables buttons when disabled prop is true', () => {
    renderComponent({ disabled: true });

    expect(screen.getByRole('button', { name: /редагувати/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /змінити зображення/i })).toBeDisabled();
  });

  it('renders oval preview when oval prop is true', () => {
    renderComponent({ oval: true });
    const img = screen.getByAltText('Selected');
    expect(img).toBeInTheDocument();
  });
});
