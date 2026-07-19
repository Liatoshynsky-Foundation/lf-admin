'use client';
import { Box, Divider, IconButton, List } from '@mui/material';
import ListSubheader from '@mui/material/ListSubheader';
import { AdditionalElement, ListElementType } from 'app/types/sideNavigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useState } from 'react';

import LogoutModal from '../logout-modal/LogoutModal';
import { CollapseListNavigation } from './collapse-list-navigation/CollapseListNavigation';
import { LinkElement } from './link-element/LinkElement';
import { NAVIGATION_DATA } from './SideNavigation.consts';
import { styles } from './SideNavigation.styles';
import { useNavigationGuard } from '~/shared/hooks/use-navigation-guard/useNavigationGuard';

function isAdditionalElement(item: ListElementType | AdditionalElement): item is AdditionalElement {
  return 'collapseElements' in item && 'element' in item;
}

export const SideBarNavigation = () => {
  const [open, setOpen] = useState(true);
  const [expandedSubmenus, setExpandedSubmenus] = useState<Set<string>>(new Set());
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);

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

  const { interceptLinkClick } = useNavigationGuard();

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
      }

      const isLogoutBtn = item.title === 'Вийти';
      return (
        <LinkElement
          key={item.title}
          element={isLogoutBtn ? { ...item, href: '#' } : item}
          open={open}
          onClick={
            isLogoutBtn
              ? (e) => {
                e.preventDefault();
                setIsLogoutModalOpen(true);
              }
              : undefined
          }
        />
      );
    });
  }

  const hasExpandedSubmenu = expandedSubmenus.size > 0;
  const w = open || hasExpandedSubmenu ? 264 : 80;
  const l = open || hasExpandedSubmenu ? 264 - 16 : 80 - 16;

  return (
    <>
      <Box sx={styles.wrapper(w)}>
        <Box component="nav" sx={styles.drawerPaper(w, open)}>
          <IconButton aria-label="toggle sidebar" onClick={handleToggle} sx={styles.hideBtn(l)}>
            <Image src={`/icons/chevron${open ? 'Left' : 'Right'}.svg`} alt="" width={24} height={24} />
          </IconButton>
          <Box sx={styles.topSection}>
            <Link
              href="/"
              aria-label="go to home page"
              style={{ textDecoration: 'none' }}
              onClick={(e) => interceptLinkClick(e, '/')}
            >
              <Box sx={styles.logoBlock}>
                <Image src="/icons/logo.svg" alt="logo" width={open ? 63.85 : 80} height={open ? 24.22 : 32} />
                {open && (
                  <Box sx={styles.logoTextContainer}>
                    <Image src="/icons/Liatoshinsky-text.svg" alt="Liatoshinsky" width={146.28} height={17.97} />
                    <Image src="/icons/foundation-text.svg" alt="Foundation" width={63.85} height={24.22} />
                  </Box>
                )}
              </Box>
            </Link>
          </Box>
          <Box sx={styles.navigationContent}>
            <Box sx={styles.spacer(open)} />
            <List sx={styles.list}>
              {renderItems(NAVIGATION_DATA.main)}
              <Divider sx={styles.divider} />
              {open && <ListSubheader sx={styles.subheader}>Контент</ListSubheader>}
              {renderItems(NAVIGATION_DATA.content)}
              <Divider sx={styles.divider} />
              {open && <ListSubheader sx={styles.subheader}>Інше</ListSubheader>}
              {renderItems(NAVIGATION_DATA.other)}
            </List>
          </Box>
          {renderItems(NAVIGATION_DATA.footer)}
        </Box>
      </Box>
      <LogoutModal open={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} />
    </>
  );
};
