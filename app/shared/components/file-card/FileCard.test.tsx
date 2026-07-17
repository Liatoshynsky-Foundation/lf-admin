import { Box, Button } from '@mui/material';
import { fireEvent, render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';

import FileCard, { FileCardData, FileType } from './FileCard';

const mockUpdateAsset = jest.fn();
let mockIsUpdatingStar = false;

jest.mock('~/types/graphql/generated/graphql', () => ({
  ...jest.requireActual('~/types/graphql/generated/graphql'),
  useUpdateAssetMutation: () => [mockUpdateAsset, { loading: mockIsUpdatingStar }]
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: jest.fn()
  }
}));

jest.mock('./FileCardMenuItems', () => {
  interface MenuItemsProps {
    isStarred: boolean;
    isStarLoading: boolean;
    onOpenDetails: () => void;
    onRename: () => void;
    onToggleStar: () => void;
    onDownload: () => void;
    onDelete: () => void;
  }

  const MockMenuItems = (props: MenuItemsProps) => (
    <Box data-testid="menu-items">
      <Button
        data-testid="menu-btn-details"
        onClick={(e) => {
          e.stopPropagation();
          props.onOpenDetails();
        }}
      >
        Details
      </Button>
      <Button
        data-testid="menu-btn-rename"
        onClick={(e) => {
          e.stopPropagation();
          props.onRename();
        }}
      >
        Rename
      </Button>
      <Button
        data-testid="menu-btn-star"
        onClick={(e) => {
          e.stopPropagation();
          props.onToggleStar();
        }}
      >
        Toggle Star
      </Button>
      <Button
        data-testid="menu-btn-download"
        onClick={(e) => {
          e.stopPropagation();
          props.onDownload();
        }}
      >
        Download
      </Button>
      <Button
        data-testid="menu-btn-delete"
        onClick={(e) => {
          e.stopPropagation();
          props.onDelete();
        }}
      >
        Delete
      </Button>
    </Box>
  );
  MockMenuItems.displayName = 'MockMenuItems';
  return MockMenuItems;
});

jest.mock('../card-layout/CardLayout', () => {
  interface CardLayoutProps {
    coverImage: React.ReactNode;
    title: React.ReactNode;
    info: React.ReactNode;
    items: React.ReactNode;
    spaceBetweenContent: number;
  }

  const MockCardLayout = ({ coverImage, title, info, items, spaceBetweenContent }: CardLayoutProps) => (
    <Box data-testid="card-layout" data-space-between={spaceBetweenContent}>
      <Box data-testid="cover-image">{coverImage}</Box>
      <Box data-testid="title">{title}</Box>
      <Box data-testid="info">{info}</Box>
      <Box data-testid="items">{items}</Box>
    </Box>
  );
  MockCardLayout.displayName = 'MockCardLayout';
  return MockCardLayout;
});

const mockToastError = jest.fn();
jest.mock('react-hot-toast', () => ({
  error: (message: string) => mockToastError(message)
}));

