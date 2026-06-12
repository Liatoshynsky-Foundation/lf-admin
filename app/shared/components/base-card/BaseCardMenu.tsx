import { Box, Menu, MenuItem } from '@mui/material';
import Link from 'next/link';

import styles from './BaseCardMenu.styles';

interface MenuItemConfig {
  text: { name: string; icon?: React.ReactNode };
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
        horizontal: menuDirection === 'left' ? 'left' : 'right'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: menuDirection === 'left' ? 'right' : 'left'
      }}
    >
      {menuItems.map((item) => (
        <MenuItem
          key={item.text.name}
          component={item.href ? Link : 'li'}
          href={item.href ? item.href : undefined}
          sx={styles.menuItem}
          onClick={() => {
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
      ))}
    </Menu>
  );
};

export default BaseCardMenu;
