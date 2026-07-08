import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import Page from './page';

const mockRefetch = jest.fn();
const mockUseAllAssets = jest.fn();
const mockFetch = jest.fn();
const mockCreateAsset = jest.fn();
const mockUpdateAsset = jest.fn();
const mockDeleteAsset = jest.fn();

let mockAllAssets: Array<Record<string, unknown>> = [];

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt ?? ''} />
}));

jest.mock('~/shared/hooks/use-assets/useAssets', () => ({
  useAllAssets: () => mockUseAllAssets()
}));

jest.mock('~/types/graphql/generated/graphql', () => ({
  AssetType: {
    Image: 'Image',
    Pdf: 'Pdf',
    Audio: 'Audio',
    Archive: 'Archive',
    Video: 'Video',
    Document: 'Document',
    Spreadsheet: 'Spreadsheet'
  },
  useUpdateAssetMutation: () => [mockUpdateAsset, { loading: false }],
  useCreateAssetMutation: () => [mockCreateAsset, { loading: false }],
  useDeleteAssetMutation: () => [mockDeleteAsset, { loading: false }]
}));

jest.mock('~/shared/components/file-info-sidebar/FileInfoSidebar', () => ({
  FileInfoSidebar: ({
    file,
    onToggleStar,
    onDescriptionSave,
    onDeleteRequest
  }: {
    file: { id: string; filename: string; isStarred?: boolean };
    onToggleStar?: (fileId: string, next: boolean) => void;
    onDescriptionSave?: (fileId: string, description: string) => void;
    onDeleteRequest?: (fileId: string) => void;
  }) => (
    <div data-testid="file-info-sidebar">
      {file.filename}
      <button type="button" data-testid="sidebar-star" onClick={() => onToggleStar?.(file.id, !file.isStarred)}>
        star
      </button>
      <button type="button" data-testid="sidebar-description" onClick={() => onDescriptionSave?.(file.id, 'Updated')}>
        description
      </button>
      <button type="button" data-testid="sidebar-delete" onClick={() => onDeleteRequest?.(file.id)}>
        delete
      </button>
    </div>
  )
}));

jest.mock('~/shared/components/files-cards-layout', () => ({
  FilesCardsLayout: ({
    items,
    onItemClick,
    onItemAction,
    onItemToggleStar
  }: {
    items: Array<{ id: string; name: string; isStarred?: boolean }>;
    onItemClick: (item: { id: string; name: string }) => void;
    onItemAction?: (action: 'rename' | 'delete' | 'download', item: { id: string; name: string }) => void;
    onItemToggleStar?: (item: { id: string; name: string; isStarred?: boolean }, next: boolean) => void;
  }) => (
    <div data-testid="files-cards-layout">
      <span data-testid="items-count">{items.length}</span>
      {items.map((item) => (
        <div key={item.id}>
          <button data-testid={`item-${item.id}`} onClick={() => onItemClick(item)}>
            {item.name}
          </button>
          <button data-testid={`star-${item.id}`} onClick={() => onItemToggleStar?.(item, !item.isStarred)}>
            star
          </button>
          <button data-testid={`delete-${item.id}`} onClick={() => onItemAction?.('delete', item)}>
            delete
          </button>
        </div>
      ))}
    </div>
  )
}));

jest.mock('~/shared/components/delete-file-modal/DeleteFileModal', () => ({
  __esModule: true,
  default: ({
    open,
    file,
    onConfirm
  }: {
    open: boolean;
    file: { id: string; filename: string } | null;
    onConfirm: (fileId: string) => void;
  }) =>
    open && file ? (
      <div data-testid="delete-file-modal">
        <button type="button" data-testid="confirm-delete" onClick={() => onConfirm(file.id)}>
          confirm
        </button>
      </div>
    ) : null
}));

jest.mock('~/shared/components/media-modal/MediaModal', () => ({
  MediaModal: ({ open }: { open: boolean }) => (open ? <div data-testid="media-modal">open</div> : null)
}));

jest.mock('~/shared/components/media-modal/views/upload-view/UploadView', () => ({
  UploadView: () => null
}));

