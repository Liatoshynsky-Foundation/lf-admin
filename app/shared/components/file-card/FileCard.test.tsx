import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';

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

globalThis.ResizeObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(() => callback()),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

describe('FileCard', () => {
  const mockOnClick = jest.fn();

  const defaultFileData: FileCardData = {
    id: 'test-file-123',
    name: 'Test Image.jpg',
    dateAdded: '2026-01-10',
    isStarred: false,
    imageSrc: '/test-image.jpg'
  };

  afterEach(() => {
    mockIsUpdatingStar = false;
    jest.clearAllMocks();
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

  it('should call onClick when image section is clicked', () => {
    render(<FileCard fileType="image" fileData={defaultFileData} onClick={mockOnClick} />);

    const image = screen.getByAltText('Test Image.jpg');
    const imageSection = image.closest('div');
    if (imageSection) {
      fireEvent.click(imageSection);
    }

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should stop propagation when menu button is clicked', () => {
    render(<FileCard fileType="image" fileData={defaultFileData} onClick={mockOnClick} />);

    const menuButton = screen.getByTestId('menu-button');
    fireEvent.click(menuButton);

    expect(mockOnClick).not.toHaveBeenCalled();
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

  it('should display correct tooltip text for single usage link', () => {
    const linkedFileData = { ...defaultFileData, usageLinks: 1 };
    render(<FileCard fileType="image" fileData={linkedFileData} />);

    const linkIcon = screen.getByAltText('Linked file').closest('div');
    if (linkIcon) {
      fireEvent.mouseEnter(linkIcon);
      expect(screen.getByText('Використовується на сайті: 1 звʼязка')).toBeInTheDocument();
    }
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

  it('should not call onClick when onClick is not provided', () => {
    render(<FileCard fileType="image" fileData={defaultFileData} />);

    const menuButton = screen.getByTestId('menu-button');
    expect(() => fireEvent.click(menuButton)).not.toThrow();
  });

  it('should call menu actions with file id', () => {
    const onAction = jest.fn();

    render(<FileCard fileType="image" fileData={defaultFileData} onAction={onAction} onClick={mockOnClick} />);

    fireEvent.click(screen.getByTestId('menu-button'));
    fireEvent.click(screen.getByText('Відкрити деталі'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('menu-button'));
    fireEvent.click(screen.getByText('Перейменувати'));
    expect(onAction).toHaveBeenCalledWith('rename', 'test-file-123');

    fireEvent.click(screen.getByTestId('menu-button'));
    fireEvent.click(screen.getByText('Завантажити'));
    expect(onAction).toHaveBeenCalledWith('download', 'test-file-123');

    fireEvent.click(screen.getByTestId('menu-button'));
    fireEvent.click(screen.getByText('Видалити'));
    expect(onAction).toHaveBeenCalledWith('delete', 'test-file-123');
  });

  it('should call onToggleStar from menu', async () => {
    const onToggleStar = jest.fn().mockResolvedValue(undefined);

    render(<FileCard fileType="image" fileData={defaultFileData} onToggleStar={onToggleStar} />);

    fireEvent.click(screen.getByTestId('menu-button'));
    fireEvent.click(screen.getByText('Додати в обрані'));

    await waitFor(() => {
      expect(onToggleStar).toHaveBeenCalledWith('test-file-123', true);
    });
  });

  it('should update asset favorite state when onToggleStar is not provided', async () => {
    render(<FileCard fileType="image" fileData={defaultFileData} />);

    fireEvent.click(screen.getByTestId('menu-button'));
    fireEvent.click(screen.getByText('Додати в обрані'));

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

    fireEvent.click(screen.getByTestId('menu-button'));
    fireEvent.click(screen.getByText('Додати в обрані'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Favorite failed');
    });
  });

  it('should show fallback error toast when favorite update fails without Error instance', async () => {
    mockUpdateAsset.mockRejectedValueOnce('Favorite failed');

    render(<FileCard fileType="image" fileData={defaultFileData} />);

    fireEvent.click(screen.getByTestId('menu-button'));
    fireEvent.click(screen.getByText('Додати в обрані'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Не вдалося оновити статус обраного файлу. Спробуйте пізніше.');
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
