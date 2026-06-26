import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';

export const styles: Record<string, SxProps<Theme>> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%'
  },

  fieldsRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: { xs: 'wrap', md: 'nowrap' }
  },

  field: {
    flex: 1,
    minWidth: '160px',
    '& .MuiOutlinedInput-root': { borderRadius: '8px' }
  },

  kindField: {
    width: { xs: '100%', md: '120px' },
    flexShrink: 0,
    '& .MuiOutlinedInput-root': { borderRadius: '8px' }
  },

  numberField: {
    width: { xs: '100%', md: '120px' },
    flexShrink: 0,
    '& .MuiOutlinedInput-root': { borderRadius: '8px' }
  },

  nameField: {
    flex: 2,
    minWidth: '200px',
    '& .MuiOutlinedInput-root': { borderRadius: '8px' }
  },

  compositionsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginTop: '8px'
  },

  compositionsTitle: {
    fontSize: '14px',
    color: 'text.secondary',
    flexShrink: 0,
    whiteSpace: 'nowrap'
  },

  compositionsDivider: {
    flex: 1,
    height: '1px',
    bgcolor: 'divider'
  },

  compositionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  compositionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  dragHandle: {
    cursor: 'grab',
    flexShrink: 0,
    color: '#9ca3af'
  },

  compositionInput: {
    flex: 1,
    '& .MuiOutlinedInput-root': { borderRadius: '8px' }
  },

  rowIcon: {
    color: 'text.primary',
    flexShrink: 0
  },

  deletePaper: {
    width: '480px',
    maxWidth: '90vw',
    borderRadius: '16px',
    padding: '32px'
  },

  deleteHeader: {
    display: 'flex',
    alignItems: 'flex-start',
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
    backgroundColor: '#d64218',
    '&:hover': { backgroundColor: '#b8350f' }
  }
};
