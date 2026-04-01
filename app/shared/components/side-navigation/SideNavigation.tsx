'use client';
import { Box, Divider, IconButton, List } from '@mui/material';
import ListSubheader from '@mui/material/ListSubheader';
import { AdditionalElement, ListElementType } from 'app/types/sideNavigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useState } from 'react';

import { CollapseListNavigation } from './collapse-list-navigation/CollapseListNavigation';
import { LinkElement } from './link-element/LinkElement';
import { NAVIGATION_DATA } from './SideNavigation.consts';
import { styles } from './SideNavigation.styles';

function isAdditionalElement(item: ListElementType | AdditionalElement): item is AdditionalElement {
  return 'collapseElements' in item && 'element' in item;
}

function isLinkElement(item: ListElementType | AdditionalElement): item is ListElementType {
  return !('collapseElements' in item && 'element' in item);
}

export const SideBarNavigation = () => {
  const [open, setOpen] = useState(true);
  const [expandedSubmenus, setExpandedSubmenus] = useState<Set<string>>(new Set());

  const handleToggle = () => setOpen(!open);

  const handleSubmenuExpansion = useCallback((key: string, isExpanded: boolean) => {
    setExpandedSubmenus((prev) => {
      const newSet = new Set(prev);
      if (isExpanded) {
        newSet.add(key);
      } else {
        newSet.delete(key);
      }
      return newSet;
    });
  }, []);

  function renderItems(items: (ListElementType | AdditionalElement)[]) {
    return items.map((item) => {
      if (isAdditionalElement(item)) {
        return (
          <CollapseListNavigation
            key={item.element.title}
            openNavbar={open}
            elementProps={item}
            onExpansionChange={(isExpanded) => handleSubmenuExpansion(item.element.title, isExpanded)}
          />
        );
      } else if (isLinkElement(item)) {
        return <LinkElement key={item.title} element={item} open={open} />;
      }
      throw new Error('Invalid navigation item');
    });
  }

  const hasExpandedSubmenu = expandedSubmenus.size > 0;
  const w = open || hasExpandedSubmenu ? '264px' : '80px';
  const l = open || hasExpandedSubmenu ? 264 - 16 : 80 - 16;

  return (
    <Box sx={{ height: '100vh', width: w, flexShrink: 0 }}>
      <Box component="nav" sx={{ ...styles.drawerPaper, width: w, pt: open ? '32px' : '40px' }}>
        <IconButton aria-label="toggle sidebar" onClick={handleToggle} sx={{ ...styles.hideBtn, left: l }}>
          <Image src={`/icons/chevron${open ? 'Left' : 'Right'}.svg`} alt="" width={24} height={24} />
        </IconButton>
        <Box sx={styles.topSection}>
          <Link href="/" aria-label="go to home page" style={{ textDecoration: 'none' }}>
            <Box sx={styles.logoBlock}>
              <Image src="/icons/logo.svg" alt="logo" width={open ? 63.85 : 80} height={open ? 24.22 : 32} />
              {open && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Image src="/icons/Liatoshinsky-text.svg" alt="Liatoshinsky" width={146.28} height={17.97} />
                  <Image src="/icons/foundation-text.svg" alt="Foundation" width={63.85} height={24.22} />
                </Box>
              )}
            </Box>
          </Link>
        </Box>
        <Box sx={styles.navigationContent}>
          <Box sx={{ height: open ? 40 : 64 }} />
          <List sx={{ p: 0 }}>
            {renderItems(NAVIGATION_DATA.main)}
            {open && <ListSubheader sx={{ ...styles.subheader, ...styles.divider }}>Контент</ListSubheader>}
            {renderItems(NAVIGATION_DATA.content)}
            <Divider sx={styles.divider} />
            {open && <ListSubheader sx={{ ...styles.subheader, ...styles.divider }}>Інше</ListSubheader>}
            {renderItems(NAVIGATION_DATA.other)}
          </List>
        </Box>
      </Box>
    </Box>
  );
};
