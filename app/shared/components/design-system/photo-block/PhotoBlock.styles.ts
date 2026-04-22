export const PREVIEW_W = 196;
export const PREVIEW_H = 120;

export const styles = {
  container: {
    width: '100%',
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
    gap: 3,
    alignItems: 'flex-start',
    minWidth: '366px'
  },

  imagePreview: {
    width: `${PREVIEW_W}px`,
    height: `${PREVIEW_H}px`,
    objectFit: 'cover',
    flexShrink: 0,
    border: '1px solid #B2B3BE',
    display: 'grid',
    placeItems: 'center'
  },

  rightBlock: {
    flex: '1',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  },

  imageOvalPreview: {
    objectFit: 'cover',
    maxWidth: '150px',
    maxHeight: '136px',
    borderRadius: '60% 40% 60% 40% / 55% 45% 55% 45%'
  },
  fileNameText: {
    color: '#190D03',
    fontFamily: 'Mulish',
    fontWeight: 500,
    fontSize: '18px',
    lineHeight: '150%'
  },

  imageSizeText: {
    fontFamily: 'Mulish',
    fontWeight: 500,
    fontStyle: 'italic',
    fontSize: '16px',
    lineHeight: '140%',
    letterSpacing: '0%',
    color: '#52545A'
  },
  editButton: {
    width: '127px',
    height: '32px',
    padding: '4px 12px',
    border: '1px solid #190D03',
    color: '#190D03',
    fontFamily: 'Mulish',
    fontWeight: 400,
    fontStyle: 'Regular',
    fontSize: '14px',
    lineHeight: '140%',
    letterSpacing: '0px'
  },
  changeButton: {
    width: '190px',
    height: '32px',
    padding: '4px 12px',
    border: '1px solid #190D03',
    color: '#190D03',
    fontFamily: 'Mulish',
    fontWeight: 400,
    fontStyle: 'Regular',
    fontSize: '14px',
    lineHeight: '140%',
    letterSpacing: '0px'
  },
  trimmedTypography: {
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  altTextField: {
    minHeight: '48px',
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderRadius: '8px',
        borderColor: '#ADAEBA',
        borderWidth: '1px',
        padding: '12px 16px',
        fontSize: '16px',
        fontWeight: 500,
        lineHeight: '150%',
        fontFamily: 'Mulish'
      },
      '&:hover fieldset': {
        borderColor: 'rgba(25, 13, 3, 0.5)'
      },
      '&.Mui-focused fieldset': {
        borderColor: '#190D03',
        borderWidth: '1px'
      }
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#52545A'
    }
  }
};
