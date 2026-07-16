import { Box, ListSubheader, MenuItem, PopoverOrigin } from '@mui/material';
import { Check } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useMemo } from 'react';

import styles from './ActionMenu.styles';
import DropdownMenu from './DropdownMenu';
import { useMenuScrollClose } from '~/shared/hooks/use-menu-scroll-close/useMenuScrollClose';

export interface MenuItemConfig {
  id: string;
  text: {
    name: string;
    icon?: React.ReactNode;
  };

  href?: string;
  onClick?: () => void;
  selected?: boolean;
}

export interface MenuGroup {
  title?: string;
  items: readonly MenuItemConfig[];
}

export type ActionMenuGroups = readonly MenuGroup[];

export interface MenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  menuItems: ActionMenuGroups;
  anchorOrigin?: PopoverOrigin;
  transformOrigin?: PopoverOrigin;
  isSelectable?: boolean;
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
  isSelectable?: boolean;
}

function MenuItemComponent({ item, onClose, isSelectable }: Readonly<MenuItemComponentProps>) {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLLIElement>) => {
      e.stopPropagation();

      item.onClick?.();
      onClose();
    },
    [item, onClose]
  );

  const content = (
    <Box sx={styles.menuContent}>
      <Box sx={styles.menuItemContent}>
        {item.text.icon && (
          <Box component="span" sx={styles.menuItemIcon}>
            {item.text.icon}
          </Box>
        )}
        <Box sx={styles.menuItemText}>{item.text.name}</Box>
      </Box>

      {isSelectable && <Box sx={styles.menuItemEndIcon}>{item.selected && <Check size={20} />}</Box>}
    </Box>
  );

  return (
    <MenuItem
      component={item.href ? Link : 'li'}
      href={item.href}
      selected={item.selected}
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

function buildMenuList(groups: ActionMenuGroups, onClose: () => void, isSelectable: boolean): React.ReactNode[] {
  return groups.flatMap((group, groupIndex) => {
    const groupId = deriveGroupId(group.items);

    const menuItems = group.items.map((item) => (
      <MenuItemComponent key={buildMenuItemKey(item)} item={item} onClose={onClose} isSelectable={isSelectable} />
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
  anchorOrigin,
  transformOrigin,
  isSelectable = false
}: MenuProps) => {
  const { disableTransition, handleClose } = useMenuScrollClose({
    onClose,
    anchorEl
  });

  const menuList = useMemo(
    () => buildMenuList(menuItems, handleClose, isSelectable),
    [menuItems, handleClose, isSelectable]
  );

  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
  }, []);

  return (
    <DropdownMenu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleClose}
      transitionDuration={disableTransition ? 0 : undefined}
      menuList={menuList}
      sx={styles.menu}
      disableAutoFocusItem
      disableScrollLock
      
      slotProps={{
        backdrop: {
          onClick: handleBackdropClick
        }
      }}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
    />
  );
};

export default ActionMenu;
