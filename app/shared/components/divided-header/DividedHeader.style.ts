import { SxProps, Theme } from '@mui/material';

export const styles = {
  container: {
    width: '100%',
    height: '104px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '0.5px solid',
    borderColor: 'blue.500',
    p: '32px 24px'
  } as SxProps<Theme>,

  contentStack: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  } as SxProps<Theme>,

  children: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderInline: '1px solid',
    borderColor: 'blue.400',
    width: '100%',
    height: '40px',
    mx: '12px',
    px: '16px',
    gap: '16px'
  } as SxProps<Theme>,

  returnButton: {
    color: 'text.primary'
  } as SxProps<Theme>
};
