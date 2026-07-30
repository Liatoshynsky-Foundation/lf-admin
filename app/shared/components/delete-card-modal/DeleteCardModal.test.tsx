import { fireEvent, render, screen } from '@testing-library/react';

import DeleteCardModal from './DeleteCardModal';

describe('DeleteCardModal', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render modal content when open', () => {
    render(<DeleteCardModal {...defaultProps} />);

    expect(screen.getByText('Підтвердити видалення')).toBeInTheDocument();
    expect(screen.getByText('Ви впевнені, що хочете видалити цю картку?')).toBeInTheDocument();

    expect(screen.getByText('Видалити')).toBeInTheDocument();
    expect(screen.getByText('Скасувати')).toBeInTheDocument();
  });

  it('should not render content when closed', () => {
    render(<DeleteCardModal {...defaultProps} open={false} />);

    expect(screen.queryByText('Підтвердити видалення')).not.toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked', () => {
    render(<DeleteCardModal {...defaultProps} />);

    fireEvent.click(screen.getByText('Видалити'));

    expect(defaultProps.onDelete).toHaveBeenCalled();
  });

  it('should call onClose when cancel button is clicked', () => {
    render(<DeleteCardModal {...defaultProps} />);

    fireEvent.click(screen.getByText('Скасувати'));

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should call onClose when close icon is clicked', () => {
    render(<DeleteCardModal {...defaultProps} />);

    const closeIcon = document.querySelector('svg');
    fireEvent.click(closeIcon!);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  describe('handleDialogClose logic', () => {
    it('should not call onClose when backdrop is clicked (backdropClick)', () => {
      render(<DeleteCardModal {...defaultProps} />);

      const backdrop = document.querySelector('.MuiBackdrop-root');

      if (backdrop) {
        fireEvent.click(backdrop);
      }

      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('should call onClose when escapeKeyDown reason occurs', () => {
      render(<DeleteCardModal {...defaultProps} />);

      fireEvent.keyDown(document.activeElement || document.body, {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
        charCode: 27
      });

      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });
});
