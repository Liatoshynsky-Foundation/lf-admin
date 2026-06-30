import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import LogoutModal from './LogoutModal';
import { logoutAction } from '~/shared/actions/auth';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('~/shared/actions/auth', () => ({ logoutAction: jest.fn() }));

describe('LogoutModal', () => {
  const mockPush = jest.fn();
  const mockRefresh = jest.fn();
  const defaultProps = {
    open: true,
    onClose: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh
    });
  });

  it('should render confirmation content correctly', () => {
    render(<LogoutModal {...defaultProps} />);

    expect(screen.getByText('Вийти з акаунту')).toBeInTheDocument();
    expect(screen.getByText('Ви дійсно хочете вийти з акаунту адміністратора?')).toBeInTheDocument();
    expect(screen.getByText('Вийти')).toBeInTheDocument();
    expect(screen.getByText('Скасувати')).toBeInTheDocument();
  });

  it('should call onClose when cancel button is clicked', () => {
    render(<LogoutModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Скасувати'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should call onClose when close icon is clicked', () => {
    render(<LogoutModal {...defaultProps} />);
    const closeIcon = document.querySelector('svg');
    fireEvent.click(closeIcon!);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should handle logout flow correctly', async () => {
    (logoutAction as jest.Mock).mockResolvedValueOnce(undefined);

    render(<LogoutModal {...defaultProps} />);

    const logoutBtn = screen.getByText('Вийти');
    fireEvent.click(logoutBtn);

    expect(screen.getByText('Виходимо...')).toBeInTheDocument();

    await waitFor(() => {
      expect(logoutAction).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/login');
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle logout error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (logoutAction as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<LogoutModal {...defaultProps} />);

    fireEvent.click(screen.getByText('Вийти'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Помилка при виході', expect.any(Error));
      expect(screen.getByText('Вийти')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });
});