jest.mock('~/shared/components/filtering-toolbar', () => ({
  FilteringToolbar: ({
    search,
    filters = [],
    isFiltersOpen,
    onToggleFilters,
    rightSlot,
    bottomTrailingContent
  }: {
    search?: { search: string; setSearch: (value: string) => void };
    filters?: Array<{
      id: string;
      label: string;
      options: Array<{ value: string; label: string }>;
      onChange: (value: string[]) => void;
    }>;
    isFiltersOpen?: boolean;
    onToggleFilters?: () => void;
    rightSlot?: React.ReactNode;
    bottomTrailingContent?: React.ReactNode;
  }) => (
    <div data-testid="control-panel">
      {search ? (
        <input data-testid="search" value={search.search} onChange={(event) => search.setSearch(event.target.value)} />
      ) : null}
      {onToggleFilters ? (
        <button type="button" onClick={onToggleFilters}>
          Фільтри
        </button>
      ) : null}
      {rightSlot}
      {isFiltersOpen ? (
        <div data-testid="bottom-content">
          {filters.map((filter) => (
            <button
              key={filter.id}
              data-testid={`filter-select-${filter.label}`}
              onClick={() => filter.onChange([filter.options[0].value])}
            >
              {filter.label}
            </button>
          ))}
          {bottomTrailingContent}
        </div>
      ) : null}
    </div>
  ),
  SortSelect: ({
    triggerLabel,
    fieldOptions,
    fieldValue,
    orderOptions,
    onFieldChange,
    onValueChange
  }: {
    triggerLabel: string;
    fieldOptions: Array<{ value: string; label: string }>;
    fieldValue: string;
    orderOptions: Record<string, Array<{ value: string; label: string }>>;
    onFieldChange: (value: string) => void;
    onValueChange: (value: string) => void;
  }) => (
    <button
      type="button"
      data-testid="sort-select"
      onClick={() => {
        const nextField = fieldOptions.find((option) => option.value !== fieldValue) ?? fieldOptions[0];
        onFieldChange(nextField.value);
        onValueChange(orderOptions[nextField.value][0].value);
      }}
    >
      {triggerLabel}
    </button>
  )
}));

jest.mock('~/shared/components/view-toggle', () => ({
  ViewToggle: ({ onChange }: { onChange: (value: 'grid' | 'list') => void }) => (
    <button data-testid="view-toggle" onClick={() => onChange('list')}>
      toggle
    </button>
  )
}));

const renderPageAndWaitForFiles = async () => {
  render(<Page />);
  await waitFor(() => expect(screen.getByTestId('files-cards-layout')).toBeInTheDocument());
};

