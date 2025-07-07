'use client';
import { Box, Drawer, IconButton, List } from '@mui/material';
import { ListElementType } from 'app/types/sideNavigation';
import Image from 'next/image';
import { useState } from 'react';

import { CollapseListNavigation } from './collapse-list-navigation/CollapseListNavigation';
import { Divider } from './divider/Divider';
import { LinkElement } from './link-element/LinkElement';
import { NAVIGATION_DATA } from './SideNavigation.consts';
import { styles } from './SideNavigation.styles';

export const SideBarNavgation = () => {
  const [open, setOpen] = useState(true);

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(!open);

  const mainContent = NAVIGATION_DATA.mainGroup.map((item) => (
    <LinkElement element={item as ListElementType} open={open} key={item.href} />
  ));
  const pagesContent = NAVIGATION_DATA.pages.map((item) => {
    if (item.collapseElements) {
      return <CollapseListNavigation key={item.title} openNavbar={open} elementProps={item} />;
    } else {
      return <LinkElement element={item as ListElementType} open={open} key={item.href} />;
    }
  });
  const settingsContent = NAVIGATION_DATA.settings.map((item) => (
    <LinkElement element={item as ListElementType} open={open} key={item.href} />
  ));

  return (
    <Drawer
      anchor="left"
      variant="permanent"
      open={open}
      hideBackdrop
      sx={{
        width: open ? '280px' : '105px',
        ...styles.drawerPaper
      }}
    >
      <Box sx={styles.topSection}>
        <IconButton onClick={handleOpen} size="small">
          <Image src="./icons/logo.svg" alt="logo" width={54} height={55} />
        </IconButton>
        {open && (
          <IconButton onClick={handleClose} sx={styles.hideBtn}>
            <Image src="./icons/doubleArrowLeft.svg" alt="close button" width={24} height={24} />
          </IconButton>
        )}
      </Box>
      <List>
        {mainContent}
        <Divider text="Сторінки сайту" open={open} />
        {pagesContent}
        <Divider text="Налаштування сайту" open={open} />
        {settingsContent}
      </List>
    </Drawer>
  );
};
