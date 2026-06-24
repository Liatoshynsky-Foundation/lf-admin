import { Box, IconButton, Link, MenuItem } from '@mui/material';
import { MoreVertical } from 'lucide-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import DropdownMenu from '../../dropdown-menu/DropdownMenu';
import { MenuItem as MenuItemType } from '../row-variants/Row.types';
import { styles } from './ContextMenu.styles';

function buildMenuItemKey(item: MenuItemType): string {
  return `menu-item-${item.id}`;
}

function buildDividerKey(groupId: string): string {
  return `divider-${groupId}`;
}

function deriveGroupId(group: readonly MenuItemType[]): string {
  return group.map((item) => item.id).join('-');
}

function MenuItemComponent({ item, onClose }: Readonly<{ item: MenuItemType; onClose: () => void }>) {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLLIElement>) => {
      e.stopPropagation();
      item.onClick?.();
      onClose();
    },
    [item, onClose]
  );

  return (
    <MenuItem
      key={buildMenuItemKey(item)}
      component={item.href ? Link : 'li'}
      href={item.href}
      sx={styles.menuItem}
      onClick={handleClick}
    >
      {item.label}
    </MenuItem>
  );
}

function buildMenuList(items: readonly (readonly MenuItemType[])[], onClose: () => void): React.ReactNode[] {
  return items.flatMap((group, groupIndex) => {
    const groupId = deriveGroupId(group);
    const menuItems = group.map((item) => (
      <MenuItemComponent key={buildMenuItemKey(item)} item={item} onClose={onClose} />
    ));

    const isLastGroup = groupIndex === items.length - 1;
    if (isLastGroup) return menuItems;

    return [...menuItems, <Box key={buildDividerKey(groupId)} data-testid="menu-divider" sx={styles.divider} />];
  });
}

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

  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
  }, []);

  const menuList = useMemo(() => buildMenuList(items, handleClose), [items, handleClose]);

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
