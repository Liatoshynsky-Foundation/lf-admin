type BorderState = 'hasError' | 'isFocused' | 'default';

const BORDER_COLORS: Record<BorderState, string> = {
  hasError: 'error.main',
  isFocused: 'blue.500',
  default: 'gray'
};

const getBorderState = (isFocused: boolean | null, hasError: boolean): BorderState => {
  if (hasError) return 'hasError';
  if (isFocused) return 'isFocused';
  return 'default';
};

export const styles = {
  container: (error?: boolean) => ({
    position: 'relative',
    width: '100%',
    '&:hover fieldset': {
      borderColor: error ? 'error.main' : 'blue.500',
    }
  }),
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

    '& .ProseMirror p + p': {
      mt: '12px'
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
  },

  label: (isActive: boolean | null, hasError: boolean = false) => ({
    position: 'absolute',
    left: '14px',
    top: isActive ? '-6px' : '14px',
    fontSize: isActive ? '12px' : '16px',
    lineHeight: isActive ? '12px' : '24px',
    px: isActive ? '4px' : 0,
    backgroundColor: isActive ? 'background.paper' : 'transparent',
    color: hasError ? 'error.main' : 'text.secondary',
    pointerEvents: isActive ? 'none' : 'auto',
    cursor: 'text',
    zIndex: 1,
    transition: 'all 0.2s ease-out'
  }),

  fieldset: (isFocused: boolean | null, hasError: boolean = false) => ({
    position: 'absolute',
    top: -5,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: '8px',
    borderStyle: 'solid',
    borderWidth: '1px',
    pl: '12px',
    borderColor: BORDER_COLORS[getBorderState(isFocused, hasError)]
  }),

  helperText: {
    color: 'error.main',
    fontSize: '12px',
    mt: '4px',
    ml: '14px'
  },

  legend: (isActive: boolean, hasError: boolean = false) => ({
    display: 'block',
    fontSize: '12px',
    maxWidth: isActive ? '100%' : '0',
    transition: 'max-width 0.2s',
    visibility: 'hidden',
    color: hasError ? 'error.main' : 'inherit'
  }),

  contentWrapper: {
    position: 'relative',
    padding: '16px 12px 12px',
    minHeight: '56px',
    display: 'flex',
    alignItems: 'flex-start'
  }
};
