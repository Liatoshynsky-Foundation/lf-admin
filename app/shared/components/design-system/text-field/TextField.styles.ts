export const styles = {
  customTextFieldStyles: {
    '& .MuiInputBase-root': {
      borderRadius: 8,
      backgroundColor: 'inherit'
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#d3d3d3',
      borderWidth: '1.5px'
    },
    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#190d033d'
    },

    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#d3d3d3'
    },

    '& .MuiInputLabel-root': {
      fontSize: 12
    },

    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#d3d3d3'
    },
    '& .MuiInputLabel-shrink': {
      transform: 'translate(14px, -6px) scale(0.85)'
    },

    '& .MuiInputLabel-root.Mui-focused': {
      color: '#52545a'
    },

    '& input': {
      padding: '12px 16px',
      fontSize: 16,
      color: '#000'
    },
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
    mb: '11px',
    color: '#4a4a4a',
    fontFamily: 'Mulish, sans-serif',
    fontSize: 18,
    fontWeight: 500
  }
};
