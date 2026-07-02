import { act,renderHook } from '@testing-library/react';
import React from 'react';

import { useFilePickerUpload } from './useFilePickerUpload';

describe('useFilePickerUpload', () => {
  const mockCustomModal = () => React.createElement('div');

  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns null values when customFilePickerModal is not provided', () => {
    const { result } = renderHook(() => useFilePickerUpload({}));

    expect(result.current.openCustomPicker).toBeNull();
    expect(result.current.modalProps).toBeNull();
  });

  it('initializes correctly with modalProps as null when picker is closed', () => {
    const { result } = renderHook(() => useFilePickerUpload({ customFilePickerModal: mockCustomModal }));

    expect(result.current.openCustomPicker).toBeInstanceOf(Function);
    expect(result.current.modalProps).toBeNull();
  });

  it('opens custom picker, sets modalProps and resolves on file selection', async () => {
    const { result } = renderHook(() => useFilePickerUpload({ customFilePickerModal: mockCustomModal }));
    const mockFile = new File([''], 'test.png', { type: 'image/png' });

    let promiseResult: File | null = null;

    act(() => {
      const openPicker = result.current.openCustomPicker;
      if (openPicker) {
        openPicker().then((file) => {
          promiseResult = file;
        });
      }
    });

    expect(result.current.modalProps).not.toBeNull();
    expect(result.current.modalProps?.isOpen).toBe(true);

    act(() => {
      result.current.modalProps?.onFileSelected(mockFile);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(promiseResult).toBe(mockFile);
    expect(result.current.modalProps).toBeNull();
  });

  it('returns null if openCustomPicker is called while another selection is pending', async () => {
    const { result } = renderHook(() => useFilePickerUpload({ customFilePickerModal: mockCustomModal }));

    let firstPromise: Promise<File | null> | null = null;
    let secondPromiseResult: File | null = 'not-null' as unknown as File;

    act(() => {
      const openPicker = result.current.openCustomPicker;
      if (openPicker) {
        firstPromise = openPicker();
        openPicker().then((res) => {
          secondPromiseResult = res;
        });
      }
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(secondPromiseResult).toBeNull();

    act(() => {
      result.current.modalProps?.onCancel();
    });

    if (firstPromise) {
      await firstPromise;
    }
  });

  it('handles custom picker cancellation correctly', async () => {
    const { result } = renderHook(() => useFilePickerUpload({ customFilePickerModal: mockCustomModal }));

    let promiseResult: File | null = 'initial' as unknown as File;

    act(() => {
      const openPicker = result.current.openCustomPicker;
      if (openPicker) {
        openPicker().then((file) => {
          promiseResult = file;
        });
      }
    });

    act(() => {
      result.current.modalProps?.onCancel();
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(promiseResult).toBeNull();
  });

  it('safely bypasses handleFileSelected and handleCancel if no pending selection ref exists', () => {
    const { result } = renderHook(() => useFilePickerUpload({ customFilePickerModal: mockCustomModal }));

    act(() => {
      const openPicker = result.current.openCustomPicker;
      if (openPicker) {
        openPicker();
      }
    });

    const activeModalProps = result.current.modalProps;
    expect(activeModalProps).not.toBeNull();

    act(() => {
      activeModalProps?.onCancel();
    });

    act(() => {
      activeModalProps?.onFileSelected(null);
      activeModalProps?.onCancel();
    });

    expect(result.current.modalProps).toBeNull();
  });

  it('triggers device native file picker and handles file change event', async () => {
    const { result } = renderHook(() => useFilePickerUpload({ customFilePickerModal: mockCustomModal }));
    const mockFile = new File([''], 'device.jpg', { type: 'image/jpeg' });

    let pickerPromise: Promise<File | null> | null = null;
    act(() => {
      const openPicker = result.current.openCustomPicker;
      if (openPicker) {
        pickerPromise = openPicker();
      }
    });

    let devicePickPromise: Promise<void> | null = null;
    act(() => {
      const pickDevice = result.current.modalProps?.onDeviceFilePick;
      if (pickDevice) {
        devicePickPromise = pickDevice();
      }
    });

    act(() => {
      jest.advanceTimersByTime(0);
    });

    const input = document.body.querySelector('input[data-custom-file-picker="true"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('file');

    const fileList = {
      0: mockFile,
      length: 1,
      item: (index: number) => (index === 0 ? mockFile : null)
    };

    Object.defineProperty(input, 'files', {
      value: fileList,
      writable: true
    });

    act(() => {
      input.dispatchEvent(new Event('change'));
    });

    await act(async () => {
      if (devicePickPromise) await devicePickPromise;
      if (pickerPromise) await pickerPromise;
    });

    expect(input).not.toBeInTheDocument();
  });

  it('triggers device native file picker and handles cancel event', async () => {
    const { result } = renderHook(() => useFilePickerUpload({ customFilePickerModal: mockCustomModal }));

    act(() => {
      const openPicker = result.current.openCustomPicker;
      if (openPicker) {
        openPicker();
      }
    });

    let devicePickPromise: Promise<void> | null = null;
    act(() => {
      const pickDevice = result.current.modalProps?.onDeviceFilePick;
      if (pickDevice) {
        devicePickPromise = pickDevice();
      }
    });

    act(() => {
      jest.advanceTimersByTime(0);
    });

    const input = document.body.querySelector('input[data-custom-file-picker="true"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    act(() => {
      input.dispatchEvent(new Event('cancel'));
    });

    await act(async () => {
      if (devicePickPromise) await devicePickPromise;
    });

    expect(input).not.toBeInTheDocument();
  });

  it('handles device native file picker change event when no files are selected', async () => {
    const { result } = renderHook(() => useFilePickerUpload({ customFilePickerModal: mockCustomModal }));

    let pickerPromise: Promise<File | null> | null = null;
    act(() => {
      const openPicker = result.current.openCustomPicker;
      if (openPicker) {
        pickerPromise = openPicker();
      }
    });

    let devicePickPromise: Promise<void> | null = null;
    act(() => {
      const pickDevice = result.current.modalProps?.onDeviceFilePick;
      if (pickDevice) {
        devicePickPromise = pickDevice();
      }
    });

    act(() => {
      jest.advanceTimersByTime(0);
    });

    const input = document.body.querySelector('input[data-custom-file-picker="true"]') as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: null,
      writable: true
    });

    act(() => {
      input.dispatchEvent(new Event('change'));
    });

    await act(async () => {
      if (devicePickPromise) await devicePickPromise;
      if (pickerPromise) await pickerPromise;
    });

    expect(input).not.toBeInTheDocument();
  });
});
