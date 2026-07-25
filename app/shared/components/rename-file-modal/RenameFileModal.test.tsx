import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import toast from 'react-hot-toast';

import { RenameFileModal } from './RenameFileModal';
import { useUpdateAssetMutation } from '~/types/graphql/generated/graphql';

jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');

  return {
    ...actual,
    Button: ({
      children,
      disabled,
      onClick
    }: {
      children: React.ReactNode;
      disabled?: boolean;
      onClick?: () => void;
    }) => (
      <button type="button" aria-disabled={disabled ? 'true' : 'false'} onClick={onClick}>
        {children}
      </button>
    )
  };
});

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

  it('disables save button if filename is unchanged', () => {
    render(<RenameFileModal {...defaultProps} />);

    const saveButton = screen.getByRole('button', { name: /зберегти/i });
    expect(saveButton).toHaveAttribute('aria-disabled', 'true');
  });

  it('disables save button if filename is empty (only spaces)', async () => {
    const user = userEvent.setup();
    render(<RenameFileModal {...defaultProps} />);

    const input = screen.getByDisplayValue('old_name');
    await user.clear(input);
    await user.type(input, '   ');

    const saveButton = screen.getByRole('button', { name: /зберегти/i });
    expect(saveButton).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows validation error and disables save button when filename contains forbidden characters', async () => {
    const user = userEvent.setup();
    render(<RenameFileModal {...defaultProps} />);

    const input = screen.getByDisplayValue('old_name');
    await user.clear(input);
    await user.type(input, 'bad/name');

    expect(screen.getByText('Введіть назву файлу без крапки та розширення')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /зберегти/i })).toHaveAttribute('aria-disabled', 'true');
    expect(mockUpdateAsset).not.toHaveBeenCalled();
  });

  it('guards against saving invalid filename even if save handler is triggered', async () => {
    const user = userEvent.setup();
    render(<RenameFileModal {...defaultProps} />);

    const input = screen.getByDisplayValue('old_name');
    await user.clear(input);
    await user.type(input, 'bad/name');

    await user.click(screen.getByRole('button', { name: /зберегти/i }));

    expect(toast.error).toHaveBeenCalledWith('Введіть назву файлу без крапки та розширення');
    expect(mockUpdateAsset).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('closes without saving when save handler is triggered for unchanged filename', async () => {
    const user = userEvent.setup();
    render(<RenameFileModal {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /зберегти/i }));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockUpdateAsset).not.toHaveBeenCalled();
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

  it('rejects typing a different file extension during rename', async () => {
    const user = userEvent.setup();

    render(<RenameFileModal {...defaultProps} currentFilename="old_name.jpeg" />);

    const input = screen.getByDisplayValue('old_name');
    await user.clear(input);
    await user.type(input, 'new_name.png');

    const saveButton = screen.getByRole('button', { name: /зберегти/i });
    await user.click(saveButton);

    expect(toast.error).toHaveBeenCalledWith('Введіть назву файлу без крапки та розширення');
    expect(mockUpdateAsset).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('rejects unknown typed extensions instead of appending the current extension', async () => {
    const user = userEvent.setup();

    render(<RenameFileModal {...defaultProps} currentFilename="old_name.jpeg" />);

    const input = screen.getByDisplayValue('old_name');
    await user.clear(input);
    await user.type(input, 'new_name.ppdf');

    const saveButton = screen.getByRole('button', { name: /зберегти/i });
    await user.click(saveButton);

    expect(toast.error).toHaveBeenCalledWith('Введіть назву файлу без крапки та розширення');
    expect(mockUpdateAsset).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('calls onRename when custom rename handler is provided', async () => {
    const user = userEvent.setup();
    const onRename = jest.fn().mockResolvedValue(undefined);

    render(<RenameFileModal {...defaultProps} onRename={onRename} />);

    const input = screen.getByDisplayValue('old_name');
    await user.clear(input);
    await user.type(input, 'custom_name');

    const saveButton = screen.getByRole('button', { name: /зберегти/i });
    await user.click(saveButton);

    expect(onRename).toHaveBeenCalledWith('file-123', 'custom_name.jpg');
    expect(mockUpdateAsset).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(toast.success).toHaveBeenCalledWith('Файл успішно перейменовано');
    });
  });

  it('shows error toast when custom rename handler fails', async () => {
    const user = userEvent.setup();
    const onRename = jest.fn().mockRejectedValue(new Error('Файл custom_name.jpg вже існує'));

    render(<RenameFileModal {...defaultProps} onRename={onRename} />);

    const input = screen.getByDisplayValue('old_name');
    await user.clear(input);
    await user.type(input, 'custom_name');

    const saveButton = screen.getByRole('button', { name: /зберегти/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(onRename).toHaveBeenCalledWith('file-123', 'custom_name.jpg');
      expect(toast.error).toHaveBeenCalledWith('Файл custom_name.jpg вже існує');
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it('renames files without extension', async () => {
    const user = userEvent.setup();
    mockUpdateAsset.mockResolvedValueOnce({ data: {} });

    render(<RenameFileModal {...defaultProps} currentFilename="README" />);

    const input = screen.getByDisplayValue('README');
    await user.clear(input);
    await user.type(input, 'CHANGELOG');

    const saveButton = screen.getByRole('button', { name: /зберегти/i });
    await user.click(saveButton);

    expect(mockUpdateAsset).toHaveBeenCalledWith({
      variables: {
        id: 'file-123',
        input: { filename: 'CHANGELOG' }
      }
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
      expect(toast.error).toHaveBeenCalledWith('API Error');
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
    expect(saveButton).toHaveAttribute('aria-disabled', 'true');
    expect(cancelButton).toHaveAttribute('aria-disabled', 'true');
  });
});
