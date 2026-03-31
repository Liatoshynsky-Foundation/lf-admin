import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ImagePreviewBlock } from './PhotoBlock';
import { readFileAsDataURL } from '~/lib/utils/readFileAsDataURL';
import type { MediaModalOpenState, MediaModalResult } from '~/shared/components/media-modal/MediaModal.types';

jest.mock('~/lib/utils/readFileAsDataURL', () => ({
  readFileAsDataURL: jest.fn()
}));

jest.mock('~/shared/hooks/use-image-metadata/useImageMetadata', () => ({
  useImageMetadata: () => ({
    dimensions: { width: 200, height: 150 },
    fileName: 'test.jpg'
  })
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

  it('should render correctly with initial image', () => {
    render(
      <ImagePreviewBlock
        imageUrl="https://example.com/test.jpg"
        onChangeImage={onChangeImage}
        title="Основне зображення"
      />
    );

    expect(screen.getByText(/Основне зображення/)).toBeInTheDocument();
    expect(screen.getByAltText('Preview')).toHaveAttribute('src', 'https://example.com/test.jpg');
    expect(screen.getByText(/Назва файлу test\.jpg/)).toBeInTheDocument();
    expect(screen.getByText(/Розмір: 200 × 150/)).toBeInTheDocument();
  });

  it('should open MediaModal on "Редагувати" click', async () => {
    const user = userEvent.setup();

    render(
      <ImagePreviewBlock
        imageUrl="https://example.com/test.jpg"
        onChangeImage={onChangeImage}
      />
    );

    await user.click(screen.getByRole('button', { name: /Редагувати/i }));

    expect(screen.getByTestId('media-modal')).toBeInTheDocument();
    expect(screen.getByTestId('initial-step')).toHaveTextContent('CROP');
  });

  it('should open MediaModal and close it', async () => {
    const user = userEvent.setup();

    render(
      <ImagePreviewBlock
        imageUrl="https://example.com/test.jpg"
        onChangeImage={onChangeImage}
      />
    );

    await user.click(screen.getByRole('button', { name: /Редагувати/i }));

    expect(screen.getByTestId('media-modal')).toBeInTheDocument();

    await user.click(screen.getByTestId('close'));

    await waitFor(() => {
      expect(screen.queryByTestId('media-modal')).not.toBeInTheDocument();
    });
  });

  it('should apply upload result in mediaModal (updates preview + calls onChangeImage + closes)', async () => {
    const user = userEvent.setup();

    render(
      <ImagePreviewBlock
        imageUrl="https://example.com/test.jpg"
        onChangeImage={onChangeImage}
      />
    );

    await user.click(screen.getByRole('button', { name: /Змінити зображення/i }));

    expect(screen.getByTestId('media-modal')).toBeInTheDocument();
    expect(screen.getByTestId('initial-tab')).toHaveTextContent('UPLOAD');

    await user.click(screen.getByTestId('apply-upload'));

    await waitFor(() => {
      expect(onChangeImage).toHaveBeenCalledTimes(1);
      expect(readFileAsDataURL).toHaveBeenCalledTimes(1);
      expect(screen.getByAltText('Preview')).toHaveAttribute(
        'src',
        expect.stringContaining('data:image/png;base64,mockImage')
      );
    });

    await waitFor(() => {
      expect(screen.queryByTestId('media-modal')).not.toBeInTheDocument();
    });
  });
});