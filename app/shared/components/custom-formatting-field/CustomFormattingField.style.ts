export const styles = {
  outlined: (variant: 'multiline' | 'singleLine') => ({
    minHeight: '56px',
    height: 'auto',
    overflow: 'visible',

    alignItems: variant === 'singleLine' ? 'center' : 'flex-start',

    '& .MuiInputBase-input': {
      height: 'auto',
      minHeight: '24px',
      flex: '1 1 auto',
      overflow: 'visible',
      padding: 0
    },

    '& .MuiOutlinedInput-input': {
      height: 'auto',
      minHeight: '24px',
      boxSizing: 'border-box',
      display: 'block',
      overflow: 'visible',
      padding: variant === 'singleLine' ? '0' : '16px 0'
    }
  }),

  container: (error?: boolean) => ({
    position: 'relative',
    width: '100%',

    '&:hover fieldset': {
      borderColor: error ? 'error.main' : 'blue.500'
    }
  }),

  input: () => ({
    width: '100%',
    height: 'auto',
    minHeight: '24px',
    display: 'block',

    '& .ProseMirror': {
      border: 'none',
      width: '100%',
      outline: 'none',
      minHeight: '24px',
      height: 'auto',
      overflow: 'visible'
    },

    '& .ProseMirror p': {
      m: 0,
      lineHeight: '24px'
    },

    '& .ProseMirror p + p': {
      mt: '16px'
    },

    '& .ProseMirror table': {
      width: '100%',
      my: '12px',
      borderCollapse: 'separate',
      borderSpacing: '0 8px',
      tableLayout: 'fixed'
    },

    '& .ProseMirror th, & .ProseMirror td': {
      p: '2px 4px',
      border: '1px dashed',
      borderColor: 'divider',
      verticalAlign: 'top',
      textAlign: 'left',
      fontSize: '14px',
      lineHeight: '20px'
    },

    '& .ProseMirror th': {
      width: '33%',
      pr: '16px',
      fontWeight: 400,
      color: 'text.secondary'
    },

    '& .ProseMirror td': {
      color: 'text.primary'
    },

    '& .ProseMirror th p, & .ProseMirror td p': {
      lineHeight: '20px'
    },

    '& .ProseMirror .selectedCell': {
      backgroundColor: 'action.selected'
    },

    '& .ProseMirror .ProseMirror-gapcursor': {
      display: 'none',
      position: 'absolute',
      pointerEvents: 'none'
    },

    '& .ProseMirror .ProseMirror-gapcursor::after': {
      content: '""',
      display: 'block',
      position: 'absolute',
      top: '-2px',
      width: '20px',
      borderTop: '1px solid',
      borderColor: 'text.primary'
    },

    '& .ProseMirror-focused .ProseMirror-gapcursor': {
      display: 'block'
    },

    '& .ProseMirror p.is-editor-empty:first-of-type::before': {
      color: 'text.disabled',
      content: 'attr(data-placeholder)',
      float: 'left',
      height: 0,
      pointerEvents: 'none'
    }
  })
};
