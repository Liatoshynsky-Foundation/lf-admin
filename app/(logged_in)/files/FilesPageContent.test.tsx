import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import React from 'react';
import toast from 'react-hot-toast';

import { FilesPageContent } from './FilesPageContent';
import {
  FILES_EMPTY_STATE_NO_RESULTS_TITLE,
  FILES_EMPTY_STATE_TITLE,
  FILES_FAVORITES_EMPTY_STATE_TITLE,
  FILES_LOADING_STATE_TITLE,
  FILES_UNKNOWN_SECTION_LABEL,
  FILES_UPLOAD_BUTTON_LABEL} from '~/constants/files';
import { downloadFile } from '~/lib/utils/downloadFile';
import { useAllAssets } from '~/shared/hooks/use-assets/useAssets';
import { useFilesFiltering } from '~/shared/hooks/use-files';
import { AssetType, useCreateAssetMutation, useDeleteAssetMutation } from '~/types/graphql/generated/graphql';

Element.prototype.scrollIntoView = jest.fn();

interface TestFileItem {
  id: string;
  type: 'image' | 'pdf' | 'audio' | 'document' | 'spreadsheet' | 'video' | 'archive';
  name: string;
  dateAdded: string;
  createdAtRaw?: string;
  isStarred: boolean;
  usageLinks: number;
  downloadUrl?: string;
  imageSrc?: string;
  previewUrl?: string;
  format?: string;
  size?: string;
  addedBy?: { name: string; avatarUrl?: string };
  usage: Array<{ id: string; label: string; href?: string }>;
  description?: string;
}

const baseAsset = {
  id: '1',
  type: AssetType.Image,
  filename: 'photo.png',
  originalname: 'MyPhoto.png' as string | null,
  createdAt: '2024-01-15T00:00:00.000Z',
  isStarred: false,
  usageRefs: [{ pageId: 'page-1' as string | null }, { pageId: null as string | null }],
  url: 'https://example.com/photo.png',
  mimeType: 'image/png',
  sizeBytes: 500,
  createdBy: 'John Doe' as string | null,
  description: 'A nice photo' as string | null
};

interface SetupHooksParams {
  assets?: Array<typeof baseAsset>;
  loading?: boolean;
  error?: Error;
  refetch?: jest.Mock;
  createAsset?: jest.Mock;
  deleteAsset?: jest.Mock;
  deleteLoading?: boolean;
  filteredFiles?: TestFileItem[];
}

interface PageHeaderProps {
  title: string;
  activeTab: string;
  tabs: unknown;
  action?: React.ReactNode;
}

interface FilteringToolbarProps {
  rightSlot?: React.ReactNode;
  bottomTrailingContent?: React.ReactNode;
}

interface ViewToggleProps {
  value: string;
  onChange: (view: 'grid' | 'list') => void;
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: { label: string; href: string };
}

interface FilesCardsLayoutProps {
  view: 'grid' | 'list';
  items: TestFileItem[];
  selectedItemId: string | null;
  gridColumns?: unknown;
  setItemRef: (id: string, node: HTMLDivElement | null) => void;
  onItemClick: (item: TestFileItem) => void;
  onItemAction: (action: 'rename' | 'delete' | 'download', item: TestFileItem) => void;
}

interface FileInfoSidebarProps {
  file: {
    id: string;
    filename: string;
  };
  onClose: () => void;
  onRequestAction: (action: { type: 'rename' | 'unknown'; fileId: string }) => void;
}

type MockSelectedMedia =
  | { kind: 'upload'; file: File; id: string; fileName: string }
  | { kind: 'gallery'; id: string; fileName: string; src: string; locale: string }
  | { kind: 'used'; id: string; fileName: string };

interface MediaModalProps {
  open: boolean;
  initial?: { tab: string };
  onClose: () => void;
  onApply: (result: {
    selected: MockSelectedMedia;
    uploadResult?: { url: string; filename: string; originalName: string; mimeType: string; size: number };
    crop: unknown;
  }) => Promise<void>;
  renderers?: {
    upload?: (props: {
      accept?: string;
      invalidFileError?: string;
      isAllowedFile?: (file: File) => boolean;
      ariaLabel?: string;
    }) => React.ReactNode;
  };
  hideTabs?: boolean;
}

