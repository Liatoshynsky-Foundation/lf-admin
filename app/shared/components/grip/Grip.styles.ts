export const styles = {
  box: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 'auto',
    cursor: 'grab',
    '&:active': {
      cursor: 'grabbing',
    },
  },

  getGripStyles: (orientation: 'horizontal' | 'vertical') => ({
    rotate: orientation === 'horizontal' ? '90deg' : '0deg'
  })
};