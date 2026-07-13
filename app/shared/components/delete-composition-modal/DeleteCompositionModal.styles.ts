import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';

export const styles: Record<string, SxProps<Theme>> = {
  deletePaper: {
    width: '572px',
    maxWidth: '90vw',
    borderRadius: '16px',
    padding: '32px'
  },
  deleteHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
  },
  deleteTitle: {
    fontSize: '24px',
    fontWeight: 700
  },
  deleteDescription: {
    fontSize: '15px',
    color: 'text.secondary',
    marginBottom: '32px'
  },
  deleteActions: {
    display: 'flex',
    gap: '16px'
  },
  deleteButton: {
    color: '#fff',
    backgroundColor: '#d64218',
    '&:hover': { backgroundColor: '#b8350f' }
  }
};
