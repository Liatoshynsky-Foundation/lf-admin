import { useCallback, useRef, useState } from 'react';

import { FilePickerModalProps } from './types';

interface UseFilePickerUploadProps {
  customFilePickerModal?: (props: FilePickerModalProps) => React.ReactElement;
}

interface UseFilePickerUploadReturn {
  uploadHandler: ((file: File) => Promise<string>) | null;
  modalProps: FilePickerModalProps | null;
}

export const useFilePickerUpload = ({ customFilePickerModal }: UseFilePickerUploadProps): UseFilePickerUploadReturn => {
  const [isFilePickerOpen, setIsFilePickerOpen] = useState(false);
  const pendingUploadRef = useRef<{
    resolve: (url: string) => void;
    reject: (error: Error) => void;
    //eslint-disable-next-line
  } | null>(null);

  const openDeviceFilePicker = useCallback(async (): Promise<File | null> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,video/*';
      input.style.display = 'none';

      const handleChange = () => {
        const file = input.files?.[0] || null;
        resolve(file);
        cleanup();
      };

      const handleCancel = () => {
        resolve(null);
        cleanup();
      };

      const cleanup = () => {
        input.removeEventListener('change', handleChange);
        input.removeEventListener('cancel', handleCancel);
        input.remove();
      };

      input.addEventListener('change', handleChange);
      input.addEventListener('cancel', handleCancel);

      document.body.appendChild(input);
      input.click();
    });
  }, []);

  const handleFileSelected = useCallback((fileUrl: string) => {
    if (!pendingUploadRef.current) {
      console.warn('handleFileSelected called but no pending upload');
      return;
    }

    if (fileUrl?.trim()) {
      pendingUploadRef.current.resolve(fileUrl);
    } else {
      pendingUploadRef.current.reject(new Error('No file URL provided'));
    }

    pendingUploadRef.current = null;
    setIsFilePickerOpen(false);
  }, []);

  const handleCancel = useCallback(() => {
    if (!pendingUploadRef.current) {
      console.warn('handleCancel called but no pending upload');
      return;
    }

    pendingUploadRef.current.reject(new Error('File selection cancelled'));
    pendingUploadRef.current = null;
    setIsFilePickerOpen(false);
  }, []);

  //eslint-disable-next-line
  const uploadHandler = useCallback(async (file: File): Promise<string> => {
    if (pendingUploadRef.current) {
      throw new Error('File picker is already open');
    }

    return new Promise<string>((resolve, reject) => {
      pendingUploadRef.current = { resolve, reject };
      setIsFilePickerOpen(true);
    });
  }, []);

  if (!customFilePickerModal) {
    return {
      uploadHandler: null,
      modalProps: null
    };
  }

  const modalProps: FilePickerModalProps = {
    isOpen: isFilePickerOpen,
    onFileSelected: handleFileSelected,
    onCancel: handleCancel,
    onDeviceFilePick: openDeviceFilePicker
  };

  return {
    uploadHandler,
    modalProps: isFilePickerOpen ? modalProps : null
  };
};
