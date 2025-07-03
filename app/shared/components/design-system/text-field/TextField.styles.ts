export const styles = {
  customTextFieldStyles: {
    '& .MuiInputBase-root': {
      borderRadius: 8,
      backgroundColor: '#fff'
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#d3d3d3',
      borderWidth: '1.5px'
    },
    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#aaa'
    },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#bbb'
    },

    '& .MuiOutlinedInput-root.Mui-focused': {
      boxShadow: 'none'
    },

    '& .MuiInputLabel-root': {
      fontSize: 12,
      color: '#888'
    },
    '& .MuiInputLabel-shrink': {
      transform: 'translate(14px, -6px) scale(0.85)'
    },
    '& input': {
      padding: '12px 16px',
      fontSize: 16,
      color: '#000'
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
