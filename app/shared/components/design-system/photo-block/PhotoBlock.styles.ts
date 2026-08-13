export const PREVIEW_W = 196;
export const PREVIEW_H = 120;

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
    width: `${PREVIEW_W}px`,
    height: `${PREVIEW_H}px`,
    objectFit: 'cover',
    flexShrink: 0,
    border: '1px solid',
    borderColor: 'blue.400',
    display: 'grid',
    placeItems: 'center',

    '& svg': {
      opacity: 0.3
    }
  },

  rightBlock: {
    flex: '1',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  },

  textStack: {
    minWidth: 0
  },

  fileNameContainer: {
    display: 'flex',
    gap: '4px',
    minWidth: 0
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

  imageActionButton: {
    gap: '8px'
  },

  editButton: {
    width: '127px'
  },

  changeButton: {
    width: '190px'
  },

  fileNameText: {
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};
