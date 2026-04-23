export const styles = {
  container: {
    width: '100%'
  },

  sectionTitle: {
    mb: 1
  },

  imageBlock: {
    display: 'flex',
    gap: 3,
    alignItems: 'flex-start',
    minWidth: '366px'
  },

  imagePreview: {
    width: '196px',
    height: '120px',
    objectFit: 'cover',
    flexShrink: 0,
    border: '1px solid',
    borderColor: 'blue.400',
    display: 'grid',
    placeItems: 'center'
  },

  rightBlock: {
    flex: '1',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column'
  },

  imageOvalPreview: {
    objectFit: 'cover',
    maxWidth: '150px',
    maxHeight: '136px',
    borderRadius: '60% 40% 60% 40% / 55% 45% 55% 45%'
  },
  imageSizeText: {
    fontStyle: 'italic'
  },
  editButton: {
    width: '127px'
  },
  changeButton: {
    width: '190px'
  },
  trimmedTypography: {
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};