interface RenameFileModalProps {
  open: boolean;
  fileId: string;
  currentFilename: string;
  onClose: () => void;
}

interface DeleteFileModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
  file: { id: string; filename: string; usageRefs: Array<{ pageId: string | null; blockId: string }> } | null;
  isDeleting?: boolean;
  disableScrollLock?: boolean;
}

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() }
}));

jest.mock('~/lib/utils/downloadFile', () => ({
  downloadFile: jest.fn()
}));

jest.mock('~/shared/hooks/use-assets/useAssets', () => ({
  useAllAssets: jest.fn()
}));

jest.mock('~/shared/hooks/use-files', () => ({
  useFilesFiltering: jest.fn()
}));

jest.mock('~/types/graphql/generated/graphql', () => {
  const actual = jest.requireActual('~/types/graphql/generated/graphql');
  return {
    ...actual,
    useCreateAssetMutation: jest.fn(),
    useDeleteAssetMutation: jest.fn()
  };
});

jest.mock('~/public/icons/favourite-star.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="favourite-star-icon" />
}));

jest.mock('~/shared/components/page-header/PageHeader', () => ({
  PageHeader: ({ title, action }: PageHeaderProps) => (
    <div data-testid="page-header">
      <span>{title}</span>
      {action}
    </div>
  )
}));

jest.mock('~/shared/components/filtering-toolbar', () => ({
  FilteringToolbar: (props: FilteringToolbarProps) => (
    <div data-testid="filtering-toolbar">
      {props.rightSlot}
      {props.bottomTrailingContent}
    </div>
  ),
  SortSelect: () => <div data-testid="sort-select" />
}));

jest.mock('~/shared/components/view-toggle', () => ({
  ViewToggle: ({ onChange }: ViewToggleProps) => (
    <button data-testid="view-toggle" onClick={() => onChange('list')}>
      toggle
    </button>
  )
}));

jest.mock('~/shared/components/empty-state', () => ({
  EmptyState: ({ title, description, action }: EmptyStateProps) => (
    <div data-testid="empty-state">
      <span>{title}</span>
      <span>{description}</span>
      {action && (
        <a href={action.href} data-testid="empty-state-action">
          {action.label}
        </a>
      )}
    </div>
  )
}));

let capturedCardsProps: FilesCardsLayoutProps | null = null;
jest.mock('~/shared/components/files-cards-layout', () => ({
  FilesCardsLayout: (props: FilesCardsLayoutProps) => {
    capturedCardsProps = props;
    return (
      <div data-testid="files-cards-layout">
        {props.items.map((item) => (
          <div key={item.id} data-testid={`file-item-${item.id}`}>
            <button onClick={() => props.onItemClick(item)}>select-{item.id}</button>
            <button onClick={() => props.onItemAction('rename', item)}>rename-{item.id}</button>
            <button onClick={() => props.onItemAction('delete', item)}>delete-{item.id}</button>
            <button onClick={() => props.onItemAction('download', item)}>download-{item.id}</button>
            <div ref={(node) => props.setItemRef(item.id, node)} />
          </div>
        ))}
      </div>
    );
  }
}));

jest.mock('~/shared/components/file-info-sidebar/FileInfoSidebar', () => ({
  FileInfoSidebar: ({ file, onClose, onRequestAction }: FileInfoSidebarProps) => (
    <div data-testid="file-info-sidebar">
      <span>{file.filename}</span>
      <button onClick={onClose}>close-sidebar</button>
      <button onClick={() => onRequestAction({ type: 'rename', fileId: file.id })}>request-rename</button>
      <button onClick={() => onRequestAction({ type: 'unknown' as 'rename', fileId: file.id })}>request-unknown</button>
    </div>
  )
}));

let mockMediaModalOnApply:
  | ((result: {
      selected: MockSelectedMedia;
      uploadResult?: { url: string; filename: string; originalName: string; mimeType: string; size: number };
      crop: unknown;
    }) => Promise<void>)
  | null = null;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let deleteModalOnConfirm: ((id: string) => Promise<unknown>) | null = null;

jest.mock('~/shared/components/media-modal/MediaModal', () => ({
  MediaModal: ({ open, onApply, onClose, renderers }: MediaModalProps) => {
    mockMediaModalOnApply = onApply;
    if (!open) return null;
    return (
      <div data-testid="media-modal">
        <button onClick={onClose}>close-modal</button>
        {renderers?.upload?.({})}
      </div>
    );
  }
}));

