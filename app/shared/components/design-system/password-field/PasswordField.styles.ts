export const styles = {
  '& .MuiInputLabel-root[data-shrink="false"] ~ .MuiOutlinedInput-root input': {
    opacity: 0,
    transition: 'opacity 0.2s ease'
  },
  '& .MuiInputLabel-root[data-shrink="true"] ~ .MuiOutlinedInput-root input': {
    opacity: 1,
    transition: 'opacity 0.2s ease'
  }
};
