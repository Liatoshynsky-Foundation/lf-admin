import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import toast from 'react-hot-toast';

import { type FileDetailsSidebarFile, FileInfoSidebar } from './FileInfoSidebar';
import { downloadFile } from '~/lib/utils/downloadFile';

const mockUpdateAsset = jest.fn();
const mockDeleteAsset = jest.fn();

jest.mock('~/types/graphql/generated/graphql', () => ({
  ...jest.requireActual('~/types/graphql/generated/graphql'),
  useUpdateAssetMutation: () => [mockUpdateAsset, { loading: false }],
  useDeleteAssetMutation: () => [mockDeleteAsset, { loading: false }]
}));

jest.mock('../design-system/tooltip/Tooltip', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

jest.mock('~/shared/components/design-system/text-field/TextField', () => ({
  __esModule: true,
  CustomTextField: ({
    fullWidth: _f,
    minRows: _m,
    multiline: _ml,
    ...props
  }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    fullWidth?: boolean;
    minRows?: number;
    multiline?: boolean;
  }) => <textarea data-testid="desc" {...props} />
}));

jest.mock('~/lib/utils/formatUsageCount', () => ({
  __esModule: true,
  formatUsageCount: String
}));

jest.mock('~/lib/utils/downloadFile', () => ({
  __esModule: true,
  downloadFile: jest.fn().mockResolvedValue(undefined)
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('~/public/icons/close.svg', () => ({ __esModule: true, default: () => <svg data-testid="CloseIcon" /> }));
jest.mock('~/public/icons/download.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="DownloadIcon" />
}));
jest.mock('~/public/icons/empty_trash.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="TrashIcon" />
}));
jest.mock('~/public/icons/pen_line.svg', () => ({
  __esModule: true,
  default: (p: React.SVGProps<SVGSVGElement>) => <svg data-testid="EditIcon" {...p} />
}));
jest.mock('~/public/icons/picture.svg', () => ({ __esModule: true, default: () => <svg data-testid="PictureIcon" /> }));
jest.mock('~/public/icons/star.svg', () => ({ __esModule: true, default: () => <svg data-testid="StarIcon" /> }));
jest.mock('~/public/icons/type-audio.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="AudioIcon" />
}));
jest.mock('~/public/icons/type-pdf.svg', () => ({ __esModule: true, default: () => <svg data-testid="PdfIcon" /> }));
jest.mock('~/public/icons/zoom-in.svg', () => ({ __esModule: true, default: () => <svg data-testid="ZoomInIcon" /> }));

jest.mock('~/public/icons/doc.svg', () => ({ __esModule: true, default: () => <svg data-testid="DocIcon" /> }));
jest.mock('~/public/icons/xls.svg', () => ({ __esModule: true, default: () => <svg data-testid="XlsIcon" /> }));
jest.mock('~/public/icons/video-file.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="VideoIcon" />
}));
jest.mock('~/public/icons/zip.svg', () => ({ __esModule: true, default: () => <svg data-testid="ArchiveIcon" /> }));

const commitMock = jest.fn();
const setDraftMock = jest.fn();
jest.mock('./useAutosavedDescription', () => ({
  __esModule: true,
  useAutosavedDescription: () => ({
    draft: 'initial desc',
    setDraft: setDraftMock,
    commit: commitMock
  })
}));

jest.mock('./image-preview-modal/ImagePreviewModal', () => ({
  __esModule: true,
  ImagePreviewModal: ({ open, src, alt }: { open: boolean; src: string; alt: string }) =>
    open ? <div data-testid="ImagePreviewModal" data-src={src} data-alt={alt} /> : null
}));