describe('Files page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = mockFetch;
    mockFetch.mockResolvedValue({ json: () => Promise.resolve({ success: true, data: [] }) });
    mockCreateAsset.mockResolvedValue({ data: { createAsset: { id: 'created-asset' } } });
    mockUpdateAsset.mockResolvedValue({ data: { updateAsset: { id: 'created-asset' } } });
    mockDeleteAsset.mockResolvedValue({ data: { deleteAsset: true } });
    mockAllAssets = [
      {
        id: 'asset-image',
        type: 'Image',
        filename: 'piano-studio.jpg',
        createdAt: '2026-03-19T10:00:00.000Z',
        isStarred: true,
        url: '/images/piano-studio.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 2048,
        createdBy: 'Admin',
        usageRefs: [{ pageId: 'about-us' }],
        description: 'Image file'
      },
      {
        id: 'asset-doc',
        type: 'Archive',
        filename: 'documents.zip',
        createdAt: '2026-03-18T10:00:00.000Z',
        isStarred: false,
        url: '/files/documents.zip',
        mimeType: 'application/x-zip-compressed',
        sizeBytes: 10240,
        createdBy: 'Admin',
        usageRefs: [],
        description: 'Docs file'
      }
    ];

    mockUseAllAssets.mockReturnValue({
      data: { allAssets: mockAllAssets },
      loading: false,
      error: null,
      refetch: mockRefetch
    });
  });

  it('renders page title and upload button', async () => {
    await renderPageAndWaitForFiles();

    expect(screen.getByText('Файли')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Завантажити файл/i })).toBeInTheDocument();
  });

  it('renders main files controls', async () => {
    await renderPageAndWaitForFiles();

    expect(screen.getByTestId('control-panel')).toBeInTheDocument();
    expect(screen.getByTestId('search')).toBeInTheDocument();
    expect(screen.getByTestId('view-toggle')).toBeInTheDocument();
  });

  it('filters files by search input', async () => {
    await renderPageAndWaitForFiles();

    expect(screen.getByTestId('items-count')).toHaveTextContent('2');

    fireEvent.change(screen.getByTestId('search'), { target: { value: 'piano' } });

    expect(screen.getByTestId('items-count')).toHaveTextContent('1');
    expect(screen.getByTestId('item-asset-image')).toBeInTheDocument();
  });

  it('updates list when format filter is applied', async () => {
    await renderPageAndWaitForFiles();

    fireEvent.click(screen.getByRole('button', { name: /Фільтри/i }));
    fireEvent.click(screen.getByTestId('filter-select-Формат'));

    expect(screen.getByTestId('items-count')).toHaveTextContent('1');
  });

  it('selects file and renders file info sidebar', async () => {
    await renderPageAndWaitForFiles();

    fireEvent.click(screen.getByTestId('item-asset-image'));

    expect(screen.getByTestId('file-info-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('file-info-sidebar')).toHaveTextContent('piano-studio.jpg');
  });

  it('opens sort menu and updates sort key in localStorage', async () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    await renderPageAndWaitForFiles();

    fireEvent.click(screen.getByRole('button', { name: /Фільтри/i }));
    fireEvent.click(screen.getByTestId('sort-select'));

    expect(setItemSpy).toHaveBeenCalledWith('files_sort', 'name_asc');
  });

  it('opens media modal when upload button is clicked', async () => {
    await renderPageAndWaitForFiles();

    fireEvent.click(screen.getByRole('button', { name: /Завантажити файл/i }));

    expect(screen.getByTestId('media-modal')).toBeInTheDocument();
  });

  it('creates a Mongo asset before starring an R2-only file', async () => {
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: true,
          data: [
            {
              filename: 'direct-upload.jpg',
              originalName: 'direct-upload.jpg',
              mimeType: 'image/jpeg',
              size: 1024,
              uploadedAt: '2026-07-08T10:00:00.000Z',
              url: 'https://r2.example.com/photos/direct-upload.jpg',
              path: 'photos/direct-upload.jpg'
            }
          ]
        })
    });

    render(<Page />);

    const orphanId = 'https://r2.example.com/photos/direct-upload.jpg';
    await waitFor(() => expect(screen.getByTestId(`star-${orphanId}`)).toBeInTheDocument());

    fireEvent.click(screen.getByTestId(`star-${orphanId}`));

    await waitFor(() => expect(mockCreateAsset).toHaveBeenCalledTimes(1));
    expect(mockCreateAsset).toHaveBeenCalledWith({
      variables: {
        input: {
          filename: 'direct-upload.jpg',
          originalname: 'direct-upload.jpg',
          url: orphanId,
          mimeType: 'image/jpeg',
          sizeBytes: 1024,
          type: 'Image'
        }
      }
    });
    await waitFor(() => expect(mockUpdateAsset).toHaveBeenCalledWith({
      variables: {
        id: 'created-asset',
        input: { isStarred: true }
      }
    }));
  });

  it('removes a deleted R2-only file from the visible list immediately', async () => {
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: true,
          data: [
            {
              filename: 'direct-upload.jpg',
              originalName: 'direct-upload.jpg',
              mimeType: 'image/jpeg',
              size: 1024,
              uploadedAt: '2026-07-08T10:00:00.000Z',
              url: 'https://r2.example.com/photos/direct-upload.jpg',
              path: 'photos/direct-upload.jpg'
            }
          ]
        })
    });

    render(<Page />);

    const orphanId = 'https://r2.example.com/photos/direct-upload.jpg';
    await waitFor(() => expect(screen.getByTestId(`delete-${orphanId}`)).toBeInTheDocument());
    expect(screen.getByTestId('items-count')).toHaveTextContent('3');

    fireEvent.click(screen.getByTestId(`delete-${orphanId}`));
    fireEvent.click(screen.getByTestId('confirm-delete'));

    await waitFor(() => expect(mockDeleteAsset).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByTestId('items-count')).toHaveTextContent('2'));
    expect(screen.queryByTestId(`item-${orphanId}`)).not.toBeInTheDocument();
  });
});