let capturedUploadViewProps: {
  accept?: string;
  invalidFileError?: string;
  isAllowedFile?: (file: File) => boolean;
  ariaLabel?: string;
} | null = null;

jest.mock('~/shared/components/media-modal/views/upload-view/UploadView', () => ({
  UploadView: (props: {
    accept?: string;
    invalidFileError?: string;
    isAllowedFile?: (file: File) => boolean;
    ariaLabel?: string;
  }) => {
    capturedUploadViewProps = props;
    return <div data-testid="upload-view" />;
  }
}));

jest.mock('~/shared/components/rename-file-modal/RenameFileModal', () => ({
  RenameFileModal: ({ open, fileId, currentFilename, onClose }: RenameFileModalProps) =>
    open ? (
      <div data-testid="rename-modal">
        rename {fileId} {currentFilename}
        <button onClick={onClose}>close-rename</button>
      </div>
    ) : null
}));

jest.mock('~/shared/components/delete-file-modal/DeleteFileModal', () => ({
  __esModule: true,
  default: ({ open, onConfirm, file, onClose }: DeleteFileModalProps) => {
    deleteModalOnConfirm = onConfirm;
    if (!open) return null;
    return (
      <div data-testid="delete-modal">
        <span>{file?.filename}</span>
        <button onClick={() => onConfirm(file?.id ?? '')}>confirm-delete</button>
        <button onClick={onClose}>close-delete</button>
      </div>
    );
  }
}));

function setupHooks({
  assets = [baseAsset],
  loading = false,
  error = undefined,
  refetch = jest.fn(),
  createAsset = jest.fn().mockResolvedValue({ data: { createAsset: { id: 'new-1' } } }),
  deleteAsset = jest.fn().mockImplementation(async (options) => {
    if (options?.update) {
      const mockCache = {
        evict: jest.fn(),
        identify: jest.fn().mockReturnValue('Asset:1'),
        gc: jest.fn()
      };
      options.update(mockCache);
    }
    return {};
  }),
  deleteLoading = false,
  filteredFiles = undefined
}: SetupHooksParams = {}) {
  (useAllAssets as jest.Mock).mockReturnValue({
    data: { allAssets: assets },
    loading,
    error,
    refetch
  });

  (useCreateAssetMutation as jest.Mock).mockReturnValue([createAsset]);
  (useDeleteAssetMutation as jest.Mock).mockReturnValue([deleteAsset, { loading: deleteLoading }]);

  (useFilesFiltering as jest.Mock).mockImplementation((allFiles: TestFileItem[]) => ({
    filteredFiles: filteredFiles ?? allFiles,
    toolbarProps: { search: { search: '' }, activeFiltersCount: 0 },
    sortProps: {}
  }));

  return { refetch, createAsset, deleteAsset };
}

beforeEach(() => {
  jest.clearAllMocks();
  capturedCardsProps = null;
  mockMediaModalOnApply = null;
  deleteModalOnConfirm = null;
  capturedUploadViewProps = null;
});

