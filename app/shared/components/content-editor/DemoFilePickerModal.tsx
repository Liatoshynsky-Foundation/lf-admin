'use client';

import { Box } from '@mui/material';

import { FilePickerModalProps } from './types';

export const DemoFilePickerModal = ({ isOpen, onFileSelected, onCancel, onDeviceFilePick }: FilePickerModalProps) => {
  const handleSelectFile = async () => {
    console.log('Select file clicked');

    if (!onDeviceFilePick) {
      console.error('onDeviceFilePick callback not provided');
      return;
    }

    try {
      const file = await onDeviceFilePick();
      console.log('File selected from device:', file);

      if (file) {
        console.log('File selected:', file.name, file.type);
        const reader = new FileReader();
        reader.onload = (e) => {
          const fileUrl = e.target?.result as string;
          console.log('File loaded, URL length:', fileUrl.length);
          onFileSelected(fileUrl);
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error selecting file:', error);
    }
  };

  console.log('DemoFilePickerModal render, isOpen:', isOpen);

  if (!isOpen) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      <Box
        sx={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '90%'
        }}
      >
        <h2>Test Modal</h2>
        <p>This is a test modal.</p>

        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleSelectFile}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Select File
          </button>
          <button
            onClick={onCancel}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </Box>
    </Box>
  );
};
