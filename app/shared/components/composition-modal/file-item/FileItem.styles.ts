import { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  wrapper: {
    width: '100%',
    height: 64
  },
  fileContainer: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid',
    borderColor: 'blue.300',
    borderRadius: '12px',
    padding: '16px',
  },
  fileName: {
    fontSize: 18,
    fontWeight: 500,
    lineHeight: 1.5,
    height: 32
  },
  deleteButton: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};
