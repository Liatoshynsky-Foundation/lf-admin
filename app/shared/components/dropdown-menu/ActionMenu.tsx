import { Box, ListSubheader, MenuItem } from '@mui/material';
import { MenuProps as MuiMenuProps } from '@mui/material/Menu';
import { Check } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useMemo } from 'react';

import styles from './ActionMenu.styles';
import DropdownMenu from './DropdownMenu';

export interface MenuItemConfig {
  id: string;
  text: {
    name: string;
    icon?: React.ReactNode;
  };

  href?: string;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
}

export interface MenuGroup {
  title?: string;
  items: readonly MenuItemConfig[];
}

export type ActionMenuGroups = readonly MenuGroup[];

interface MenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  menuItems: ActionMenuGroups;
  menuDirection?: 'left' | 'right';
  anchorOrigin?: MuiMenuProps['anchorOrigin'];
  transformOrigin?: MuiMenuProps['transformOrigin'];
}
function buildMenuItemKey(item: MenuItemConfig): string {
  return `menu-item-${item.id}`;
}

function buildDividerKey(groupId: string): string {
  return `divider-${groupId}`;
}

interface MenuItemComponentProps {
  item: MenuItemConfig;
  onClose: () => void;
  reserveEndIconSpace?: boolean;
}

function MenuItemComponent({ item, onClose, reserveEndIconSpace }: Readonly<MenuItemComponentProps>) {
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
      <Box sx={styles.menuItemText}>{item.text.name}</Box>

      {reserveEndIconSpace && <Box sx={styles.menuItemEndIcon}>{item.selected && <Check size={20} />}</Box>}
    </Box>
  );

  return (
    <MenuItem
      component={item.href ? Link : 'li'}
      href={item.href}
      selected={item.selected}
      disabled={item.disabled}
      sx={styles.menuItem}
      onClick={handleClick}
    >
      {content}
    </MenuItem>
  );
}
function deriveGroupId(group: readonly MenuItemConfig[]): string {
  return group.map((item) => item.id).join('-');
}

function buildMenuList(groups: ActionMenuGroups, onClose: () => void, hasSelectedItems: boolean): React.ReactNode[] {
  return groups.flatMap((group, groupIndex) => {
    const groupId = deriveGroupId(group.items);

    const menuItems = group.items.map((item) => (
      <MenuItemComponent
        key={buildMenuItemKey(item)}
        item={item}
        onClose={onClose}
        reserveEndIconSpace={hasSelectedItems}
      />
    ));

    if (group.title) {
      menuItems.unshift(
        <ListSubheader key={`title-${groupId}`} sx={styles.menuGroupTitle}>
          {group.title}
        </ListSubheader>
      );
    }

    const isLastGroup = groupIndex === groups.length - 1;
    if (isLastGroup) return menuItems;

    const divider = <Box key={buildDividerKey(groupId)} data-testid="menu-divider" sx={styles.divider} />;

    return [...menuItems, divider];
  });
}

const ActionMenu = ({
  anchorEl,
  onClose,
  menuItems = [],
  menuDirection = 'right',
  anchorOrigin,
  transformOrigin
}: MenuProps) => {
  const hasSelectedItems = useMemo(
    () => menuItems.some((group) => group.items.some((item) => item.selected)),
    [menuItems]
  );

  const menuList = useMemo(
    () => buildMenuList(menuItems, onClose, hasSelectedItems),
    [menuItems, onClose, hasSelectedItems]
  );

  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (!anchorEl) return;

    const handleScroll = () => {
      onClose();
    };
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [anchorEl, onClose]);

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
      anchorOrigin={
        anchorOrigin ?? {
          vertical: 'top',
          horizontal: menuDirection === 'right' ? 'left' : 'right'
        }
      }
      transformOrigin={
        transformOrigin ?? {
          vertical: 'top',
          horizontal: menuDirection === 'right' ? 'right' : 'left'
        }
      }
    />
  );
};

export default ActionMenu;
