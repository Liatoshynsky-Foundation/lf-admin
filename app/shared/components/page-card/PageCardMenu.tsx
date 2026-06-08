import { Menu, MenuItem } from '@mui/material';

import styles from './PageCardMenu.styles';

interface PageCardMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  editSeoHref: string;
}

const PageCardMenu = ({ anchorEl, onClose, editSeoHref }: PageCardMenuProps) => {
  const open = Boolean(anchorEl);

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      sx={styles.menu}
      disableAutoFocusItem
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
    >
      <MenuItem component="a" href={editSeoHref} sx={styles.menuItem} onClick={onClose}>
        Редагувати SEO
      </MenuItem>
    </Menu>
  );
};

export default PageCardMenu;
