import { SxProps, Theme } from '@mui/material';

interface RichTextEditorStyles {
  container: SxProps<Theme>;
  title: SxProps<Theme>;
  editor: React.CSSProperties;
  bubbleMenu: SxProps<Theme>;
}

export const styles: RichTextEditorStyles = {
  container: { position: 'relative', display: 'inline-block' },
  title: {
    position: 'absolute',
    top: '-6.5px',
    left: '16px',
    fontFamily: 'Mulish, serif',
    fontWeight: 500,
    fontStyle: 'normal',
    fontSize: '14px',
    lineHeight: '12px',
    verticalAlign: 'middle',
    color: '#52545A',
    backgroundColor: 'white',
    padding: '0 2px',
    zIndex: 1
  },
  editor: {
    width: '904px',
    opacity: 1,
    borderRadius: '8px',
    border: '1px solid #9D9FA9',
    padding: '12px 16px',
    position: 'relative',
    fontFamily: 'Mulish',
    fontWeight: 500,
    fontStyle: 'normal',
    fontSize: '16px',
    lineHeight: '150%',
    color: '#190D03'
  },
  bubbleMenu: {
    zIndex: 2000,
    backgroundColor: '#52545A',
    border: '1px solid var(--gray-1)',
    borderRadius: '0.7rem',
    display: 'flex',
    padding: '0.2rem'
  }
};
