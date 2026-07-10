import { Box, MenuItem } from '@mui/material';
import Link from 'next/link';
import React, { useCallback, useMemo } from 'react';

import styles from './ActionMenu.styles';
import DropdownMenu from './DropdownMenu';

export interface MenuItemConfig {
  id: string;
  text: { name: string; icon?: React.ReactNode };
  href?: string;
  onClick?: () => void;
}

export type ActionMenuGroups = readonly (readonly MenuItemConfig[])[];

interface MenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  menuItems: ActionMenuGroups;
  menuDirection?: 'left' | 'right';
}

function buildMenuItemKey(item: MenuItemConfig): string {
  return `menu-item-${item.id}`;
}

function buildDividerKey(groupId: string): string {
  return `divider-${groupId}`;
}

function deriveGroupId(group: readonly MenuItemConfig[]): string {
  return group.map((item) => item.id).join('-');
}

interface MenuItemComponentProps {
  item: MenuItemConfig;
  onClose: () => void;
}

function MenuItemComponent({ item, onClose }: Readonly<MenuItemComponentProps>) {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLLIElement>) => {
      e.stopPropagation();
      item.onClick?.();
      onClose();
    },
    [item, onClose]
  );

  const content = (
    <Box sx={styles.menuItemContent}>
      {item.text.icon && (
        <Box component="span" sx={styles.menuItemIcon}>
          {item.text.icon}
        </Box>
      )}
      <Box component="span" sx={styles.menuItemText}>
        {item.text.name}
      </Box>
    </Box>
  );

  return (
    <MenuItem component={item.href ? Link : 'li'} href={item.href} sx={styles.menuItem} onClick={handleClick}>
      {content}
    </MenuItem>
  );
}

function buildMenuList(items: ActionMenuGroups, onClose: () => void): React.ReactNode[] {
  return items.flatMap((group, groupIndex) => {
    const groupId = deriveGroupId(group);
    const menuItems = group.map((item) => (
      <MenuItemComponent key={buildMenuItemKey(item)} item={item} onClose={onClose} />
    ));

    const isLastGroup = groupIndex === items.length - 1;
    if (isLastGroup) return menuItems;

    const divider = <Box key={buildDividerKey(groupId)} data-testid="menu-divider" sx={styles.divider} />;

    return [...menuItems, divider];
  });
}

const ActionMenu = ({ anchorEl, onClose, menuItems = [], menuDirection = 'right' }: MenuProps) => {
  const menuList = useMemo(() => buildMenuList(menuItems, onClose), [menuItems, onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
  }, []);

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
          onClick: handleBackdropClick
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

export default ActionMenu;
