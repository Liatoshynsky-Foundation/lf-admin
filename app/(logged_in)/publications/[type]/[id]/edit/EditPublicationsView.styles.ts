export const styles = {
  container: {
    width: '100%',
    bgcolor: 'adminBlue.50'
  },
  header: {
    bgcolor: 'white'
  },
  menu: {
    mt: 1,
    '& .MuiPaper-root': {
      '&::-webkit-scrollbar': {
        display: 'none'
      },
      msOverflowStyle: 'none',
      scrollbarWidth: 'none',

      overflowY: 'auto'
    }
  },
  menuSubheader: {
    height: 26,
    display: 'flex',
    alignItems: 'center'
  },
  menuItem: {
    p: '10px 16px',
    borderRadius: '8px',
    height: 44
  },
  draftCaption: {
    color: 'red.600',
  },
  mainContent: {
    minHeight: '100vh',
    bgcolor: 'adminBlue.50',
    p: '16px 32px'
  },
  contentEditor: {
    p: '24px',
    bgcolor: 'white',
    borderRadius: '20px',
    borderColor: 'blue.200',
    '& .bn-editor': {
      maxWidth: '1136px',
      bgcolor: 'white'
    }
  }
};
