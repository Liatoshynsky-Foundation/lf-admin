import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';

export const styles: Record<string, SxProps<Theme>> = {
  container: {
    border: '0.5px solid',
    borderColor: 'blue.200',
    borderRadius: '20px',
    backgroundColor: 'white',
    boxShadow: 'none'
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px'
  },

  title: {
    lineHeight: '1.2',
    fontWeight: 700
  },

  addButton: {
    textTransform: 'none',
    boxShadow: 'none',
    fontWeight: 600,
    '&:hover': { boxShadow: 'none' }
  },

  content: {
    padding: '0 24px 24px'
  },

  cipherText: {
    fontStyle: 'italic'
  }
};