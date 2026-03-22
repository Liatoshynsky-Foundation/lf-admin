export const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '24px',
    width: '100%'
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
    flexDirection: 'column',
    justifyContent: 'space-between',
    maxWidth: '276px',
    height: '164px',
    width: '60%'
  },
  imageBlockButtonsStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1
  },

  imagePreview: {
    maxWidth: '196px',
    maxHeight: '164px',
    width: '100%',
    height: '100%',
    borderRadius: '6px',
    border: '1px solid rgba(178, 179, 190, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  imageOvalPreview: {
    objectFit: 'cover',
    maxWidth: '150px',
    maxHeight: '136px',
    borderRadius: '60% 40% 60% 40% / 55% 45% 55% 45%'
  },
  fileNameText: {
    color: 'rgba(71, 77, 90, 1)',
    fontFamily: 'Mulish',
    mb: '4px'
  },

  imageSizeText: {
    fontFamily: 'Mulish',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '140%',
    fontStyle: 'italic',
    color: 'rgba(82, 84, 90, 1)'
  },
  noImageText: {
    fontFamily: 'Mulish',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '140%',
    color: 'rgba(82, 84, 90, 1)'
  },
  editButton: {
    width: '127px'
  },
  changeButton: { width: '190px' },
  trimmedTypography: {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: '18px',
    fontWeight: 500,
    lineHeight: '150%',
    color: 'rgba(25, 13, 3, 1)',
    fontFamily: 'Mulish',
    letterSpacing: 0
  }
};
