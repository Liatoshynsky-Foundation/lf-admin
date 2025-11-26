import { Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

export const EditorContainer = styled(Paper)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper
}));

export const ToolbarContainer = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1),
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(0.5),
  backgroundColor: '#F1F2F7',
  position: 'sticky',
  top: 0,
  zIndex: 10
}));

export const ToolbarDivider = styled(Box)(({ theme }) => ({
  width: '1px',
  height: '32px',
  backgroundColor: theme.palette.divider,
  margin: theme.spacing(0, 0.5)
}));

export const EditorContent = styled(Box)<{ minHeight?: string }>(({ theme, minHeight }) => ({
  flex: 1,
  padding: theme.spacing(2, 3),
  minHeight: minHeight || '300px',
  maxHeight: '70vh',
  overflowY: 'auto',

  '& .ProseMirror': {
    outline: 'none',
    minHeight: minHeight || '300px',

    '& p': {
      margin: theme.spacing(0.5, 0),
      lineHeight: 1.6
    },

    '& h1': {
      fontSize: '2rem',
      fontWeight: 700,
      margin: theme.spacing(2, 0, 1, 0),
      lineHeight: 1.2
    },

    '& h2': {
      fontSize: '1.75rem',
      fontWeight: 700,
      margin: theme.spacing(2, 0, 1, 0),
      lineHeight: 1.3
    },

    '& h3': {
      fontSize: '1.5rem',
      fontWeight: 600,
      margin: theme.spacing(1.5, 0, 1, 0),
      lineHeight: 1.4
    },

    '& h4': {
      fontSize: '1.25rem',
      fontWeight: 600,
      margin: theme.spacing(1.5, 0, 1, 0),
      lineHeight: 1.5
    },

    '& h5': {
      fontSize: '1.1rem',
      fontWeight: 600,
      margin: theme.spacing(1, 0, 0.5, 0),
      lineHeight: 1.5
    },

    '& h6': {
      fontSize: '1rem',
      fontWeight: 600,
      margin: theme.spacing(1, 0, 0.5, 0),
      lineHeight: 1.5
    },

    '& ul, & ol': {
      padding: theme.spacing(0, 0, 0, 3),
      margin: theme.spacing(1, 0)
    },

    '& li': {
      margin: theme.spacing(0.25, 0),
      lineHeight: 1.6
    },

    '& code': {
      backgroundColor: '#F1F2F7',
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(0.25, 0.5),
      fontSize: '0.9em',
      fontFamily: 'monospace'
    },

    '& pre': {
      backgroundColor: theme.palette.grey[900],
      color: theme.palette.common.white,
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(2),
      margin: theme.spacing(1, 0),
      overflow: 'auto',

      '& code': {
        backgroundColor: 'transparent',
        color: 'inherit',
        padding: 0
      }
    },

    '& blockquote': {
      borderLeft: `4px solid ${theme.palette.primary.main}`,
      paddingLeft: theme.spacing(2),
      marginLeft: 0,
      marginRight: 0,
      fontStyle: 'italic',
      color: theme.palette.text.secondary
    },

    '& a': {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
      cursor: 'pointer',

      '&:hover': {
        color: theme.palette.primary.dark
      }
    },

    '& img': {
      maxWidth: '100%',
      height: 'auto',
      borderRadius: theme.shape.borderRadius,
      margin: theme.spacing(1, 0),
      display: 'inline-block',
      verticalAlign: 'top',

      '&[data-float="left"]': {
        float: 'left',
        marginRight: theme.spacing(2),
        marginBottom: theme.spacing(1),
        marginLeft: 0
      },

      '&[data-float="right"]': {
        float: 'right',
        marginLeft: theme.spacing(2),
        marginBottom: theme.spacing(1),
        marginRight: 0
      }
    },

    '& hr': {
      border: 'none',
      borderTop: `2px solid ${theme.palette.divider}`,
      margin: theme.spacing(2, 0)
    },

    '& p.is-editor-empty:first-of-type::before': {
      content: 'attr(data-placeholder)',
      float: 'left',
      color: theme.palette.text.disabled,
      pointerEvents: 'none',
      height: 0
    }
  },

  '& .ProseMirror-selectednode': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px'
  }
}));

export const SaveButtonContainer = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1.5, 2),
  display: 'flex',
  justifyContent: 'flex-end',
  backgroundColor: '#F1F2F7'
}));
