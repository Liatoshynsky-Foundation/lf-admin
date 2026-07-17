import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';

export const styles: Record<string, SxProps<Theme>> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%'
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
  addBtnTop: {
    backgroundColor: 'black',
    color: 'white',
    '&:hover': {
      backgroundColor: 'rgb(52, 42, 33)'
    }
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
