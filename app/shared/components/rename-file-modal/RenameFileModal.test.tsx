import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import toast from 'react-hot-toast';

import { RenameFileModal } from './RenameFileModal';
import { useUpdateAssetMutation } from '~/types/graphql/generated/graphql';

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

jest.mock('~/types/graphql/generated/graphql', () => ({
  useUpdateAssetMutation: jest.fn()
}));

describe('RenameFileModal', () => {
  const mockOnClose = jest.fn();
  const mockUpdateAsset = jest.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    fileId: 'file-123',
    currentFilename: 'old_name.jpg'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useUpdateAssetMutation as jest.Mock).mockReturnValue([mockUpdateAsset, { loading: false }]);
  });

  it('renders modal with correct initial values separated', () => {
    render(<RenameFileModal {...defaultProps} />);

    expect(screen.getByText('Перейменувати файл')).toBeInTheDocument();
    expect(screen.getByDisplayValue('old_name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /зберегти/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /скасувати/i })).toBeInTheDocument();
  });

  it('calls onClose when "Скасувати" is clicked', async () => {
    const user = userEvent.setup();
    render(<RenameFileModal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /скасувати/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockUpdateAsset).not.toHaveBeenCalled();
  });

  it('closes modal without calling API if filename is unchanged', async () => {
    const user = userEvent.setup();
    render(<RenameFileModal {...defaultProps} />);

    const saveButton = screen.getByRole('button', { name: /зберегти/i });
    await user.click(saveButton);

    expect(mockUpdateAsset).not.toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('closes modal without calling API if filename is empty (only spaces)', async () => {
    const user = userEvent.setup();
    render(<RenameFileModal {...defaultProps} />);

    const input = screen.getByDisplayValue('old_name');
    await user.clear(input);
    await user.type(input, '   ');

    const saveButton = screen.getByRole('button', { name: /зберегти/i });
    await user.click(saveButton);

    expect(mockUpdateAsset).not.toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls API and shows success toast on valid submit (appends extension automatically)', async () => {
    const user = userEvent.setup();
    mockUpdateAsset.mockResolvedValueOnce({ data: {} });

    render(<RenameFileModal {...defaultProps} />);

    const input = screen.getByDisplayValue('old_name');
    await user.clear(input);
    await user.type(input, 'new_name');

    const saveButton = screen.getByRole('button', { name: /зберегти/i });
    await user.click(saveButton);

    expect(mockUpdateAsset).toHaveBeenCalledWith({
      variables: {
        id: 'file-123',
        input: { filename: 'new_name.jpg' }
      }
    });

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(toast.success).toHaveBeenCalledWith('Файл успішно перейменовано');
    });
  });

  it('shows error toast on API failure', async () => {
    const user = userEvent.setup();
    mockUpdateAsset.mockRejectedValueOnce(new Error('API Error'));

    render(<RenameFileModal {...defaultProps} />);

    const input = screen.getByDisplayValue('old_name');
    await user.clear(input);
    await user.type(input, 'new_name');

    const saveButton = screen.getByRole('button', { name: /зберегти/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Помилка при перейменуванні файлу');
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it('disables input and buttons while loading', () => {
    (useUpdateAssetMutation as jest.Mock).mockReturnValue([mockUpdateAsset, { loading: true }]);
    render(<RenameFileModal {...defaultProps} />);

    const input = screen.getByDisplayValue('old_name');
    const saveButton = screen.getByRole('button', { name: /зберегти/i });
    const cancelButton = screen.getByRole('button', { name: /скасувати/i });

    expect(input).toBeDisabled();
    expect(saveButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });
});
