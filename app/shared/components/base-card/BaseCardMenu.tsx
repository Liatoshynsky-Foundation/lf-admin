import { Menu, MenuItem } from '@mui/material';
import Link from 'next/link'; // Використовуй Next.js Link для швидкості

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
  menuDirection?: 'left' | 'right';
}

const BaseCardMenu = ({ anchorEl, onClose, menuItems, menuDirection = 'right' }: BaseCardMenuProps) => {
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
        horizontal: menuDirection === 'left' ? 'left' : 'right'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: menuDirection === 'left' ? 'right' : 'left'
      }}
    >
      {menuItems.map((item) => (
        <MenuItem
          key={item.text}
          component={item.href ? Link : 'li'}
          href={item.href ? item.href : undefined}
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