globalThis.ResizeObserver = jest.fn().mockImplementation((callback: () => void) => ({
  observe: jest.fn(() => callback()),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

describe('FileCard', () => {
  const mockOnClick = jest.fn();
  const mockOnAction = jest.fn();

  const defaultFileData: FileCardData = {
    id: 'test-file-123',
    name: 'Test Image.jpg',
    dateAdded: '2026-01-10',
    isStarred: false,
    imageSrc: '/test-image.jpg'
  };

  beforeEach(() => {
    mockUpdateAsset.mockReturnValue(Promise.resolve({ data: {} }));
  });

  afterEach(() => {
    mockIsUpdatingStar = false;
    jest.clearAllMocks();
  });

  it('should fallback to default value for isStarred when it is undefined in fileData', () => {
    const fileDataWithoutStarred = { ...defaultFileData };
    delete fileDataWithoutStarred.isStarred;

    render(<FileCard fileType="image" fileData={fileDataWithoutStarred as FileCardData} />);

    expect(screen.queryByAltText('Starred file')).not.toBeInTheDocument();
  });

  it('should apply correct cursor styles depending on isUpdatingStar loading state', () => {
    const starredFileData = { ...defaultFileData, isStarred: true };
    const { rerender } = render(<FileCard fileType="image" fileData={starredFileData} />);
    const starWrapperBefore = screen.getByAltText('Starred file').closest('div');
    expect(starWrapperBefore).toHaveStyle('cursor: pointer');

    mockIsUpdatingStar = true;
    rerender(<FileCard fileType="image" fileData={starredFileData} />);
    const starWrapperAfter = screen.getByAltText('Starred file').closest('div');
    expect(starWrapperAfter).toHaveStyle('cursor: wait');
  });

  it('should render the component with all required props', () => {
    render(<FileCard fileType="image" fileData={defaultFileData} onClick={mockOnClick} />);

    expect(screen.getByText('Test Image.jpg')).toBeInTheDocument();
    expect(screen.getByText('2026-01-10')).toBeInTheDocument();
  });

  it('should display the image when fileType is image and imageSrc is provided', () => {
    render(<FileCard fileType="image" fileData={defaultFileData} />);

    const image = screen.getByAltText('Test Image.jpg');
    expect(image).toBeInTheDocument();
  });

  it('should display placeholder when no imageSrc is provided', () => {
    const fileDataWithoutImage = { ...defaultFileData, imageSrc: undefined };
    render(<FileCard fileType="pdf" fileData={fileDataWithoutImage} />);

    const placeholder = screen.getByAltText('pdf placeholder');
    expect(placeholder).toBeInTheDocument();
  });

  it('should fallback to image placeholder if file type is unknown', () => {
    const unknownData = { ...defaultFileData, imageSrc: undefined };
    render(<FileCard fileType={'unknown' as FileType} fileData={unknownData} />);

    expect(screen.getByAltText('unknown placeholder')).toBeInTheDocument();
  });

  it('should display star icon when isStarred is true', () => {
    const starredFileData = { ...defaultFileData, isStarred: true };
    render(<FileCard fileType="image" fileData={starredFileData} />);

    expect(screen.getByAltText('Starred file')).toBeInTheDocument();
  });

  it('should not display star icon when isStarred is false', () => {
    render(<FileCard fileType="image" fileData={defaultFileData} />);

    expect(screen.queryByAltText('Starred file')).not.toBeInTheDocument();
  });

  it('should treat missing isStarred as false', () => {
    const { isStarred: _isStarred, ...fileDataWithoutStarFlag } = defaultFileData;

    render(<FileCard fileType="image" fileData={fileDataWithoutStarFlag} />);

    expect(screen.queryByAltText('Starred file')).not.toBeInTheDocument();
  });

  it('should call updateAsset when star icon is clicked and stop propagation', async () => {
    const starredFileData = { ...defaultFileData, isStarred: true };
    render(<FileCard fileType="image" fileData={starredFileData} onClick={mockOnClick} />);

    const starIcon = screen.getByAltText('Starred file');
    fireEvent.click(starIcon);

    expect(mockUpdateAsset).toHaveBeenCalledWith({
      variables: {
        id: 'test-file-123',
        input: { isStarred: false }
      }
    });
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('should show error toast if updateAsset fails', async () => {
    mockUpdateAsset.mockRejectedValueOnce(new Error('GraphQL Error'));
    const starredFileData = { ...defaultFileData, isStarred: true };
    render(<FileCard fileType="image" fileData={starredFileData} />);
    const starIcon = screen.getByAltText('Starred file');
    fireEvent.click(starIcon);
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('GraphQL Error');
    });
  });

  it('should display usage link icon when usageLinks is greater than 0', () => {
    const linkedFileData = { ...defaultFileData, usageLinks: 3 };
    render(<FileCard fileType="image" fileData={linkedFileData} />);

    expect(screen.getByAltText('Linked file')).toBeInTheDocument();
  });

  it('should not display usage link icon when usageLinks is 0', () => {
    const fileDataWithZeroLinks = { ...defaultFileData, usageLinks: 0 };
    render(<FileCard fileType="image" fileData={fileDataWithZeroLinks} />);

    expect(screen.queryByAltText('Linked file')).not.toBeInTheDocument();
  });

  it('should not display usage link icon when usageLinks is undefined', () => {
    render(<FileCard fileType="image" fileData={defaultFileData} />);

    expect(screen.queryByAltText('Linked file')).not.toBeInTheDocument();
  });

  it('should handle tooltip open/close states on mouse events', async () => {
    const linkedFileData = { ...defaultFileData, usageLinks: 1 };
    render(<FileCard fileType="image" fileData={linkedFileData} />);

    const linkIcon = screen.getByAltText('Linked file').closest('div');

    if (!linkIcon) {
      throw new Error('Link icon container not found');
    }

    fireEvent.mouseEnter(linkIcon);
    expect(screen.getByText(/Використовується на сайті:/)).toBeInTheDocument();

    fireEvent.mouseLeave(linkIcon);
    await waitForElementToBeRemoved(() => screen.queryByText(/Використовується на сайті:/));
  });

  it('should call onClick when root component is clicked', () => {
    render(<FileCard fileType="image" fileData={defaultFileData} onClick={mockOnClick} />);

    const cardLayout = screen.getByTestId('card-layout');
    fireEvent.click(cardLayout);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should render correct file type icon for different file types', () => {
    const fileTypes: FileType[] = ['image', 'audio', 'pdf', 'document', 'spreadsheet', 'video', 'archive'];

    fileTypes.forEach((type) => {
      const { unmount } = render(<FileCard fileType={type} fileData={defaultFileData} />);
      expect(screen.getByAltText(`${type} icon`)).toBeInTheDocument();
      unmount();
    });
  });

  it('should fallback to image icon for unknown file type', () => {
    render(<FileCard fileType={'unknown' as FileType} fileData={defaultFileData} />);

    expect(screen.getByAltText('unknown icon')).toHaveAttribute('src', '/icons/img.svg');
  });

  it('should trigger menu item callbacks correctly', async () => {
    render(<FileCard fileType="image" fileData={defaultFileData} onClick={mockOnClick} onAction={mockOnAction} />);

    fireEvent.click(screen.getByTestId('menu-btn-details'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
    mockOnClick.mockClear();

    fireEvent.click(screen.getByTestId('menu-btn-rename'));
    expect(mockOnAction).toHaveBeenCalledWith('rename', 'test-file-123');

    fireEvent.click(screen.getByTestId('menu-btn-download'));
    expect(mockOnAction).toHaveBeenCalledWith('download', 'test-file-123');

    fireEvent.click(screen.getByTestId('menu-btn-delete'));
    expect(mockOnAction).toHaveBeenCalledWith('delete', 'test-file-123');

    fireEvent.click(screen.getByTestId('menu-btn-star'));
    expect(mockUpdateAsset).toHaveBeenCalled();
  });

  it('should display correct tooltip text for multiple usage links', () => {
    const linkedFileData = { ...defaultFileData, usageLinks: 5 };
    render(<FileCard fileType="image" fileData={linkedFileData} />);

    const linkIcon = screen.getByAltText('Linked file').closest('div');
    if (linkIcon) {
      fireEvent.mouseEnter(linkIcon);
      expect(screen.getByText('Використовується на сайті: 5 звʼязок')).toBeInTheDocument();
      fireEvent.mouseLeave(linkIcon);
    }
  });

  it('should not throw if onAction or onClick are not provided for menu items', () => {
    render(<FileCard fileType="image" fileData={defaultFileData} />);

    expect(() => fireEvent.click(screen.getByTestId('menu-btn-details'))).not.toThrow();
    expect(() => fireEvent.click(screen.getByTestId('menu-btn-rename'))).not.toThrow();
    expect(() => fireEvent.click(screen.getByTestId('menu-btn-download'))).not.toThrow();
    expect(() => fireEvent.click(screen.getByTestId('menu-btn-delete'))).not.toThrow();
  });

  it('should adjust spaceBetweenContent based on isFileInfoSidebarOpen', () => {
    const { rerender } = render(<FileCard fileType="image" fileData={defaultFileData} isFileInfoSidebarOpen={true} />);
    expect(screen.getByTestId('card-layout')).toHaveAttribute('data-space-between', '500');

    rerender(<FileCard fileType="image" fileData={defaultFileData} isFileInfoSidebarOpen={false} />);
    expect(screen.getByTestId('card-layout')).toHaveAttribute('data-space-between', '200');
  });

  it('should call menu actions with file id', () => {
    const onAction = jest.fn();
    render(<FileCard fileType="image" fileData={defaultFileData} onAction={onAction} onClick={mockOnClick} />);

    fireEvent.click(screen.getByTestId('menu-btn-details'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('menu-btn-rename'));
    expect(onAction).toHaveBeenCalledWith('rename', 'test-file-123');

    fireEvent.click(screen.getByTestId('menu-btn-download'));
    expect(onAction).toHaveBeenCalledWith('download', 'test-file-123');

    fireEvent.click(screen.getByTestId('menu-btn-delete'));
    expect(onAction).toHaveBeenCalledWith('delete', 'test-file-123');
  });

  it('should call onToggleStar from menu', async () => {
    const onToggleStar = jest.fn().mockResolvedValue(undefined);
    render(<FileCard fileType="image" fileData={defaultFileData} onToggleStar={onToggleStar} />);

    fireEvent.click(screen.getByTestId('menu-btn-star'));

    await waitFor(() => {
      expect(onToggleStar).toHaveBeenCalledWith('test-file-123', true);
    });
  });

  it('should update asset favorite state when onToggleStar is not provided', async () => {
    render(<FileCard fileType="image" fileData={defaultFileData} />);

    fireEvent.click(screen.getByTestId('menu-btn-star'));

    await waitFor(() => {
      expect(mockUpdateAsset).toHaveBeenCalledWith({
        variables: {
          id: 'test-file-123',
          input: { isStarred: true }
        }
      });
    });
  });

  it('should show error toast when favorite update fails', async () => {
    mockUpdateAsset.mockRejectedValueOnce(new Error('Favorite failed'));
    render(<FileCard fileType="image" fileData={defaultFileData} />);

    fireEvent.click(screen.getByTestId('menu-btn-star'));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Favorite failed');
    });
  });

  it('should show fallback error toast when favorite update fails without Error instance', async () => {
    mockUpdateAsset.mockRejectedValueOnce('Favorite failed');
    render(<FileCard fileType="image" fileData={defaultFileData} />);

    fireEvent.click(screen.getByTestId('menu-btn-star'));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Не вдалося оновити статус обраного файлу. Спробуйте пізніше.');
    });
  });

  it('should toggle starred file from visible star icon', async () => {
    const onToggleStar = jest.fn().mockResolvedValue(undefined);
    const starredFileData = { ...defaultFileData, isStarred: true };

    render(<FileCard fileType="image" fileData={starredFileData} onClick={mockOnClick} onToggleStar={onToggleStar} />);

    fireEvent.click(screen.getByAltText('Starred file'));

    await waitFor(() => {
      expect(onToggleStar).toHaveBeenCalledWith('test-file-123', false);
    });
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('should render waiting cursor while favorite state is updating', () => {
    mockIsUpdatingStar = true;
    const starredFileData = { ...defaultFileData, isStarred: true };

    render(<FileCard fileType="image" fileData={starredFileData} />);

    expect(screen.getByAltText('Starred file').closest('div')).toHaveStyle({ cursor: 'wait' });
  });
});
