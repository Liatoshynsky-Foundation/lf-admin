import { mediaModalTokens as t } from '../../MediaModal.tokens';

export const styles = {
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    p: '2px',
    borderRadius: '999px',
    backgroundColor: t.pillBg,
    width: 'fit-content'
  },

  tabButton: (active: boolean) => ({
    minWidth: 0,
    height: '36px',
    padding: '6px 16px',
    borderRadius: '999px',

    backgroundColor: active ? t.text : 'transparent',
    color: active ? t.surface : t.text,

    '& svg': {
      width: 20,
      height: 20,
      display: 'block'
    },

    '&:hover': {
      backgroundColor: active ? t.text : t.hoverSoft
    }
  })
};
