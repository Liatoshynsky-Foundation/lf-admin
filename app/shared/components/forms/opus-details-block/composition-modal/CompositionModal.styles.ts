import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';

export const styles: Record<string, SxProps<Theme>> = {
  paper: {
    width: '640px',
    maxWidth: '90vw',
    borderRadius: '16px',
    padding: '32px'
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px'
  },

  heading: {
    fontSize: '24px',
    fontWeight: 700
  },

  closeButton: {
    color: 'text.primary'
  },

  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },

  fieldsRow: {
    display: 'flex',
    gap: '16px',
    '& > *': { flex: 1 }
  },

  field: {
    '& .MuiOutlinedInput-root': { borderRadius: '8px' }
  },

  mediaSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  mediaHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },

  mediaTitle: {
    fontSize: '14px',
    color: 'text.secondary',
    flexShrink: 0,
    whiteSpace: 'nowrap'
  },

  mediaDivider: {
    flex: 1,
    height: '1px',
    bgcolor: 'divider'
  },

  mediaRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  },

  mediaNameField: {
    flex: 1,
    '& .MuiOutlinedInput-root': { borderRadius: '8px' }
  },

  mediaDateField: {
    width: '160px',
    '& .MuiOutlinedInput-root': { borderRadius: '8px' }
  },

  mediaIcon: {
    color: 'text.primary'
  },

  mediaIconBtn: {
    color: 'text.primary',
    marginTop: '4px'
  },

  noteGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignContent: 'flex-start'
  },

  fileChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid',
    borderColor: 'divider'
  },

  fileChipName: {
    flex: 1,
    fontSize: '14px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  noticeBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    borderRadius: '8px',
    backgroundColor: '#e8f1fb'
  },

  noticeIcon: {
    color: '#1d6fb8',
    flexShrink: 0,
    display: 'flex',
    marginTop: '2px'
  },

  noticeText: {
    fontSize: '14px',
    color: 'text.secondary'
  },

  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    marginTop: '32px',
    '& > *': { flex: 1 }
  }
};
