import { Menu, MenuItem } from '@mui/material';

import styles from './BaseCardMenu.styles';

interface MenuItemConfig {
  text: string;
  href?: string;
  onClick?: () => void;
}

interface BaseCardMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  menuItems: MenuItemConfig[];
}

const BaseCardMenu = ({ anchorEl, onClose, menuItems }: BaseCardMenuProps) => {
  const open = Boolean(anchorEl);

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      sx={styles.menu}
      disableAutoFocusItem
      disableScrollLock
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
    >
      {menuItems.map((item) => (
        <MenuItem
          key={item.text}
          component={item.href ? 'a' : 'li'}
          href={item.href}
          sx={styles.menuItem}
          onClick={() => {
            item.onClick?.();
            onClose();
          }}
        >
          {item.text}
        </MenuItem>
      ))}
    </Menu>
  );
};

export default BaseCardMenu;
