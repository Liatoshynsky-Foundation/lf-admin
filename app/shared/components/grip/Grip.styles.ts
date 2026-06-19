export const styles = {
  box: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '24px',  
    height: '24px', 
    cursor: 'grab',
    '&:active': {
      cursor: 'grabbing',
    },
  },

  getGripStyles: (orientation: 'horizontal' | 'vertical') => ({
    rotate: orientation === 'horizontal' ? '90deg' : '0deg'
  })
};