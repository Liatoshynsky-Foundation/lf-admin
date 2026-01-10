export const styles = {
  root: {
    boxSizing: 'border-box',
    height: '100%',
    minHeight: 0,
    pt: '24px'
  },

  dropzone: (isDragging: boolean, hasError: boolean) => ({
    all: 'unset',
    boxSizing: 'border-box',

    width: '100%',
    height: '100%',
    minHeight: 0,

    borderRadius: '32px',
    border: '2px dashed rgba(193, 201, 214, 0.7)',
    display: 'grid',
    placeItems: 'center',
    padding: {
      xs: '24px',
      sm: '32px'
    },
    cursor: 'pointer',
    outline: 'none',

    ...(isDragging && {
      borderColor: 'rgba(252, 252, 252, 0.85)',
      backgroundColor: 'rgba(255, 255, 255, 0.04)'
    }),

    ...(hasError && {
      borderColor: 'rgba(244, 67, 54, 0.7)'
    }),

    '&:focus-visible': {
      boxShadow: '0 0 0 3px rgba(252, 252, 252, 0.16)'
    }
  }),

  center: {
    display: 'grid',
    gap: '20px',
    justifyItems: 'center',
    textAlign: 'center'
  },

  iconWrap: (hasError: boolean) => ({
    color: hasError ? 'error.main' : '#C1C9D6',
    '& svg': {
      width: '164px',
      height: 'auto',
      display: 'block'
    }
  }),

  text: {
    fontWeight: 600,
    fontSize: '20px',
    lineHeight: '150%',
    color: '#FCFCFC'
  },

  textError: {
    color: 'error.main'
  }
};
