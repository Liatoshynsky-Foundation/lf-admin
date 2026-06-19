import { Box, IconButton, MenuItem } from '@mui/material';
import { MoreVertical } from 'lucide-react';
import React, { useRef, useState } from 'react';

import DropdownMenu from '../../dropdown-menu/DropdownMenu';
import { getContextMenuDropdownItem, styles } from './ContextMenu.styles';

export function ContextMenu({
  items,
  triggerLabel
}: Readonly<{ items: readonly { id: string; label: string; danger?: boolean }[]; triggerLabel: string }>) {
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
        menuList={
          <Box>
            {items.map((item) => (
              <MenuItem key={item.id} onClick={handleClose} sx={getContextMenuDropdownItem(item.danger)}>
                {item.label}
              </MenuItem>
            ))}
          </Box>
        }
      />
    </>
  );
}
