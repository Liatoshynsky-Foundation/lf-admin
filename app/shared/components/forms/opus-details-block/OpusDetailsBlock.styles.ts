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
    width: { xs: '100%', md: '125px' },
    flexShrink: 0,
    '& .MuiOutlinedInput-root': { borderRadius: '8px' }
  },

  numberField: {
    width: { xs: '100%', md: '120px' },
    flexShrink: 0,
    '& .MuiOutlinedInput-root': { borderRadius: '8px' }
  },

  noteField: {
    width: { xs: '100%', md: '320px' },
    flexShrink: 0,
    '& .MuiOutlinedInput-root': { borderRadius: '8px' }
  },

  nameField: {
    width: '100%',
    '& .MuiOutlinedInput-root': { borderRadius: '8px' }
  },

  genreField: {
    flex: 2,
    minWidth: '160px',
    '& .MuiOutlinedInput-root': { borderRadius: '8px' }
  },

  yearSeparator: {
    display: { xs: 'none', md: 'flex' },
    alignItems: 'center',
    color: 'text.secondary',
    flexShrink: 0
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

  compositionRowDragging: {
    opacity: 0.5
  },

  dragHandle: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'grab',
    flexShrink: 0,
    color: '#9ca3af',
    '&:active': { cursor: 'grabbing' }
  },

  compositionInput: {
    flex: 1,
    '& .MuiOutlinedInput-root': { borderRadius: '8px' }
  },

  rowIcon: {
    color: 'text.primary',
    flexShrink: 0
  },
};
