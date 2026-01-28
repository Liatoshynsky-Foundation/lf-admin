import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { type FileDetailsSidebarFile, FileInfoSidebar } from './FileInfoSidebar';

jest.mock('../design-system/tooltip/Tooltip', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

jest.mock('~/shared/components/design-system/text-field/TextField', () => ({
  __esModule: true,
  CustomTextField: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea data-testid="desc" {...props} />
  )
}));

jest.mock('~/lib/utils/formatUsageCount', () => ({
  __esModule: true,
  formatUsageCount: String
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

describe('FileInfoSidebar', () => {
  beforeEach(() => {
    commitMock.mockClear();
    setDraftMock.mockClear();
  });

  const baseFile: FileDetailsSidebarFile = {
    id: 'f1',
    type: 'image',
    filename: 'cat.png',
    previewUrl: '/cat.png',
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
      <FileInfoSidebar
        file={baseFile}
        onClose={jest.fn()}
        onToggleStar={jest.fn()}
        onDescriptionSave={jest.fn()}
        onRequestAction={jest.fn()}
      />
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

  it('should disable actions when file is missing id', () => {
    const fileNoId = { ...baseFile, id: '' };

    render(
      <FileInfoSidebar
        file={fileNoId as FileDetailsSidebarFile}
        onClose={jest.fn()}
        onToggleStar={jest.fn()}
        onRequestAction={jest.fn()}
      />
    );

    expect(screen.getByLabelText('Додати в обрані')).toBeDisabled();
    expect(screen.getByLabelText('Перейменувати')).toBeDisabled();
    expect(screen.getByLabelText('Видалити')).toBeDisabled();
    expect(screen.getByLabelText('Завантажити')).toBeDisabled();
  });

  it('should request rename/delete/download with correct payload', () => {
    const onRequestAction = jest.fn();

    render(<FileInfoSidebar file={baseFile} onClose={jest.fn()} onRequestAction={onRequestAction} />);

    fireEvent.click(screen.getByLabelText('Перейменувати'));
    expect(onRequestAction).toHaveBeenCalledWith({ type: 'rename', fileId: 'f1' });

    fireEvent.click(screen.getByLabelText('Видалити'));
    expect(onRequestAction).toHaveBeenCalledWith({ type: 'delete', fileId: 'f1' });

    fireEvent.click(screen.getByLabelText('Завантажити'));
    expect(onRequestAction).toHaveBeenCalledWith({ type: 'download', fileId: 'f1' });

    expect(onRequestAction).toHaveBeenCalledTimes(3);
  });

  it('should toggle star with correct next state', () => {
    const onToggleStar = jest.fn();

    render(<FileInfoSidebar file={baseFile} onClose={jest.fn()} onToggleStar={onToggleStar} />);

    fireEvent.click(screen.getByLabelText('Додати в обрані'));
    expect(onToggleStar).toHaveBeenCalledWith('f1', true);
  });

  it('should render preview image when previewUrl exists', () => {
    render(<FileInfoSidebar file={baseFile} onClose={jest.fn()} />);

    const img = screen.getByRole('img', { name: 'cat.png' }) as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain('/cat.png');

    expect(document.querySelector('.previewOverlay')).toBeTruthy();
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
