'use client';

import { Box, IconButton, Link, MenuItem } from '@mui/material';
import { MoreVertical } from 'lucide-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import DropdownMenu from '../../dropdown-menu/DropdownMenu';
import { MenuItem as MenuItemType } from '../row-variants/Row.types';
import { styles } from './ContextMenu.styles';

export function ContextMenu({
  items,
  triggerLabel
}: Readonly<{
  items: readonly (readonly MenuItemType[])[];
  triggerLabel: string;
}>) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const handleOpen = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  const menuList = useMemo(() => {
    return items.flatMap((group, groupIndex) => {
      const renderedGroup = group.map((item) => {
        return (
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
        );
      });

      if (groupIndex < items.length - 1) {
        renderedGroup.push(<Box key={`divider-${groupIndex}`} data-testid="menu-divider" sx={styles.divider} />);
      }

      return renderedGroup;
    });
  }, [items, handleClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
  }, []);

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
            onClick: handleBackdropClick
          }
        }}
        menuList={menuList}
      />
    </>
  );
}
