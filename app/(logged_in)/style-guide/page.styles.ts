import { SxProps, Theme } from '@mui/material';

export const styles = {
  sandboxWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    pb: 2
  },
  sandboxText: {
    backgroundColor: 'peachpuff',
    padding: '8px 16px',
    borderRadius: '8px'
  },
  pageWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    padding: '40px'
  },
  blockSeparator: {
    mt: 4
  },
  downloadWrapper: {
    backgroundColor: 'black',
    padding: '16px',
    borderRadius: '8px'
  },
  componentVariantSeparator: {
    mt: 2
  },
  textFieldInput: {
    fontSize: 18,
    fontWeight: 700
  },
  customToolTipWrapper: {
    width: '100%',
    border: '1px dashed grey',
    p: 1,
    display: 'inline-block',
    cursor: 'help'
  },
  customToolTipText: {
    fontWeight: 'bold'
  },
  searchStatePreview: {
    p: 2,
    bgcolor: '#f5f5f5',
    borderRadius: '8px',
    maxWidth: '400px'
  },
  mediaContainer: {
    maxWidth: '400px',
    padding: '10px',
    backgroundColor: '#232529'
  },
  searchButtonContainer: {
    maxWidth: '400px',
    padding: '10px',
    backgroundColor: 'grey'
  }
} satisfies Record<string, SxProps<Theme>>;
