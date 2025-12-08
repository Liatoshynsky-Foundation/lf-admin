export const overwrites = {
  input: {
    borderColor: '#190d033d',
    '& .MuiInputBase-root': {
      borderRadius: 8,
      backgroundColor: 'inherit'
    },
    '&.MuiOutlinedInput-notchedOutline': {
      borderColor: '#d3d3d3',
      borderWidth: '1.5px'
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#190d033d'
    },

    '&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#d3d3d3'
    },

    '& .MuiInputLabel-root': {
      fontSize: 12
    },

    '&.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
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

    '& fieldset': {
      borderColor: '#d3d3d3'
    },

    '& fieldset legend': {
      height: '2px',
      visibility: 'visible',
      fontSize: '0.5rem'
    }
  },
  label: {
    textOverflow: 'ellipsis',
    fontSize: 12,
    color: '#52545a',
    lineHeight: '85%',
    '&.MuiInputLabel-root': {
      color: '#52545a',
      '&.Mui-focused': {
        color: '#52545a'
      }
    }
  },
  helperText: {
    color: '#E53D11'
  }
};

export const autofillFix = {
  '& .MuiInputLabel-root[data-shrink="false"] ~ .MuiOutlinedInput-root input': {
    opacity: 0,
    transition: 'opacity 0.2s ease'
  },
  '& .MuiInputLabel-root[data-shrink="true"] ~ .MuiOutlinedInput-root input': {
    opacity: 1,
    transition: 'opacity 0.2s ease'
  }
};
