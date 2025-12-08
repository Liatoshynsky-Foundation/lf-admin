import { Box, Collapse, List } from '@mui/material';
import { CollapseListNavigationProps } from 'app/types/sideNavigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { LinkElement } from '../link-element/LinkElement';
import { ListElement } from '../list-element/ListElement';
import { styles as SideNavigationStyles } from '../SideNavigation.styles';
import { styles } from './CollapeListNavigation.styles';

export const CollapseListNavigation: React.FC<CollapseListNavigationProps> = ({ openNavbar, elementProps }) => {
  const { element, collapseElements } = elementProps;
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);

  const handleClick = () => {
    setIsSubmenuOpen(!isSubmenuOpen);
  };

  useEffect(() => {
    if (!openNavbar) {
      setIsSubmenuOpen(false);
    }
  }, [openNavbar]);

  const collapseContent = collapseElements?.map((item) => (
    <LinkElement element={item} open={isSubmenuOpen} key={item.title} sxItem={{ mb: '0' }} />
  ));

  return (
    <>
      <ListElement element={element} open={openNavbar} handleClick={handleClick} sxItem={{ mb: '0' }}>
        <Box
          sx={{
            ...SideNavigationStyles.hideInClosed(openNavbar),
            ...styles.listBox
          }}
        >
          {isSubmenuOpen ? (
            <Image src="/icons/chevronDown.svg" alt="open list" width={24} height={24} />
          ) : (
            <Image src="/icons/chevronRight.svg" alt="close list" width={24} height={24} />
          )}
        </Box>
      </ListElement>
      <Collapse in={isSubmenuOpen} timeout="auto" unmountOnExit sx={styles.collapse}>
        <List disablePadding>{collapseContent}</List>
      </Collapse>
    </>
  );
};