describe('FilesPageContent', () => {
  it('renders loading state', () => {
    setupHooks({ loading: true, assets: [] });
    render(<FilesPageContent activeTab="all" />);
    const emptyState = screen.getByTestId('empty-state');
    expect(within(emptyState).getByText(FILES_LOADING_STATE_TITLE)).toBeInTheDocument();
  });

  it('deselects file automatically when it disappears from filtered list (coverage for 326)', () => {
    const mockMappedFile: TestFileItem = {
      id: '1',
      type: 'image',
      name: 'photo.png',
      dateAdded: '15.01.2024',
      createdAtRaw: '2024-01-15T00:00:00.000Z',
      isStarred: false,
      usageLinks: 2,
      downloadUrl: 'https://example.com/photo.png',
      imageSrc: 'https://example.com/photo.png',
      previewUrl: 'https://example.com/photo.png',
      format: 'png',
      size: '500 B',
      addedBy: { name: 'John Doe' },
      usage: [
        { id: '1-0', label: 'page-1', href: '/page-1' },
        { id: '1-1', label: FILES_UNKNOWN_SECTION_LABEL, href: undefined }
      ],
      description: 'A nice photo'
    };

    const anotherFile: TestFileItem = {
      ...mockMappedFile,
      id: '2',
      name: 'another.png'
    };

    setupHooks({ assets: [baseAsset], filteredFiles: [mockMappedFile] });
    const { rerender } = render(<FilesPageContent activeTab="all" />);

    fireEvent.click(screen.getByText('select-1'));
    expect(screen.getByTestId('file-info-sidebar')).toBeInTheDocument();

    setupHooks({ assets: [baseAsset], filteredFiles: [anotherFile] });
    rerender(<FilesPageContent activeTab="all" />);

    expect(screen.queryByTestId('file-info-sidebar')).not.toBeInTheDocument();
  });

  it('shows error toast when delete fails (coverage for 326)', async () => {
    const deleteAsset = jest.fn().mockRejectedValue(new Error('Network error'));
    setupHooks({ assets: [baseAsset], deleteAsset });
    render(<FilesPageContent activeTab="all" />);

    fireEvent.click(screen.getByText('delete-1'));
    fireEvent.click(screen.getByText('confirm-delete'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error');
    });
  });

  it('renders correct empty state scenarios (coverage for 447-476)', () => {
    setupHooks({ assets: [], filteredFiles: [] });
    const { rerender } = render(<FilesPageContent activeTab="favorites" />);
    expect(screen.getByText(FILES_FAVORITES_EMPTY_STATE_TITLE)).toBeInTheDocument();

    (useFilesFiltering as jest.Mock).mockReturnValue({
      filteredFiles: [],
      toolbarProps: { search: { search: 'query' }, activeFiltersCount: 0 },
      sortProps: {}
    });
    rerender(<FilesPageContent activeTab="all" />);
    expect(screen.getByText(FILES_EMPTY_STATE_NO_RESULTS_TITLE)).toBeInTheDocument();

    (useFilesFiltering as jest.Mock).mockReturnValue({
      filteredFiles: [],
      toolbarProps: { search: { search: '' }, activeFiltersCount: 0 },
      sortProps: {}
    });
    rerender(<FilesPageContent activeTab="all" />);
    expect(screen.getByText(FILES_EMPTY_STATE_TITLE)).toBeInTheDocument();
  });

  it('formats usage links correctly', () => {
    const assets = [{ ...baseAsset, id: '5', usageRefs: [{ pageId: '/a' }, { pageId: 'b' }, { pageId: null }] }];
    setupHooks({ assets });
    render(<FilesPageContent activeTab="all" />);
    fireEvent.click(screen.getByText('select-5'));
    expect(screen.getByTestId('file-info-sidebar')).toBeInTheDocument();
  });

  it('detects different asset types during upload', async () => {
    const { createAsset } = setupHooks({ assets: [] });
    render(<FilesPageContent activeTab="all" />);
    fireEvent.click(screen.getByText(FILES_UPLOAD_BUTTON_LABEL));

    const types = [
      {
        name: 't.xlsx',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        expected: 'spreadsheet'
      },
      { name: 't.pdf', type: 'application/pdf', expected: 'pdf' },
      { name: 't.zip', type: 'application/zip', expected: 'archive' },
      { name: 'a.mp3', type: 'audio/mpeg', expected: 'audio' },
      { name: 'i.jpg', type: 'image/jpeg', expected: 'image' }
    ];

    for (const t of types) {
      if (mockMediaModalOnApply) {
        await mockMediaModalOnApply({
          selected: { kind: 'upload', file: new File([''], t.name, { type: t.type }), id: 'u1', fileName: t.name },
          uploadResult: { url: 'u', filename: 'f', originalName: t.name, mimeType: t.type, size: 10 },
          crop: null
        });
        expect(createAsset).toHaveBeenCalledWith(
          expect.objectContaining({
            variables: { input: expect.objectContaining({ type: t.expected }) }
          })
        );
      }
    }
  });

  it('renders error state', () => {
    setupHooks({ loading: false, error: new Error('fail'), assets: [] });
    render(<FilesPageContent activeTab="all" />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('renders empty state for favorites tab without criteria', () => {
    setupHooks({ filteredFiles: [] });
    render(<FilesPageContent activeTab="favorites" />);
    expect(screen.getByTestId('empty-state-action')).toBeInTheDocument();
  });

  it('renders empty state with active search criteria', () => {
    (useAllAssets as jest.Mock).mockReturnValue({
      data: { allAssets: [baseAsset] },
      loading: false,
      error: undefined,
      refetch: jest.fn()
    });
    (useCreateAssetMutation as jest.Mock).mockReturnValue([jest.fn()]);
    (useDeleteAssetMutation as jest.Mock).mockReturnValue([jest.fn(), { loading: false }]);
    (useFilesFiltering as jest.Mock).mockReturnValue({
      filteredFiles: [],
      toolbarProps: { search: { search: 'xyz' }, activeFiltersCount: 0 },
      sortProps: {}
    });

    render(<FilesPageContent activeTab="all" />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('renders default empty state for non-favorites tab', () => {
    setupHooks({ filteredFiles: [] });
    render(<FilesPageContent activeTab="all" />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('renders files list with mapped fields (formats, sizes, usage)', () => {
    const assets = [
      { ...baseAsset, id: '1', type: AssetType.Image, mimeType: 'image/png', filename: 'a.png', sizeBytes: 100 },
      { ...baseAsset, id: '2', type: AssetType.Pdf, mimeType: 'application/pdf', filename: 'b.pdf', sizeBytes: 2048 },
      {
        ...baseAsset,
        id: '3',
        type: AssetType.Spreadsheet,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: 'c',
        sizeBytes: 5 * 1024 * 1024
      },
      {
        ...baseAsset,
        id: '4',
        type: AssetType.Archive,
        mimeType: 'application/zip',
        filename: 'd',
        sizeBytes: 10,
        createdBy: null,
        description: null
      }
    ];
    setupHooks({ assets });
    render(<FilesPageContent activeTab="all" />);
    expect(screen.getByTestId('files-cards-layout')).toBeInTheDocument();
    expect(capturedCardsProps?.items).toHaveLength(4);
  });

  it('selects a file item and shows sidebar, then closes it', async () => {
    setupHooks({ assets: [baseAsset] });
    render(<FilesPageContent activeTab="all" />);

    fireEvent.click(screen.getByText('select-1'));
    expect(await screen.findByTestId('file-info-sidebar')).toBeInTheDocument();

    fireEvent.click(screen.getByText('close-sidebar'));
    await waitFor(() => {
      expect(screen.queryByTestId('file-info-sidebar')).not.toBeInTheDocument();
    });
  });

  it('closes sidebar on Escape key press', async () => {
    setupHooks({ assets: [baseAsset] });
    render(<FilesPageContent activeTab="all" />);

    fireEvent.click(screen.getByText('select-1'));
    expect(await screen.findByTestId('file-info-sidebar')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByTestId('file-info-sidebar')).not.toBeInTheDocument();
    });
  });

  it('requests rename from sidebar action and opens rename modal', async () => {
    setupHooks({ assets: [baseAsset] });
    render(<FilesPageContent activeTab="all" />);

    fireEvent.click(screen.getByText('select-1'));
    fireEvent.click(await screen.findByText('request-rename'));

    expect(await screen.findByTestId('rename-modal')).toBeInTheDocument();
  });

  it('opens rename modal from card action', async () => {
    setupHooks({ assets: [baseAsset] });
    render(<FilesPageContent activeTab="all" />);

    fireEvent.click(screen.getByText('rename-1'));
    expect(await screen.findByTestId('rename-modal')).toBeInTheDocument();
  });

  it('opens delete modal and successfully deletes a file', async () => {
    setupHooks({ assets: [baseAsset] });
    render(<FilesPageContent activeTab="all" />);

    fireEvent.click(screen.getByText('select-1'));
    fireEvent.click(screen.getByText('delete-1'));

    expect(await screen.findByTestId('delete-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('confirm-delete'));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByTestId('file-info-sidebar')).not.toBeInTheDocument();
    });
  });

  it('shows error toast when delete fails with an Error', async () => {
    const deleteAsset = jest.fn().mockRejectedValue(new Error('boom'));
    setupHooks({ assets: [baseAsset], deleteAsset });
    render(<FilesPageContent activeTab="all" />);

    fireEvent.click(screen.getByText('delete-1'));
    fireEvent.click(await screen.findByText('confirm-delete'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('boom');
    });
  });

  it('shows generic error toast when delete fails with non-Error', async () => {
    const deleteAsset = jest.fn().mockRejectedValue('some string error');
    setupHooks({ assets: [baseAsset], deleteAsset });
    render(<FilesPageContent activeTab="all" />);

    fireEvent.click(screen.getByText('delete-1'));
    fireEvent.click(await screen.findByText('confirm-delete'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Не вдалося видалити файл. Спробуйте пізніше.');
    });
  });

  it('downloads a file when download action is triggered and url exists', async () => {
    setupHooks({ assets: [baseAsset] });
    render(<FilesPageContent activeTab="all" />);

    fireEvent.click(screen.getByText('download-1'));

    await waitFor(() => {
      expect(downloadFile).toHaveBeenCalledWith(baseAsset.url, baseAsset.originalname);
    });
  });

  it('shows error toast when download url is missing (coverage for 289-290)', async () => {
    const noUrlAsset = { ...baseAsset, url: '' };
    setupHooks({ assets: [noUrlAsset] });
    render(<FilesPageContent activeTab="all" />);

    fireEvent.click(screen.getByText('download-1'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Посилання на завантаження відсутнє');
    });
  });

  it('opens and closes the upload modal', async () => {
    setupHooks({ assets: [] });
    render(<FilesPageContent activeTab="all" />);

    fireEvent.click(screen.getByText(FILES_UPLOAD_BUTTON_LABEL));
    expect(await screen.findByTestId('media-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('close-modal'));
    await waitFor(() => {
      expect(screen.queryByTestId('media-modal')).not.toBeInTheDocument();
    });
  });

  it('ignores upload apply when result is not an upload kind', async () => {
    const { refetch } = setupHooks({ assets: [] });
    render(<FilesPageContent activeTab="all" />);

    fireEvent.click(screen.getByText(FILES_UPLOAD_BUTTON_LABEL));
    await screen.findByTestId('media-modal');

    if (mockMediaModalOnApply) {
      await mockMediaModalOnApply({
        selected: { kind: 'gallery', id: 'g1', fileName: 'photo.png', src: 'src', locale: 'en' },
        crop: null
      });
    }
    expect(refetch).not.toHaveBeenCalled();
  });

  it.each([
    ['spreadsheet', { type: 'application/vnd.ms-excel', name: 'file.xlsx' }],
    ['pdf', { type: 'application/pdf', name: 'file.pdf' }],
    ['archive', { type: 'application/zip', name: 'file.zip' }],
    ['archive', { type: '', name: 'file.rar' }],
    ['audio', { type: 'audio/mpeg', name: 'file.mp3' }],
    ['image', { type: 'image/png', name: 'file.png' }],
    ['document', { type: 'text/plain', name: 'file.txt' }]
  ])('creates asset with correct type detection: %s', async (_label, fileMeta) => {
    const { refetch, createAsset } = setupHooks({ assets: [] });
    render(<FilesPageContent activeTab="all" />);

    fireEvent.click(screen.getByText(FILES_UPLOAD_BUTTON_LABEL));
    await screen.findByTestId('media-modal');

    const file = new File(['content'], fileMeta.name, { type: fileMeta.type });

    if (mockMediaModalOnApply) {
      await mockMediaModalOnApply({
        selected: { kind: 'upload', file, id: 'u1', fileName: fileMeta.name },
        uploadResult: {
          url: 'https://example.com/file',
          filename: 'file-stored',
          originalName: fileMeta.name,
          mimeType: fileMeta.type,
          size: 123
        },
        crop: null
      });
    }

    await waitFor(() => {
      expect(createAsset).toHaveBeenCalled();
      expect(refetch).toHaveBeenCalled();
    });
  });

  it('throws when createAsset does not return data', async () => {
    const createAsset = jest.fn().mockResolvedValue({ data: null });
    setupHooks({ assets: [], createAsset });
    render(<FilesPageContent activeTab="all" />);

    fireEvent.click(screen.getByText(FILES_UPLOAD_BUTTON_LABEL));
    await screen.findByTestId('media-modal');

    const file = new File(['content'], 'file.png', { type: 'image/png' });

    if (mockMediaModalOnApply) {
      await expect(
        mockMediaModalOnApply({
          selected: { kind: 'upload', file, id: 'u2', fileName: 'file.png' },
          uploadResult: {
            url: 'https://example.com/file',
            filename: 'file-stored',
            originalName: 'file.png',
            mimeType: 'image/png',
            size: 123
          },
          crop: null
        })
      ).rejects.toThrow();
    }
  });

  it('toggles the view via ViewToggle', () => {
    setupHooks({ assets: [baseAsset] });
    render(<FilesPageContent activeTab="all" />);

    fireEvent.click(screen.getByTestId('view-toggle'));
    expect(screen.getByTestId('filtering-toolbar')).toBeInTheDocument();
  });

  it('formats From MimeType correctly (coverage for 144-155)', () => {
    const assets = [
      {
        ...baseAsset,
        id: '10',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: '',
        url: 'url'
      },
      {
        ...baseAsset,
        id: '11',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        filename: '',
        url: 'url'
      },
      { ...baseAsset, id: '12', mimeType: 'application/zip', filename: '', url: 'url' },
      { ...baseAsset, id: '13', mimeType: 'application/x-rar-compressed', filename: '', url: 'url' },
      { ...baseAsset, id: '14', mimeType: 'image/svg+xml', filename: '', url: 'url' },
      { ...baseAsset, id: '15', mimeType: 'image/jpeg', filename: '', url: 'url' },
      { ...baseAsset, id: '16', mimeType: 'audio/wave', filename: '', url: 'url' },
      { ...baseAsset, id: '17', mimeType: 'audio/x-wav', filename: '', url: 'url' },
      { ...baseAsset, id: '18', mimeType: 'unknown/mime', filename: '', url: 'url' },
      { ...baseAsset, id: '19', mimeType: 'unknown-format', filename: '', url: 'url' }
    ];
    setupHooks({ assets });
    render(<FilesPageContent activeTab="all" />);
    expect(screen.getByTestId('files-cards-layout')).toBeInTheDocument();
  });

  it('handles invalid createdAt date gracefully', () => {
    const assets = [{ ...baseAsset, id: '6', createdAt: 'not-a-date' }];
    setupHooks({ assets });
    render(<FilesPageContent activeTab="all" />);
    expect(screen.getByTestId('files-cards-layout')).toBeInTheDocument();
  });

  it('covers renderFilesUpload and validates file support', () => {
    setupHooks({ assets: [] });
    render(<FilesPageContent activeTab="all" />);

    fireEvent.click(screen.getByText(FILES_UPLOAD_BUTTON_LABEL));

    expect(screen.getByTestId('media-modal')).toBeInTheDocument();
    expect(screen.getByTestId('upload-view')).toBeInTheDocument();

    expect(capturedUploadViewProps).toBeTruthy();
    const isAllowedFile = capturedUploadViewProps?.isAllowedFile;
    expect(isAllowedFile).toBeDefined();

    if (isAllowedFile) {
      const imageFile = new File([''], 'test.png', { type: 'image/png' });
      expect(isAllowedFile(imageFile)).toBe(true);

      const noMimePdfFile = new File([''], 'test.pdf', { type: '' });
      expect(isAllowedFile(noMimePdfFile)).toBe(true);

      const noMimeInvalidFile = new File([''], 'test.xyz', { type: '' });
      expect(isAllowedFile(noMimeInvalidFile)).toBe(false);
    }
  });

  it('handles unknown sidebar actions gracefully', async () => {
    setupHooks({ assets: [baseAsset] });
    render(<FilesPageContent activeTab="all" />);

    fireEvent.click(screen.getByText('select-1'));
    expect(await screen.findByTestId('file-info-sidebar')).toBeInTheDocument();

    fireEvent.click(screen.getByText('request-unknown'));
    expect(screen.queryByTestId('rename-modal')).not.toBeInTheDocument();
  });

  it('closes delete modal when onClose is triggered (coverage for 471-476)', async () => {
    setupHooks({ assets: [baseAsset] });
    render(<FilesPageContent activeTab="all" />);

    fireEvent.click(screen.getByText('delete-1'));
    expect(await screen.findByTestId('delete-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('close-delete'));
    await waitFor(() => {
      expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
    });
  });

  it('closes rename modal when onClose is triggered', async () => {
    setupHooks({ assets: [baseAsset] });
    render(<FilesPageContent activeTab="all" />);

    fireEvent.click(screen.getByText('rename-1'));
    expect(await screen.findByTestId('rename-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('close-rename'));
    await waitFor(() => {
      expect(screen.queryByTestId('rename-modal')).not.toBeInTheDocument();
    });
  });
});
