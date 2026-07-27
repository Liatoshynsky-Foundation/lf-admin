import { fireEvent, render, screen } from '@testing-library/react';

import DeleteFileModal from './DeleteFileModal';

describe('DeleteFileModal', () => {
  const mockFileUnused = {
    id: '1',
    filename: 'Liatoshynsky_photo.jpg',
    usageRefs: []
  };

  const mockFileUsed = {
    id: '2',
    filename: 'Important_document.pdf',
    usageRefs: [
      { pageId: 'about-us', blockId: 'hero' },
      { pageId: 'events', blockId: 'block-1' }
    ]
  };

  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    file: mockFileUnused
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when file is null', () => {
    render(<DeleteFileModal {...defaultProps} file={null} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  describe('when file is NOT in use (Confirmation State)', () => {
    it('should render confirmation content', () => {
      render(<DeleteFileModal {...defaultProps} file={mockFileUnused} />);

      expect(screen.getByText('Підтвердити видалення')).toBeInTheDocument();
      expect(screen.getByText(/Ви збираєтесь видалити файл/i)).toBeInTheDocument();
      expect(screen.getByText('Liatoshynsky_photo.jpg')).toBeInTheDocument();

      expect(screen.getByText('Видалити')).toBeInTheDocument();
      expect(screen.getByText('Скасувати')).toBeInTheDocument();
    });

    it('should call onConfirm with file id when delete button is clicked', () => {
      render(<DeleteFileModal {...defaultProps} file={mockFileUnused} />);
      fireEvent.click(screen.getByText('Видалити'));
      expect(defaultProps.onConfirm).toHaveBeenCalledWith('1');
    });

    it('should call onClose when cancel button is clicked', () => {
      render(<DeleteFileModal {...defaultProps} file={mockFileUnused} />);
      fireEvent.click(screen.getByText('Скасувати'));
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('when file IS in use (Blocked State)', () => {
    it('should render blocking content and list', () => {
      render(<DeleteFileModal {...defaultProps} file={mockFileUsed} />);

      expect(screen.getByText('Видалення неможливе')).toBeInTheDocument();
      expect(screen.getByText(/використовується на сайті і привʼязаний у 2 місцях/i)).toBeInTheDocument();
      expect(screen.getByText('Important_document.pdf')).toBeInTheDocument();

      expect(screen.getByText('about-us/hero')).toBeInTheDocument();
      expect(screen.getByText('events/block-1')).toBeInTheDocument();

      expect(screen.getByText('Гаразд')).toBeInTheDocument();
      expect(screen.queryByText('Видалити')).not.toBeInTheDocument();
    });

    it('should call onClose when OK button is clicked', () => {
      render(<DeleteFileModal {...defaultProps} file={mockFileUsed} />);
      fireEvent.click(screen.getByText('Гаразд'));
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('should call onClose when close icon is clicked', () => {
    render(<DeleteFileModal {...defaultProps} />);
    const closeIcon = document.querySelector('svg');
    fireEvent.click(closeIcon!);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should not render when file is undefined', () => {
    const { open, onClose, onConfirm } = defaultProps;
    render(<DeleteFileModal open={open} onClose={onClose} onConfirm={onConfirm} file={undefined as unknown as null} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should display fallback text and keys when pageId or blockId are missing', () => {
    const fileWithPartialRefs = {
      id: '3',
      filename: 'Partial.jpg',
      usageRefs: [{ pageId: 'only-page' }, { blockId: 'only-block' }, {}]
    };

    render(<DeleteFileModal {...defaultProps} file={fileWithPartialRefs} />);

    expect(screen.getByText('only-page')).toBeInTheDocument();
    expect(screen.getByText('only-block')).toBeInTheDocument();
    expect(screen.getByText('Невідомий блок')).toBeInTheDocument();
  });

  it('should use singular word variant when file is used in exactly one place', () => {
    const fileUsedOnce = {
      id: '5',
      filename: 'Single_use.png',
      usageRefs: [{ pageId: 'home', blockId: 'banner' }]
    };

    render(<DeleteFileModal {...defaultProps} file={fileUsedOnce} />);
    expect(screen.getByText(/використовується на сайті і привʼязаний у 1 місці/i)).toBeInTheDocument();
  });

  it('should handle undefined file and missing usageRefs field', () => {
    const { open, onClose, onConfirm } = defaultProps;

    render(<DeleteFileModal open={open} onClose={onClose} onConfirm={onConfirm} file={undefined as unknown as null} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const fileWithoutUsageRefs = {
      id: '6',
      filename: 'No_refs_field.png'
    };

    render(<DeleteFileModal {...defaultProps} file={fileWithoutUsageRefs} />);
    expect(screen.getByText('No_refs_field.png')).toBeInTheDocument();
  });
});
