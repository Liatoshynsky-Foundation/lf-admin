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

  tabButton: (active: boolean) => {
    const base = {
      minWidth: 0,
      height: '36px',
      padding: '6px 16px',
      borderRadius: '999px',

      '& svg': {
        width: 20,
        height: 20,
        display: 'block'
      }
    } as const;

    if (active) return base;

    return {
      ...base,
      '&:hover': {
        backgroundColor: t.hoverSoft
      }
    };
  }
};
