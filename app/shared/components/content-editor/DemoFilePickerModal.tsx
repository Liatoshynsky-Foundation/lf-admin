'use client';

import { Box } from '@mui/material';

import { FilePickerModalProps } from './types';

export const DemoFilePickerModal = ({ isOpen, onFileSelected, onCancel }: FilePickerModalProps) => {
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
        <h2>Demo File Picker Modal</h2>
        <p>This is a placeholder modal.</p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => onFileSelected('https://via.placeholder.com/400')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Select File (Demo)
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
