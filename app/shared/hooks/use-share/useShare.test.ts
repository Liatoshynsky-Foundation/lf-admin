import { act,renderHook } from '@testing-library/react';
import toast from 'react-hot-toast';

import { useShare } from './useShare';

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

describe('useShare', () => {
  const originalClipboard = navigator.clipboard;
  const mockWriteText = jest.fn<Promise<void>, [string]>();

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true
    });
  });

  afterAll(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true
    });
  });

  it('should successfully write text to clipboard and call success callbacks with default messages', async () => {
    mockWriteText.mockResolvedValueOnce(undefined);
    const onSuccessMock = jest.fn<void, []>();

    const { result } = renderHook(() =>
      useShare({ onSuccess: onSuccessMock })
    );

    await act(async () => {
      await result.current.handleShare('https://example.com');
    });

    expect(mockWriteText).toHaveBeenCalledWith('https://example.com');
    expect(toast.success).toHaveBeenCalledWith('Cкопійовано в буфер обміну.');
    expect(onSuccessMock).toHaveBeenCalledTimes(1);
  });

  it('should use custom success and error messages when provided', async () => {
    mockWriteText.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() =>
      useShare({
        message: {
          success: 'Custom success message',
          error: 'Custom error message'
        }
      })
    );

    await act(async () => {
      await result.current.handleShare('https://example.com');
    });

    expect(toast.success).toHaveBeenCalledWith('Custom success message');
  });

  it('should handle failure during writeText, call error callbacks and toast error message', async () => {
    const errorObj = new Error('Clipboard write rejected');
    mockWriteText.mockRejectedValueOnce(errorObj);
    const onErrorMock = jest.fn<void, [unknown]>();

    const { result } = renderHook(() =>
      useShare({ onError: onErrorMock })
    );

    await act(async () => {
      await result.current.handleShare('https://example.com');
    });

    expect(toast.error).toHaveBeenCalledWith('Не вдалося скопіювати. Спробуйте ще раз.');
    expect(onErrorMock).toHaveBeenCalledWith(errorObj);
  });

  it('should use custom error message when copy fails', async () => {
    const errorObj = new Error('Clipboard failed');
    mockWriteText.mockRejectedValueOnce(errorObj);

    const { result } = renderHook(() =>
      useShare({
        message: { error: 'Помилка копіювання' }
      })
    );

    await act(async () => {
      await result.current.handleShare('https://example.com');
    });

    expect(toast.error).toHaveBeenCalledWith('Помилка копіювання');
  });

  it('should execute without crashing when options are omitted', async () => {
    mockWriteText.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useShare());

    await act(async () => {
      await result.current.handleShare('https://example.com');
    });

    expect(toast.success).toHaveBeenCalledWith('Cкопійовано в буфер обміну.');
  });
});