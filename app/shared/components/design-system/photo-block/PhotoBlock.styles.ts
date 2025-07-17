export const styles = {
  container: {
    p: 2,
    maxWidth: '1050px'
  },

  sectionTitle: {
    fontSize: '18px',
    fontWeight: 500,
    color: 'rgba(71, 77, 90, 1)',
    mb: 1,
    fontFamily: 'Mulish'
  },

  imageBlock: {
    display: 'flex',
    gap: 2,
    alignItems: 'flex-start'
  },

  imagePreview: {
    maxWidth: '500px',
    maxHeight: '300px'
  },

  fileNameText: {
    color: 'rgba(71, 77, 90, 1)',
    fontFamily: 'Mulish',
    mb: '8px'
  },

  imageSizeText: {
    mb: 4,
    fontFamily: 'Mulish'
  },

  roundedButton: {
    display: 'flex',
    gap: '2px',
    borderRadius: '999px',
    borderColor: '#1e1e1e',
    color: '#1e1e1e',
    textTransform: 'none',
    fontWeight: 400,
    px: '12px',
    py: '4px',
    fontFamily: 'Mulish',
    border: '1px solid black',
    '&:hover': {
      borderColor: '#000',
      backgroundColor: '#f0f0f0'
    }
  }
};
