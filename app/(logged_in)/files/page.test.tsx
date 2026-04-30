import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import Page from './page';

const mockRefetch = jest.fn();
const mockUseAllAssets = jest.fn();
const mockUploadBlob = jest.fn();

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
  useUploadBlobMutation: () => [mockUploadBlob],
  useUpdateAssetMutation: () => [jest.fn(), { loading: false }]
}));

jest.mock('~/shared/components/file-info-sidebar/FileInfoSidebar', () => ({
  FileInfoSidebar: ({ file }: { file: { filename: string } }) => (
    <div data-testid="file-info-sidebar">{file.filename}</div>
  )
}));

jest.mock('~/shared/components/files-cards-layout', () => ({
  FilesCardsLayout: ({
    items,
    onItemClick
  }: {
    items: Array<{ id: string; name: string }>;
    onItemClick: (item: { id: string; name: string }) => void;
  }) => (
    <div data-testid="files-cards-layout">
      <span data-testid="items-count">{items.length}</span>
      {items.map((item) => (
        <button key={item.id} data-testid={`item-${item.id}`} onClick={() => onItemClick(item)}>
          {item.name}
        </button>
      ))}
    </div>
  )
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

describe('Files page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it('renders page title and upload button', () => {
    render(<Page />);

    expect(screen.getByText('Файли')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Завантажити файл/i })).toBeInTheDocument();
  });

  it('renders main files controls', () => {
    render(<Page />);

    expect(screen.getByTestId('control-panel')).toBeInTheDocument();
    expect(screen.getByTestId('files-cards-layout')).toBeInTheDocument();
    expect(screen.getByTestId('search')).toBeInTheDocument();
    expect(screen.getByTestId('view-toggle')).toBeInTheDocument();
  });

  it('filters files by search input', () => {
    render(<Page />);

    expect(screen.getByTestId('items-count')).toHaveTextContent('2');

    fireEvent.change(screen.getByTestId('search'), { target: { value: 'piano' } });

    expect(screen.getByTestId('items-count')).toHaveTextContent('1');
    expect(screen.getByTestId('item-asset-image')).toBeInTheDocument();
  });

  it('updates list when format filter is applied', () => {
    render(<Page />);

    fireEvent.click(screen.getByRole('button', { name: /Фільтри/i }));
    fireEvent.click(screen.getByTestId('filter-select-Формат'));

    expect(screen.getByTestId('items-count')).toHaveTextContent('1');
  });

  it('selects file and renders file info sidebar', () => {
    render(<Page />);

    fireEvent.click(screen.getByTestId('item-asset-image'));

    expect(screen.getByTestId('file-info-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('file-info-sidebar')).toHaveTextContent('piano-studio.jpg');
  });

  it('opens sort menu and updates sort key in localStorage', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    render(<Page />);

    fireEvent.click(screen.getByRole('button', { name: /Фільтри/i }));
    fireEvent.click(screen.getByTestId('sort-select'));

    expect(setItemSpy).toHaveBeenCalledWith('files_sort', 'name_asc');
  });

  it('opens media modal when upload button is clicked', () => {
    render(<Page />);

    fireEvent.click(screen.getByRole('button', { name: /Завантажити файл/i }));

    expect(screen.getByTestId('media-modal')).toBeInTheDocument();
  });
});