describe('FileInfoSidebar', () => {
  beforeEach(() => {
    commitMock.mockClear();
    setDraftMock.mockClear();
    mockUpdateAsset.mockClear();
    mockDeleteAsset.mockClear();
    (downloadFile as jest.Mock).mockClear();
    (toast.success as jest.Mock).mockClear();
    (toast.error as jest.Mock).mockClear();
  });

  const baseFile: FileDetailsSidebarFile = {
    id: 'f1',
    type: 'image',
    filename: 'cat.png',
    previewUrl: '/cat.png',
    downloadUrl: 'https://example.com/cat.png',
    addedBy: { name: 'Alice', avatarUrl: '/a.png' },
    addedAt: '2025-01-01',
    format: 'png',
    size: '123kb',
    usageLinks: [{ id: 'u1', label: 'Page 1', href: '/p1' }],
    description: 'server desc',
    isStarred: false
  };

  it('should render filename, meta, links, and description field', () => {
    render(
      <FileInfoSidebar file={baseFile} onClose={jest.fn()} onDescriptionSave={jest.fn()} onRequestAction={jest.fn()} />
    );

    expect(screen.getByText('cat.png')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('2025-01-01')).toBeInTheDocument();
    expect(screen.getByText('Формат: png')).toBeInTheDocument();
    expect(screen.getByText('Розмір: 123kb')).toBeInTheDocument();

    expect(screen.getByText('Page 1')).toBeInTheDocument();

    const desc = screen.getByTestId('desc') as HTMLTextAreaElement;
    expect(desc.value).toBe('initial desc');
  });

  it('should call onClose when close button clicked', () => {
    const onClose = jest.fn();

    render(<FileInfoSidebar file={baseFile} onClose={onClose} />);

    fireEvent.click(screen.getByLabelText('Close sidebar'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should render fallback values when file is missing', () => {
    render(<FileInfoSidebar file={null} onClose={jest.fn()} />);

    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    expect(screen.getByText('Формат: —')).toBeInTheDocument();
    expect(screen.getByText('Розмір: —')).toBeInTheDocument();
    expect(screen.getByText('Немає попереднього перегляду')).toBeInTheDocument();
    expect(screen.getByTestId('desc')).toBeDisabled();
  });

  it('should render ArchiveIcon when file type is archive', () => {
    const archiveFile: FileDetailsSidebarFile = { ...baseFile, type: 'archive' };
    render(<FileInfoSidebar file={archiveFile} onClose={jest.fn()} />);

    const archiveIcons = screen.getAllByTestId('ArchiveIcon');
    expect(archiveIcons.length).toBeGreaterThan(0);
  });

  it('should disable actions when file is missing id', () => {
    const fileNoId = { ...baseFile, id: '' };

    render(
      <FileInfoSidebar file={fileNoId as FileDetailsSidebarFile} onClose={jest.fn()} onRequestAction={jest.fn()} />
    );

    expect(screen.getByLabelText('Додати в обрані')).toBeDisabled();
    expect(screen.getByLabelText('Перейменувати')).toBeDisabled();
    expect(screen.getByLabelText('Видалити')).toBeDisabled();
    expect(screen.getByLabelText('Завантажити')).toBeDisabled();
  });

  it('should call onToggleStar when favorite button is clicked', () => {
    const onToggleStar = jest.fn();

    render(<FileInfoSidebar file={baseFile} onClose={jest.fn()} onToggleStar={onToggleStar} />);

    fireEvent.click(screen.getByLabelText('Додати в обрані'));

    expect(onToggleStar).toHaveBeenCalledWith('f1', true);
  });

  it('should show error toast when custom favorite handler fails', async () => {
    const onToggleStar = jest.fn().mockRejectedValue(new Error('Favorite failed'));

    render(<FileInfoSidebar file={baseFile} onClose={jest.fn()} onToggleStar={onToggleStar} />);

    fireEvent.click(screen.getByLabelText('Додати в обрані'));

    await waitFor(() => {
      expect(onToggleStar).toHaveBeenCalledWith('f1', true);
    });
    expect(toast.error).toHaveBeenCalledWith('Favorite failed');
  });

  it('should update asset favorite state when onToggleStar is not provided', async () => {
    render(<FileInfoSidebar file={baseFile} onClose={jest.fn()} />);

    fireEvent.click(screen.getByLabelText('Додати в обрані'));

    await waitFor(() => {
      expect(mockUpdateAsset).toHaveBeenCalledWith({
        variables: {
          id: 'f1',
          input: { isStarred: true }
        }
      });
    });
  });

  it('should toggle starred file to not starred', () => {
    const onToggleStar = jest.fn();
    const starredFile: FileDetailsSidebarFile = { ...baseFile, isStarred: true };

    render(<FileInfoSidebar file={starredFile} onClose={jest.fn()} onToggleStar={onToggleStar} />);

    fireEvent.click(screen.getByLabelText('Забрати з обраних'));

    expect(onToggleStar).toHaveBeenCalledWith('f1', false);
  });

  it('should show error toast when favorite update fails', async () => {
    mockUpdateAsset.mockRejectedValueOnce(new Error('Update failed'));

    render(<FileInfoSidebar file={baseFile} onClose={jest.fn()} />);

    fireEvent.click(screen.getByLabelText('Додати в обрані'));

    await waitFor(() => {
      expect(mockUpdateAsset).toHaveBeenCalledTimes(1);
    });
    expect(toast.error).toHaveBeenCalledWith('Update failed');
  });

  it('should show fallback error toast when favorite update fails without Error instance', async () => {
    mockUpdateAsset.mockRejectedValueOnce('Update failed');

    render(<FileInfoSidebar file={baseFile} onClose={jest.fn()} />);

    fireEvent.click(screen.getByLabelText('Додати в обрані'));

    await waitFor(() => {
      expect(mockUpdateAsset).toHaveBeenCalledTimes(1);
    });
    expect(toast.error).toHaveBeenCalledWith('Не вдалося оновити статус обраного файлу. Спробуйте пізніше.');
  });

  it('should call onDeleteRequest when delete button is clicked', () => {
    const onDeleteRequest = jest.fn();

    render(<FileInfoSidebar file={baseFile} onClose={jest.fn()} onDeleteRequest={onDeleteRequest} />);

    fireEvent.click(screen.getByLabelText('Видалити'));

    expect(onDeleteRequest).toHaveBeenCalledWith('f1');
    expect(screen.queryByText('Видалення неможливе')).not.toBeInTheDocument();
  });

  it('should delete asset from local delete modal when onDeleteRequest is not provided', async () => {
    const onClose = jest.fn();
    const deletableFile: FileDetailsSidebarFile = { ...baseFile, usageLinks: [] };
    const cache = {
      evict: jest.fn(),
      gc: jest.fn(),
      identify: jest.fn().mockReturnValue('Asset:f1')
    };

    render(<FileInfoSidebar file={deletableFile} onClose={onClose} />);

    fireEvent.click(screen.getByLabelText('Видалити'));
    fireEvent.click(screen.getByRole('button', { name: 'Видалити' }));

    await waitFor(() => {
      expect(mockDeleteAsset).toHaveBeenCalledWith({
        variables: { id: 'f1' },
        update: expect.any(Function)
      });
    });
    const update = mockDeleteAsset.mock.calls[0][0].update;
    update(cache);

    expect(cache.identify).toHaveBeenCalledWith({ __typename: 'Asset', id: 'f1' });
    expect(cache.evict).toHaveBeenCalledWith({ id: 'Asset:f1' });
    expect(cache.gc).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith('Файл успішно видалено');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should close local delete modal without deleting when cancel is clicked', async () => {
    const deletableFile: FileDetailsSidebarFile = { ...baseFile, usageLinks: [] };

    render(<FileInfoSidebar file={deletableFile} onClose={jest.fn()} />);

    fireEvent.click(screen.getByLabelText('Видалити'));
    expect(screen.getByText('Підтвердити видалення')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Скасувати' }));

    await waitFor(() => {
      expect(screen.queryByText('Підтвердити видалення')).not.toBeInTheDocument();
    });
    expect(mockDeleteAsset).not.toHaveBeenCalled();
  });

  it('should open the local delete modal when usage links are omitted', () => {
    const fileWithoutUsageLinks: FileDetailsSidebarFile = { ...baseFile, usageLinks: undefined };

    render(<FileInfoSidebar file={fileWithoutUsageLinks} onClose={jest.fn()} />);

    fireEvent.click(screen.getAllByRole('button')[2]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should show error toast when local delete fails', async () => {
    const onClose = jest.fn();
    const deletableFile: FileDetailsSidebarFile = { ...baseFile, usageLinks: [] };
    mockDeleteAsset.mockRejectedValueOnce(new Error('Delete failed'));

    render(<FileInfoSidebar file={deletableFile} onClose={onClose} />);

    fireEvent.click(screen.getByLabelText('Видалити'));
    fireEvent.click(screen.getByRole('button', { name: 'Видалити' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Delete failed');
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should show fallback error toast when local delete fails without Error instance', async () => {
    const onClose = jest.fn();
    const deletableFile: FileDetailsSidebarFile = { ...baseFile, usageLinks: [] };
    mockDeleteAsset.mockRejectedValueOnce('Delete failed');

    render(<FileInfoSidebar file={deletableFile} onClose={onClose} />);

    fireEvent.click(screen.getByLabelText('Видалити'));
    fireEvent.click(screen.getByRole('button', { name: 'Видалити' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Не вдалося видалити файл. Спробуйте пізніше.');
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should request rename and download, and open delete modal', async () => {
    const onRequestAction = jest.fn();

    render(<FileInfoSidebar file={baseFile} onClose={jest.fn()} onRequestAction={onRequestAction} />);

    fireEvent.click(screen.getByLabelText('Перейменувати'));
    expect(onRequestAction).toHaveBeenCalledWith({ type: 'rename', fileId: 'f1' });

    fireEvent.click(screen.getByLabelText('Завантажити'));
    expect(onRequestAction).toHaveBeenCalledWith({ type: 'download', fileId: 'f1' });
    await waitFor(() => {
      expect(downloadFile).toHaveBeenCalledWith('https://example.com/cat.png', 'cat.png');
    });

    fireEvent.click(screen.getByLabelText('Видалити'));
    expect(screen.getByText('Видалення неможливе')).toBeInTheDocument();

    expect(onRequestAction).toHaveBeenCalledTimes(2);
  });

  it('should render preview image when previewUrl exists', () => {
    render(<FileInfoSidebar file={baseFile} onClose={jest.fn()} />);

    const img = screen.getByRole('img', { name: 'cat.png' }) as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain('/cat.png');

    expect(document.querySelector('.previewOverlay')).toBeTruthy();
  });

  it('should render usage text when usage link has no href', () => {
    const fileWithPlainUsage: FileDetailsSidebarFile = {
      ...baseFile,
      usageLinks: [{ id: 'u1', label: 'Plain usage' }]
    };

    render(<FileInfoSidebar file={fileWithPlainUsage} onClose={jest.fn()} />);

    expect(screen.getByText('Plain usage')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Plain usage' })).not.toBeInTheDocument();
  });

  it('should open image preview modal when preview is clicked', () => {
    render(<FileInfoSidebar file={baseFile} onClose={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'cat.png' }));

    expect(screen.getByTestId('ImagePreviewModal')).toHaveAttribute('data-src', '/cat.png');
    expect(screen.getByTestId('ImagePreviewModal')).toHaveAttribute('data-alt', 'cat.png');
  });

  it('should open image preview modal from keyboard and overlay click', () => {
    render(<FileInfoSidebar file={baseFile} onClose={jest.fn()} />);

    fireEvent.keyDown(screen.getByRole('button', { name: 'cat.png' }), { key: 'Enter' });

    expect(screen.getByTestId('ImagePreviewModal')).toHaveAttribute('data-src', '/cat.png');

    fireEvent.click(screen.getByLabelText('Open image preview'));

    expect(screen.getByTestId('ImagePreviewModal')).toHaveAttribute('data-alt', 'cat.png');
  });

  it('should open image preview modal from Space key', () => {
    render(<FileInfoSidebar file={baseFile} onClose={jest.fn()} />);

    fireEvent.keyDown(screen.getByRole('button', { name: 'cat.png' }), { key: ' ' });

    expect(screen.getByTestId('ImagePreviewModal')).toHaveAttribute('data-src', '/cat.png');
  });

  it('should not open image preview modal from keyboard for non-image previews', () => {
    const pdfFile: FileDetailsSidebarFile = { ...baseFile, type: 'pdf', previewUrl: '/doc-preview.png' };

    render(<FileInfoSidebar file={pdfFile} onClose={jest.fn()} />);

    fireEvent.keyDown(screen.getByRole('img', { name: 'cat.png' }).parentElement as HTMLElement, { key: 'Enter' });

    expect(screen.queryByTestId('ImagePreviewModal')).not.toBeInTheDocument();
  });

  it('should show "Немає попереднього перегляду" when previewUrl missing', () => {
    const noPreview: FileDetailsSidebarFile = { ...baseFile, type: 'image', previewUrl: undefined };

    render(<FileInfoSidebar file={noPreview} onClose={jest.fn()} />);

    expect(screen.getByText('Немає попереднього перегляду')).toBeInTheDocument();
  });

  it('should call hook setDraft on description change and commit on blur', () => {
    render(<FileInfoSidebar file={baseFile} onClose={jest.fn()} onDescriptionSave={jest.fn()} />);

    const desc = screen.getByTestId('desc') as HTMLTextAreaElement;

    fireEvent.change(desc, { target: { value: 'new desc' } });
    expect(setDraftMock).toHaveBeenCalled();

    fireEvent.blur(desc);
    expect(commitMock).toHaveBeenCalledWith('initial desc');
  });
});
