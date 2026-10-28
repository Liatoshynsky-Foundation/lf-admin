import { type SxProps, type Theme } from '@mui/material';

export const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    width: '100%'
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    width: '100%'
  },
  label: {
    color: 'adminBlue.800',
    fontSize: '14px',
    fontWeight: 500,
    whiteSpace: 'nowrap'
  },
  dividerLine: {
    flexGrow: 1,
    height: '1px',
    backgroundColor: 'adminBlue.200'
  },
  addButton: {
    borderRadius: '24px',
    textTransform: 'none',
    fontWeight: 500,
    whiteSpace: 'nowrap'
  },
  fileCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid',
    borderColor: 'adminBlue.300',
    backgroundColor: 'background.default',
    transition: 'border-color 0.15s ease',
    '&:hover': {
      borderColor: 'adminBlue.500'
    }
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    minWidth: 0,
    overflow: 'hidden'
  },
  pdfBadge: {
    width: 24,
    height: 24,
    flexShrink: 0
  },
  fileName: {
    fontSize: '15px',
    fontWeight: 500,
    color: 'text.primary',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  deleteButton: {
    color: 'adminBlue.700',
    padding: '6px',
    transition: 'color 0.15s ease',
    '&:hover': {
      color: 'error.main',
      backgroundColor: 'transparent'
    }
  }
} satisfies Record<string, SxProps<Theme>>;
