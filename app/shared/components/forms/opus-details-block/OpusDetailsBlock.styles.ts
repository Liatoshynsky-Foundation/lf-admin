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

  fieldsRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: { xs: 'wrap', md: 'nowrap' }
  },

  field: {
    flex: 1,
    minWidth: '160px',
    ...inputStyle
  },

  kindField: {
    width: { xs: '100%', md: '130px' },
    flexShrink: 0,
    ...inputStyle
  },

  numberField: {
    width: { xs: '100%', md: '120px' },
    flexShrink: 0,
    ...inputStyle
  },

  noteField: {
    width: { xs: '100%', md: '320px' },
    flexShrink: 0,
    ...inputStyle
  },

  nameField: {
    width: '100%',
    ...inputStyle
  },

  genreField: {
    flex: 2,
    minWidth: '160px',
    ...inputStyle
  },

  yearSeparator: {
    display: { xs: 'none', md: 'flex' },
    alignItems: 'center',
    color: 'text.secondary',
    flexShrink: 0
  }
};
