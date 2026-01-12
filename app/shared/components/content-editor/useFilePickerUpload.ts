import { useCallback, useRef, useState } from 'react';

import { FilePickerModalProps } from './types';

interface UseFilePickerUploadProps {
  customFilePickerModal?: (props: FilePickerModalProps) => React.ReactElement;
}

interface UseFilePickerUploadReturn {
  openCustomPicker: (() => Promise<File | null>) | null;
  modalProps: FilePickerModalProps | null;
}

export const useFilePickerUpload = ({ customFilePickerModal }: UseFilePickerUploadProps): UseFilePickerUploadReturn => {
  const [isFilePickerOpen, setIsFilePickerOpen] = useState(false);
  const pendingSelectionRef = useRef<{
    resolve: (file: File | null) => void;
    reject: (error: Error) => void;
    //eslint-disable-next-line
  } | null>(null);

  //eslint-disable-next-line
  const handleFileSelected = useCallback((file: File | null, fileUrl?: string) => {
    if (!pendingSelectionRef.current) {
      return;
    }

    pendingSelectionRef.current.resolve(file);
    pendingSelectionRef.current = null;
    setIsFilePickerOpen(false);
  }, []);

  const openDeviceFilePicker = useCallback(async (): Promise<void> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,video/*';
      input.style.display = 'none';
      input.dataset.customFilePicker = 'true';

      const handleChange = () => {
        const file = input.files?.[0] || null;

        handleFileSelected(file);
        resolve();
        cleanup();
      };

      const handleCancel = () => {
        resolve();
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

      setTimeout(() => {
        input.click();
      }, 0);
    });
  }, [handleFileSelected]);

  const handleCancel = useCallback(() => {
    if (!pendingSelectionRef.current) {
      return;
    }

    pendingSelectionRef.current.resolve(null);
    pendingSelectionRef.current = null;
    setIsFilePickerOpen(false);
  }, []);

  const openCustomPicker = useCallback(async (): Promise<File | null> => {
    if (pendingSelectionRef.current) {
      return null;
    }

    return new Promise<File | null>((resolve, reject) => {
      pendingSelectionRef.current = { resolve, reject };
      setIsFilePickerOpen(true);
    });
  }, []);

  if (!customFilePickerModal) {
    return {
      openCustomPicker: null,
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
    openCustomPicker,
    modalProps: isFilePickerOpen ? modalProps : null
  };
};
