export const styles = {
  separator: {
    height: '1px',
    width: '100%',
    backgroundColor: '#CDD4DE',
    my: 1
  },
  itemWrapper: {
    display: 'flex',
    gap: '24px',
    alignItems: 'center'
  },
  wrapperContent: {
    flex: 1
  },
  trashIcon: (editable: boolean) => ({
    display: editable ? 'block' : 'none',
    width: 40,
    height: 40,
    color: '#ff0000'
  })
};
