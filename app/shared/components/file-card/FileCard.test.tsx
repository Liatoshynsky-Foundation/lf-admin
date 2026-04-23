import { fireEvent, render, screen } from '@testing-library/react';

import FileCard, { FileCardData, FileType } from './FileCard';

jest.mock('~/types/graphql/generated/graphql', () => ({
  ...jest.requireActual('~/types/graphql/generated/graphql'),
  useUpdateAssetMutation: () => [jest.fn(), { loading: false }]
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

    const menuButton = screen.getByLabelText('Open file menu');
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
    }
  });

  it('should not call onClick when onClick is not provided', () => {
    render(<FileCard fileType="image" fileData={defaultFileData} />);

    const menuButton = screen.getByLabelText('Open file menu');
    expect(() => fireEvent.click(menuButton)).not.toThrow();
  });
});
