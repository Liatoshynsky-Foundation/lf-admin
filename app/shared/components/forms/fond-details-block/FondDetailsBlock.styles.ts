import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';

const inputStyle = {
  '& .MuiOutlinedInput-root': { borderRadius: '8px' }
};

export const styles: Record<string, SxProps<Theme>> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%'
  },
  autoFillLabel: {
    fontSize: '12px',
    color: 'text.secondary',
    mb: '-12px'
  },
  countersRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: { xs: 'wrap', md: 'nowrap' }
  },
  fieldsRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: { xs: 'wrap', md: 'nowrap' }
  },
  counterField: {
    width: { xs: '100%', md: '160px' },
    flexShrink: 0,
    ...inputStyle,
    '& .MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: 'inherit',
      color: 'text.primary',
    }
  },
  numberField: {
    width: { xs: '100%', md: '160px' },
    flexShrink: 0,
    ...inputStyle
  },
  fullWidthField: {
    width: '100%',
    ...inputStyle
  },
  halfWidthField: {
    flex: 1,
    minWidth: '160px',
    ...inputStyle
  },
  richTextField: {
    width: '100%',
    maxWidth: '100%',
    ...inputStyle,
    '& .ProseMirror': {
      wordBreak: 'break-word',
      overflowWrap: 'anywhere',
      whiteSpace: 'pre-wrap',
      overflowX: 'hidden'
    }
  }
};