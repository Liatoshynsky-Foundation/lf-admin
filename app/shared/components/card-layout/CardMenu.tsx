import { Box, MenuItem } from '@mui/material';
import Link from 'next/link';

import DropdownMenu from '../dropdown-menu/DropdownMenu';
import styles from './CardMenu.styles';

interface MenuItemConfig {
  text: { name: string; icon?: React.ReactNode };
  href?: string;
  onClick?: () => void;
}

interface CardMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  menuItems: MenuItemConfig[];
  menuDirection?: 'left' | 'right';
}

const CardMenu = ({ anchorEl, onClose, menuItems, menuDirection = 'right' }: CardMenuProps) => {
  const menuList = menuItems.map((item) => (
    <MenuItem
      key={item.text.name}
      component={item.href ? Link : 'li'}
      href={item.href ?? undefined}
      sx={styles.menuItem}
      onClick={(e: React.MouseEvent<HTMLLIElement>) => {
        e.stopPropagation();
        item.onClick?.();
        onClose();
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
        {item.text.icon && (
          <Box component="span" sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {item.text.icon}
          </Box>
        )}
        <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
          {item.text.name}
        </Box>
      </Box>
    </MenuItem>
  ));

  return (
    <DropdownMenu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      menuList={menuList}
      sx={styles.menu}
      disableAutoFocusItem
      disableScrollLock
      slotProps={{
        backdrop: {
          onClick: (e) => {
            e.stopPropagation();
            e.preventDefault();
          }
        }
      }}
      anchorOrigin={{
        vertical: 'top',
        horizontal: menuDirection === 'right' ? 'left' : 'right'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: menuDirection === 'right' ? 'right' : 'left'
      }}
    />
  );
};

export default CardMenu;
