import { Box, IconButton, MenuItem } from '@mui/material';
import { Link, MoreVertical } from 'lucide-react';
import React, { useRef, useState } from 'react';

import DropdownMenu from '../../dropdown-menu/DropdownMenu';
import { styles } from './ContextMenu.styles';

export function ContextMenu({
  items,
  triggerLabel
}: Readonly<{
  items: readonly { id: string; label: string; href?: string; onClick?: () => void }[];
  triggerLabel: string;
}>) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const menuList = items.map((item) => (
    <MenuItem
      key={item.id}
      component={item.href ? Link : 'li'}
      href={item.href ?? undefined}
      sx={styles.menuItem}
      onClick={(e: React.MouseEvent<HTMLLIElement>) => {
        e.stopPropagation();
        item.onClick?.();
        handleClose();
      }}
    >
      {item.label}
    </MenuItem>
  ));

  return (
    <>
      <Box sx={styles.contextMenuWrapper}>
        <IconButton
          component="span"
          ref={triggerRef}
          onClick={handleOpen}
          aria-label={triggerLabel}
          aria-haspopup="menu"
          aria-expanded={Boolean(anchorEl)}
          sx={styles.contentMenuButton}
        >
          <MoreVertical size={22} />
        </IconButton>
      </Box>

      <DropdownMenu
        disableScrollLock
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={styles.contextMenuDropdown}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          backdrop: {
            onClick: (e) => {
              e.stopPropagation();
              e.preventDefault();
            }
          }
        }}
        menuList={menuList}
      />
    </>
  );
}
