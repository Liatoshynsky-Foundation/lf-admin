import { SxProps, Theme } from '@mui/material';

export const galleryStyles = {
  container: {
    width: '100%',
    minHeight: '500px',
    cursor: 'default'
  } as SxProps<Theme>,

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px'
  } as SxProps<Theme>,

  title: {
    color: '#FFFFFF',
    fontSize: '24px',
    fontWeight: 600
  } as SxProps<Theme>,

  actionsContainer: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  } as SxProps<Theme>,

  searchButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#424242',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: '1px solid #666',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#555'
    }
  } as SxProps<Theme>,

  filterButton: {
    height: '40px',
    padding: '0 16px',
    borderRadius: '20px',
    backgroundColor: '#424242',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    border: '1px solid #666',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    '&:hover': {
      backgroundColor: '#555'
    }
  } as SxProps<Theme>,

  filterText: {
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 500
  } as SxProps<Theme>,

  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(196px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
    '@media (max-width: 1200px)': {
      gridTemplateColumns: 'repeat(3, minmax(196px, 1fr))'
    },
    '@media (max-width: 900px)': {
      gridTemplateColumns: 'repeat(2, minmax(196px, 1fr))'
    },
    '@media (max-width: 600px)': {
      gridTemplateColumns: 'repeat(1, minmax(196px, 1fr))'
    }
  } as SxProps<Theme>,

  fileNameContainer: {
    display: 'flex',
    alignItems: 'center',
    minHeight: '40px'
  } as SxProps<Theme>,

  /*fileNameText: (isSelected: boolean): SxProps<Theme> => ({
    color: '#FCBD28',
    fontSize: '14px',
    fontWeight: 400
  }),*/

  emptyState: {
    textAlign: 'center',
    padding: '48px',
    color: '#999'
  } as SxProps<Theme>
};
