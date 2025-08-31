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
    }
  },
  titleStyles: {
    mb: '11px'
  }
};
