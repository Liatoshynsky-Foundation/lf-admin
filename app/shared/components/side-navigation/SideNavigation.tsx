'use client';
import { Box, Divider, IconButton, List } from '@mui/material';
import ListSubheader from '@mui/material/ListSubheader';
import { AdditionalElement, ListElementType } from 'app/types/sideNavigation';
import Image from 'next/image';
import { useState } from 'react';

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

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(!open);

  function renderItems(items: (ListElementType | AdditionalElement)[]) {
    return items.map((item) => {
      if (isAdditionalElement(item)) {
        return <CollapseListNavigation key={item.element.title} openNavbar={open} elementProps={item} />;
      } else if (isLinkElement(item)) {
        return <LinkElement key={item.title} element={item} open={open} />;
      }
      throw new Error('Invalid navigation item');
    });
  }

  return (
    <>
      <Box sx={{ height: '100vh', width: open ? '280px' : '105px', flexShrink: 0 }} />
      <Box component="nav" sx={{ ...styles.drawerPaper, width: open ? '280px' : '105px' }}>
        <Box sx={styles.topSection}>
          <IconButton onClick={handleOpen} size="small">
            <Image src="/icons/logo.svg" alt="logo" width={54} height={55} />
          </IconButton>
          {open && (
            <IconButton onClick={handleClose} sx={styles.hideBtn}>
              <Image src="/icons/doubleArrowLeft.svg" alt="close button" width={24} height={24} />
            </IconButton>
          )}
        </Box>
        <List>
          {renderItems(NAVIGATION_DATA.main)}
          {open && <ListSubheader sx={{ ...styles.subheader, ...styles.divider }}>Контент</ListSubheader>}
          {renderItems(NAVIGATION_DATA.content)}
          <Divider sx={styles.divider} />
          {open && <ListSubheader sx={{ ...styles.subheader, ...styles.divider }}>Інше</ListSubheader>}
          {renderItems(NAVIGATION_DATA.other)}
        </List>
      </Box>
    </>
  );
};
