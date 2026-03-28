import { fireEvent, render, screen, within } from '@testing-library/react';
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
    Audio: 'Audio'
  },
  useUploadBlobMutation: () => [mockUploadBlob]
}));

jest.mock('~/shared/components/control-panel', () => ({
  ControlPanel: ({
    leftContent,
    rightContent,
    bottomContent,
    isBottomOpen
  }: {
    leftContent: React.ReactNode;
    rightContent: React.ReactNode;
    bottomContent?: React.ReactNode;
    isBottomOpen?: boolean;
  }) => (
    <div data-testid="control-panel">
      <div data-testid="left-content">{leftContent}</div>
      <div data-testid="right-content">{rightContent}</div>
      {isBottomOpen ? <div data-testid="bottom-content">{bottomContent}</div> : null}
    </div>
  )
}));

jest.mock('~/shared/components/dropdown-menu/DropdownMenu', () => ({
  __esModule: true,
  default: ({ open, menuList }: { open: boolean; menuList: React.ReactNode }) =>
    open ? <div data-testid="dropdown-menu">{menuList}</div> : null
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

jest.mock('~/shared/components/search/Search', () => ({
  Search: ({ search, setSearch }: { search: string; setSearch: (value: string) => void }) => (
    <input data-testid="search" value={search} onChange={(event) => setSearch(event.target.value)} />
  )
}));

jest.mock('~/shared/components/selector/FilterSelect', () => ({
  FilterSelect: ({
    label,
    options,
    onAdd
  }: {
    label: string;
    options: Array<{ value: string; label: string }>;
    onAdd: (value: string, label: string, allSelected: string[]) => void;
  }) => (
    <button
      data-testid={`filter-select-${label}`}
      onClick={() => onAdd(options[0].value, options[0].label, [options[0].value])}
    >
      {label}
    </button>
  )
}));

jest.mock('~/shared/components/selector/FilterSelectItem/FilterSelectItem', () => ({
  __esModule: true,
  default: ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button data-testid={`sort-option-${label}`} onClick={onClick}>
      {label}
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
        type: 'Pdf',
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
    fireEvent.click(screen.getByRole('button', { name: /Нові спочатку/i }));

    const dropdown = screen.getByTestId('dropdown-menu');
    fireEvent.click(within(dropdown).getByTestId('sort-option-Назва файлу'));
    fireEvent.click(within(dropdown).getByTestId('sort-option-А-Я'));

    expect(setItemSpy).toHaveBeenCalledWith('files_sort', 'name_asc');
  });

  it('opens media modal when upload button is clicked', () => {
    render(<Page />);

    fireEvent.click(screen.getByRole('button', { name: /Завантажити файл/i }));

    expect(screen.getByTestId('media-modal')).toBeInTheDocument();
  });
});
