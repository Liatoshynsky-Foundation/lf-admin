export const styles = {
  container: {
    position: 'relative',
    width: '100%',
    '&:hover fieldset': {
      borderColor: 'blue.500',
    }
  },
  input: {
    width: '100%',

    '& .ProseMirror': {
      border: 'none',
      width: '100%',
      outline: 'none',
      minHeight: '24px'
    },

    '& .ProseMirror p': {
      m: 0,
      lineHeight: '24px'
    },
    '& .ProseMirror p.is-editor-empty:first-of-type::before': {
      color: 'text.disabled',
      content: 'attr(data-placeholder)',
      float: 'left',
      height: 0,
      pointerEvents: 'none'
    }
  },

  label: (isActive: boolean | null, hasError: boolean = false) => ({
    position: 'absolute',
    left: '14px',
    top: isActive ? '-6px' : '14px',
    fontSize: isActive ? '12px' : '16px',
    color: hasError ? 'error.main' : 'text.secondary',
    pointerEvents: isActive ? 'none' : 'auto',
    cursor: 'text',
    transition: 'all 0.2s ease-out'
  }),

  fieldset: (isFocused: boolean | null, hasError: boolean = false) => {
    const borderColor = hasError ? 'error.main' : isFocused ? 'blue.500' : 'gray';

    return {
      position: 'absolute',
      top: -5,
      bottom: 0,
      left: 0,
      right: 0,
      borderRadius: '8px',
      borderStyle: 'solid',
      borderWidth: '1px',
      pl: '12px',
      borderColor
    };
  },

  helperText: {
    color: 'error.main',
    fontSize: '12px',
    mt: '4px',
    ml: '14px'
  },

  legend: (isActive: boolean) => ({
    display: 'block',
    fontSize: '12px',
    maxWidth: isActive ? '100%' : '0',
    transition: 'max-width 0.2s',
    visibility: 'hidden'
  }),

  contentWrapper: {
    position: 'relative',
    padding: '12px',
    minHeight: '48px',
    display: 'flex',
    alignItems: 'center'
  }
};
