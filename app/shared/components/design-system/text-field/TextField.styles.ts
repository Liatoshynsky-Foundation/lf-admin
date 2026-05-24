export const styles = {
  textField: {
    '& .MuiInputLabel-root[data-shrink="false"] ~ .MuiInputBase-root input': {
      opacity: 0,
      transition: 'opacity 0.2s ease'
    },
    '& .MuiInputLabel-root[data-shrink="true"] ~ .MuiInputBase-root input': {
      opacity: 1,
      transition: 'opacity 0.2s ease'
    }
  },
  titleStyles: {
    mb: '11px'
  }
};
