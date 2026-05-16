import { mainHexPallete } from '~/shared/theme/colors';

export const styles = {
  dialogPaper: {
    width: '572px',
    maxWidth: '100%',
    borderRadius: '24px',
    padding: '28px 24px 28px 32px'
  },
  closeIcon: {
    position: 'absolute',
    top: 24,
    right: 24,
    cursor: 'pointer',
    color: mainHexPallete.black
  },
  title: {
    padding: 0,
    paddingBottom: '16px',
    fontSize: '24px',
    fontWeight: 700,
    color: mainHexPallete.black
  },
  content: {
    padding: 0
  },
  description: {
    color: mainHexPallete.blue[800],
    fontSize: '16px',
    lineHeight: '150%'
  },
  filename: {
    fontWeight: 700,
    color: mainHexPallete.blue[800]
  },
  usageList: {
    marginTop: '12px',
    marginBottom: 0,
    paddingLeft: '24px',
    color: mainHexPallete.blue[800]
  },
  usageItem: {
    fontSize: '16px',
    lineHeight: '150%',
    textDecoration: 'underline',
    textUnderlineOffset: '2px'
  },
  actions: {
    padding: 0,
    paddingTop: '40px',
    display: 'flex',
    justifyContent: 'flex-start',
    gap: '16px'
  },
  deleteBtn: {
    backgroundColor: mainHexPallete.red[600],
    color: mainHexPallete.white,
    '&:hover': {
      backgroundColor: mainHexPallete.red[700]
    }
  },
  okBtn: {
    backgroundColor: mainHexPallete.yellow[500],
    color: mainHexPallete.black,
    '&:hover': {
      backgroundColor: mainHexPallete.yellow[600]
    }
  }
};
