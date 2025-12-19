export const styles = {
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    p: '2px',
    borderRadius: '999px',
    backgroundColor: '#190D03',
    width: 'fit-content'
  },

  tabButton: (active: boolean) => ({
    minWidth: 0,
    height: '36px',
    padding: '6px 16px',
    borderRadius: '999px',

    backgroundColor: active ? '#FCFCFC' : 'transparent',
    color: active ? '#232529' : '#FCFCFC',

    '& svg': {
      width: 20,
      height: 20,
      display: 'block'
    },

    '&:hover': {
      backgroundColor: active ? '#FCFCFC' : 'rgba(255,255,255,0.08)'
    }
  })
};
